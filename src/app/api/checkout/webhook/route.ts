import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    // Khai thác chuỗi nội dung mô tả chuyển khoản từ các provider (Casso/PayOS)
    // VD payload Casso: { data: [{ description: "NGUYEN VAN A CK ZENTRA123456" }] }
    // VD payload PayOS: { data: { description: "ZENTRA123456" } }
    
    let descriptionsString = "";
    if (payload.data && Array.isArray(payload.data)) {
      descriptionsString = payload.data.map((tx: any) => tx.description || "").join(" ");
    } else if (payload.data && payload.data.description) {
      descriptionsString = payload.data.description;
    } else {
      descriptionsString = JSON.stringify(payload);
    }

    // Biểu thức chính quy phát hiện mã thanh toán định danh
    const match = descriptionsString.match(/ZENTRA\d+/i);
    if (!match) {
      return NextResponse.json({ success: false, reason: "Không tìm thấy chuỗi định danh ZENTRA memo" });
    }

    const memoCode = match[0].toUpperCase();

    // 1. Tìm đơn hàng khớp mã
    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("*")
      .eq("memo_code", memoCode)
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ success: false, reason: "Mã memo không tồn tại trong hệ thống đơn hàng" });
    }

    // 2. Gạch nợ đơn hàng
    const { error: updateErr } = await supabase
      .from("orders")
      .update({ status: "SUCCESS", updated_at: new Date().toISOString() })
      .eq("id", order.id);

    if (updateErr) throw updateErr;

    // 3. Tự động nâng cấp quyền hạn tài khoản học viên (is_premium = true)
    if (order.user_id && order.user_id !== "00000000-0000-0000-0000-000000000000") {
      // Gọi module quản trị Admin để gán flag phân quyền cao cấp
      // Bỏ qua lỗi nếu chưa thiết lập cấu trúc Service Role ngầm
      try {
        await supabase.auth.admin.updateUserById(order.user_id, {
          user_metadata: { is_premium: true }
        });
      } catch (authErr) {
        console.log("Cần Service Role Auth Key để tự động gán metadata cho User ID:", order.user_id);
      }
    }

    return NextResponse.json({ success: true, processedMemo: memoCode, orderId: order.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
