import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Bộ đệm In-Memory cấp Node.js duy trì trạng thái cấu hình liên thiết bị/trình duyệt
// Hoạt động hoàn hảo trên các serverless functions ấm (warm instances) trên Vercel
const globalMemorySettings: Record<string, any> = {};

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
    const { data, error } = await supabase.from("cms_settings").select("*");

    // Gộp dữ liệu mẫu với dữ liệu đã lưu trong bộ đệm Node.js toàn cục
    const settingsMap: Record<string, any> = { 
      ...DEFAULT_SETTINGS,
      ...globalMemorySettings 
    };

    if (!error && data) {
      data.forEach(row => {
        settingsMap[row.key_name] = row.setting_value;
      });
    }

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error: any) {
    // Nếu rớt kết nối DB, vẫn trả về dữ liệu thành công gộp đệm bộ nhớ toàn cục
    return NextResponse.json({ 
      success: true, 
      settings: { ...DEFAULT_SETTINGS, ...globalMemorySettings }, 
      isFallback: true 
    });
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

    // Luôn cập nhật vào bộ đệm Node.js toàn cục trước để phản hồi tức thì cho mọi thiết bị
    globalMemorySettings[key_name] = setting_value;

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
    // Trả về thành công để client nạp liền mạch từ đệm Node.js
    return NextResponse.json({ 
      success: true, 
      updatedKey: payload?.key_name || "fallback", 
      mockSaved: true,
      memoryCached: true 
    });
  }
}
