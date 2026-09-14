"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabase } from "@/lib/supabase";

export async function submitContact(formData: FormData) {
  const name = (formData.get('name') as string || "").trim();
  const email = (formData.get('email') as string || "").trim();
  const company = (formData.get('company') as string || "").trim();
  const message = (formData.get('message') as string || "").trim();

  if (!name || !email || !message) {
    return { success: false, error: 'Vui lòng điền đầy đủ các trường bắt buộc (Họ tên, Email, Nội dung).' };
  }

  try {
    // 1. Lưu vào bảng contacts bằng supabaseAdmin (bỏ qua giới hạn RLS)
    const client = supabaseAdmin || supabase;
    const { error: contactError } = await client
      .from('contacts')
      .insert([
        { name, email, company, message }
      ]);

    if (contactError) {
      console.warn('Lưu vào contacts bảng gặp lỗi, thử lưu tiếp vào leads:', contactError.message);
    }

    // 2. Tự động đồng bộ sang bảng leads để hiển thị ngay trong Quản lý Leads của Admin CMS
    try {
      await client
        .from('leads')
        .insert([
          {
            email,
            full_name: name,
            source: 'CONTACT_FORM',
            target_item_title: company ? `Doanh nghiệp: ${company}` : 'Yêu cầu tư vấn chuyển đổi số',
            metadata: {
              company,
              message,
              submittedAt: new Date().toISOString()
            }
          }
        ]);
    } catch (leadErr) {
      console.warn('Lưu vào leads gặp cảnh báo:', leadErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi gửi liên hệ:', err);
    return { success: false, error: err.message || 'Lỗi hệ thống khi gửi thông tin liên hệ.' };
  }
}
