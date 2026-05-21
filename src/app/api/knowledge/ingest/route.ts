import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabase } from "@/lib/supabase";
import { processContentForIngestion } from "@/lib/embeddings";

// ============================================================================
// Knowledge Auto-Ingestion Pipeline API
// ============================================================================
// POST: Tự động nạp tri thức từ bảng resources và videos có sẵn
// GET : Trả về thống kê trạng thái ingestion hiện tại
// ============================================================================

/**
 * Kiểm tra quyền admin thông qua cookie phiên đăng nhập
 */
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

// ----------------------------------------------------------------------------
// POST /api/knowledge/ingest
// Pipeline tự động nạp tri thức:
//   1. Đọc tất cả resources từ bảng 'resources'
//   2. Đọc tất cả videos từ bảng 'videos'
//   3. Với mỗi resource/video: ghép title + description → chunk → embed → insert
//   4. Trước khi insert, xóa chunks cũ (source_type + source_id) để tránh trùng lặp
//   5. Trả về thống kê tổng hợp
// Yêu cầu đăng nhập admin
// ----------------------------------------------------------------------------
export async function POST() {
  // Kiểm tra quyền admin
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Yêu cầu đăng nhập admin" },
      { status: 401 }
    );
  }

  try {
    // === Bước 1: Fetch tất cả resources ===
    const { data: resources, error: resError } = await supabase
      .from("resources")
      .select("*");

    if (resError) {
      throw new Error(`Lỗi khi đọc bảng resources: ${resError.message}`);
    }

    // === Bước 2: Fetch tất cả videos ===
    const { data: videos, error: vidError } = await supabase
      .from("videos")
      .select("*");

    if (vidError) {
      throw new Error(`Lỗi khi đọc bảng videos: ${vidError.message}`);
    }

    let totalChunks = 0;
    let resourcesProcessed = 0;
    let videosProcessed = 0;
    const errors: string[] = [];

    // === Bước 3: Xử lý từng resource ===
    // Với mỗi resource: ghép title + description thành nội dung để nạp
    for (const resource of resources || []) {
      try {
        const resourceId = String(resource.id);

        // Ghép title và description thành nội dung hoàn chỉnh
        // Title được đặt lên đầu để đảm bảo ngữ cảnh cho mỗi chunk
        const content = [
          `Tài liệu: ${resource.title || ""}`,
          resource.description || "",
        ]
          .filter(Boolean)
          .join("\n\n");

        // Bỏ qua nếu nội dung quá ngắn (không có giá trị tri thức)
        if (content.trim().length < 20) continue;

        // Xóa chunks cũ của resource này trước khi nạp lại (tránh trùng lặp)
        await supabaseAdmin
          .from("knowledge_chunks")
          .delete()
          .eq("source_type", "RESOURCE")
          .eq("source_id", resourceId);

        // Pipeline: content → chunks → embeddings
        const processed = await processContentForIngestion(content);

        if (processed.length === 0) continue;

        // Chuẩn bị rows để insert vào knowledge_chunks
        const rows = processed.map(({ chunk, embedding }, index) => ({
          source_type: "RESOURCE",
          source_id: resourceId,
          source_title: resource.title || `Resource #${resourceId}`,
          chunk_index: index,
          content: chunk,
          embedding: JSON.stringify(embedding),
          metadata: {
            type: resource.type || null,
            link: resource.link || null,
            is_premium: resource.is_premium || false,
          },
        }));

        const { error: insertError } = await supabaseAdmin
          .from("knowledge_chunks")
          .insert(rows);

        if (insertError) {
          errors.push(`Resource "${resource.title}": ${insertError.message}`);
          continue;
        }

        totalChunks += processed.length;
        resourcesProcessed++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`Resource "${resource.title}": ${msg}`);
      }
    }

    // === Bước 4: Xử lý từng video ===
    // Tương tự resources, ghép title + description để nạp tri thức
    for (const video of videos || []) {
      try {
        const videoId = String(video.id);

        // Ghép title và description cho video
        const content = [
          `Video: ${video.title || ""}`,
          video.description || "",
        ]
          .filter(Boolean)
          .join("\n\n");

        // Bỏ qua nếu nội dung quá ngắn
        if (content.trim().length < 20) continue;

        // Xóa chunks cũ của video này trước khi nạp lại
        await supabaseAdmin
          .from("knowledge_chunks")
          .delete()
          .eq("source_type", "VIDEO")
          .eq("source_id", videoId);

        // Pipeline: content → chunks → embeddings
        const processed = await processContentForIngestion(content);

        if (processed.length === 0) continue;

        // Chuẩn bị rows để insert
        const rows = processed.map(({ chunk, embedding }, index) => ({
          source_type: "VIDEO",
          source_id: videoId,
          source_title: video.title || `Video #${videoId}`,
          chunk_index: index,
          content: chunk,
          embedding: JSON.stringify(embedding),
          metadata: {
            youtube_id: video.youtube_id || null,
            category: video.category || null,
          },
        }));

        const { error: insertError } = await supabaseAdmin
          .from("knowledge_chunks")
          .insert(rows);

        if (insertError) {
          errors.push(`Video "${video.title}": ${insertError.message}`);
          continue;
        }

        totalChunks += processed.length;
        videosProcessed++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`Video "${video.title}": ${msg}`);
      }
    }

    // === Bước 5: Trả về thống kê tổng hợp ===
    return NextResponse.json({
      success: true,
      stats: {
        resources: resourcesProcessed,
        videos: videosProcessed,
        totalChunks,
      },
      // Chỉ trả về errors nếu có, để frontend hiển thị cảnh báo
      ...(errors.length > 0 && { errors }),
    });
  } catch (error: unknown) {
    console.error("[Knowledge Ingest POST] Error:", error);
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------------
// GET /api/knowledge/ingest
// Trả về thống kê trạng thái ingestion hiện tại
// Đếm số chunks theo từng source_type để biết dữ liệu đã nạp
// Yêu cầu đăng nhập admin
// ----------------------------------------------------------------------------
export async function GET() {
  // Kiểm tra quyền admin
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Yêu cầu đăng nhập admin" },
      { status: 401 }
    );
  }

  try {
    // Đếm tổng số chunks trong knowledge base
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from("knowledge_chunks")
      .select("id", { count: "exact", head: true });

    if (countError) throw countError;

    // Đếm chunks theo source_type RESOURCE
    const { count: resourceCount, error: resCountError } = await supabaseAdmin
      .from("knowledge_chunks")
      .select("id", { count: "exact", head: true })
      .eq("source_type", "RESOURCE");

    if (resCountError) throw resCountError;

    // Đếm chunks theo source_type VIDEO
    const { count: videoCount, error: vidCountError } = await supabaseAdmin
      .from("knowledge_chunks")
      .select("id", { count: "exact", head: true })
      .eq("source_type", "VIDEO");

    if (vidCountError) throw vidCountError;

    // Đếm chunks theo source_type khác (MANUAL, v.v.)
    const otherCount = (totalCount || 0) - (resourceCount || 0) - (videoCount || 0);

    // Lấy danh sách các source gần nhất được nạp (10 source mới nhất)
    const { data: recentSources, error: recentError } = await supabaseAdmin
      .from("knowledge_chunks")
      .select("source_type, source_id, source_title, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    // Loại bỏ trùng lặp source (giữ bản ghi mới nhất của mỗi source)
    const uniqueSources = Array.from(
      new Map(
        (recentSources || []).map((s) => [
          `${s.source_type}::${s.source_id}`,
          s,
        ])
      ).values()
    );

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCount || 0,
        bySourceType: {
          RESOURCE: resourceCount || 0,
          VIDEO: videoCount || 0,
          OTHER: otherCount,
        },
      },
      recentSources: uniqueSources,
    });
  } catch (error: unknown) {
    console.error("[Knowledge Ingest GET] Error:", error);
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
