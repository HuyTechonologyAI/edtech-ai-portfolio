import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { processContentForIngestion } from "@/lib/embeddings";

// ============================================================================
// Knowledge CRUD API - Quản lý tri thức cho hệ thống EdTech
// ============================================================================
// GET  : Liệt kê tất cả knowledge chunks (phân trang, nhóm theo source)
// POST : Nạp nội dung mới → tách chunk → tạo embedding → lưu DB
// DELETE: Xóa chunks theo source_type + source_id
// ============================================================================

/**
 * Kiểm tra quyền admin thông qua cookie phiên đăng nhập
 * Cookie "admin_session" phải có giá trị "authenticated"
 */
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}

// ----------------------------------------------------------------------------
// GET /api/knowledge
// Trả về danh sách knowledge chunks có phân trang, nhóm theo source_title
// Query params: page (mặc định 1), limit (mặc định 20), source_type (tùy chọn)
// Không yêu cầu đăng nhập admin
// ----------------------------------------------------------------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Phân trang: mặc định trang 1, mỗi trang 20 bản ghi
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const sourceType = searchParams.get("source_type");

    // Tính offset cho phân trang (Supabase dùng range 0-indexed)
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Xây dựng query cơ bản - lấy tất cả trừ embedding (quá lớn)
    let query = supabaseAdmin
      .from("knowledge_chunks")
      .select("id, source_type, source_id, source_title, chunk_index, content, metadata, created_at", {
        count: "exact",
      });

    // Lọc theo source_type nếu được chỉ định (VD: 'RESOURCE', 'VIDEO')
    if (sourceType) {
      query = query.eq("source_type", sourceType.toUpperCase());
    }

    // Sắp xếp theo source_title → chunk_index để nhóm hợp lý
    query = query
      .order("source_title", { ascending: true })
      .order("chunk_index", { ascending: true })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Nhóm kết quả theo source_title để frontend dễ hiển thị
    // Mỗi nhóm chứa: source info + số lượng chunks + danh sách chunks
    const grouped: Record<
      string,
      {
        source_title: string;
        source_type: string;
        source_id: string | null;
        chunk_count: number;
        chunks: typeof data;
      }
    > = {};

    for (const chunk of data || []) {
      const key = `${chunk.source_type}::${chunk.source_id || chunk.source_title}`;
      if (!grouped[key]) {
        grouped[key] = {
          source_title: chunk.source_title,
          source_type: chunk.source_type,
          source_id: chunk.source_id,
          chunk_count: 0,
          chunks: [],
        };
      }
      grouped[key].chunk_count++;
      grouped[key].chunks.push(chunk);
    }

    return NextResponse.json({
      success: true,
      data: Object.values(grouped),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: unknown) {
    console.error("[Knowledge GET] Error:", error);
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------------
// POST /api/knowledge
// Nạp nội dung mới vào knowledge base
// Body: { content, sourceTitle, sourceType, sourceId?, metadata? }
// Pipeline: content → chunk text → generate embeddings → insert knowledge_chunks
// Yêu cầu đăng nhập admin
// ----------------------------------------------------------------------------
export async function POST(req: Request) {
  // Kiểm tra quyền admin trước khi xử lý
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Yêu cầu đăng nhập admin" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { content, sourceTitle, sourceType, sourceId, metadata } = body;

    // === Validation: Kiểm tra các trường bắt buộc ===
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Trường 'content' là bắt buộc và không được rỗng" },
        { status: 400 }
      );
    }

    if (!sourceTitle || typeof sourceTitle !== "string") {
      return NextResponse.json(
        { success: false, error: "Trường 'sourceTitle' là bắt buộc" },
        { status: 400 }
      );
    }

    if (!sourceType || typeof sourceType !== "string") {
      return NextResponse.json(
        { success: false, error: "Trường 'sourceType' là bắt buộc" },
        { status: 400 }
      );
    }

    // Giới hạn độ dài nội dung để tránh lạm dụng (tối đa 50,000 ký tự)
    if (content.length > 50000) {
      return NextResponse.json(
        { success: false, error: "Nội dung quá dài, tối đa 50,000 ký tự" },
        { status: 400 }
      );
    }

    // === Pipeline: Tách chunk và tạo embedding ===
    // processContentForIngestion sẽ: text → chunks (800 chars) → embeddings (768-dim)
    const processed = await processContentForIngestion(content);

    if (processed.length === 0) {
      return NextResponse.json(
        { success: false, error: "Không thể tạo chunks từ nội dung đã cho" },
        { status: 400 }
      );
    }

    // === Chuẩn bị dữ liệu để insert vào knowledge_chunks table ===
    // Mỗi chunk sẽ được lưu với: nội dung, embedding vector, metadata, và thông tin nguồn
    const rows = processed.map(({ chunk, embedding }, index) => ({
      source_type: sourceType.toUpperCase(),
      source_id: sourceId || null,
      source_title: sourceTitle,
      chunk_index: index,
      content: chunk,
      // Embedding column (vector(768)) - chuyển sang JSON string để Supabase parse
      embedding: JSON.stringify(embedding),
      metadata: metadata || {},
    }));

    // === Insert vào database ===
    const { data, error } = await supabaseAdmin
      .from("knowledge_chunks")
      .insert(rows)
      .select("id, chunk_index, source_title");

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Đã nạp ${processed.length} chunks thành công`,
      stats: {
        totalChunks: processed.length,
        sourceTitle,
        sourceType: sourceType.toUpperCase(),
      },
      insertedIds: (data || []).map((row) => row.id),
    });
  } catch (error: unknown) {
    console.error("[Knowledge POST] Error:", error);
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------------
// DELETE /api/knowledge
// Xóa tất cả chunks thuộc một source cụ thể
// Query params: source_type (bắt buộc), source_id (bắt buộc)
// Yêu cầu đăng nhập admin
// ----------------------------------------------------------------------------
export async function DELETE(req: Request) {
  // Kiểm tra quyền admin trước khi xử lý
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Yêu cầu đăng nhập admin" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const sourceType = searchParams.get("source_type");
    const sourceId = searchParams.get("source_id");

    // Cả source_type và source_id đều bắt buộc để tránh xóa nhầm
    if (!sourceType) {
      return NextResponse.json(
        { success: false, error: "Thiếu tham số 'source_type'" },
        { status: 400 }
      );
    }

    if (!sourceId) {
      return NextResponse.json(
        { success: false, error: "Thiếu tham số 'source_id'" },
        { status: 400 }
      );
    }

    // Xóa tất cả chunks khớp với source_type + source_id
    const { error, count } = await supabaseAdmin
      .from("knowledge_chunks")
      .delete({ count: "exact" })
      .eq("source_type", sourceType.toUpperCase())
      .eq("source_id", sourceId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Đã xóa ${count || 0} chunks cho ${sourceType}/${sourceId}`,
      deletedCount: count || 0,
    });
  } catch (error: unknown) {
    console.error("[Knowledge DELETE] Error:", error);
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
