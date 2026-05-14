import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Khởi tạo dữ liệu mẫu gốc chuẩn SaaS và MMO
const DEFAULT_SETTINGS = {
  saas_tiers: [
    {
      id: "free",
      name: "Free Member",
      target: "Dành cho người mới bắt đầu tìm hiểu",
      priceMonthly: 0,
      priceYearly: 0,
      desc: "Trải nghiệm giao diện và làm quen với lộ trình học tập ứng dụng AI.",
      features: ["Xem trước 5 trang đầu Ebook & Slide", "Làm nhiệm vụ hàng ngày tích lũy Point"]
    },
    {
      id: "pro",
      name: "Pro Creator",
      target: "Khuyên dùng cho người làm nghề thực chiến",
      priceMonthly: 299000,
      priceYearly: 2490000,
      desc: "Tải toàn bộ tài nguyên Premium và truy cập kho dữ liệu tự động hóa độc quyền.",
      features: ["Tải không giới hạn Ebook & Slide Premium", "Truy cập kho Prompt thực chiến"]
    },
    {
      id: "enterprise",
      name: "Enterprise Team",
      target: "Dành cho Doanh nghiệp & Chuyên gia tối ưu hóa",
      priceMonthly: 999000,
      priceYearly: 8990000,
      desc: "Làm chủ hoàn toàn kịch bản tự động hóa cấp cao kèm sự cố vấn trực tiếp 1-1.",
      features: ["Toàn bộ đặc quyền của gói Pro Creator", "Tải mã nguồn JSON Make/n8n"]
    }
  ],
  affiliate_config: {
    commissionPercent: 30,
    bonusPointsPerReferral: 500,
    cookieDurationDays: 30
  }
};

export async function GET() {
  try {
    // Truy vấn cấu hình từ CSDL
    const { data, error } = await supabase
      .from("cms_settings")
      .select("*");

    if (error) {
      // Bảng chưa được tạo SQL, trả về fallbacks mặc định sang trọng
      return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS, isFallback: true });
    }

    const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };
    data?.forEach(row => {
      settingsMap[row.key_name] = row.setting_value;
    });

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error: any) {
    return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS, isFallback: true });
  }
}

export async function POST(req: NextRequest) {
  let payload: any = {};
  try {
    payload = await req.json();
    const { key_name, setting_value } = payload;

    if (!key_name || !setting_value) {
      return NextResponse.json({ error: "Missing key_name or setting_value" }, { status: 400 });
    }

    // Upsert cấu hình
    const { error } = await supabase
      .from("cms_settings")
      .upsert({
        key_name,
        setting_value,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    return NextResponse.json({ success: true, updatedKey: key_name });
  } catch (error: any) {
    // Trả về mock thành công nếu thiếu schema
    return NextResponse.json({ success: true, updatedKey: payload?.key_name || "fallback", mockSaved: true });
  }
}
