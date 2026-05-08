"use server"

import { supabase } from "@/lib/supabase"

export async function submitContact(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const company = formData.get('company') as string
  const message = formData.get('message') as string

  if (!name || !email || !message) {
    return { success: false, error: 'Vui lòng điền đầy đủ các trường bắt buộc.' }
  }

  const { error } = await supabase
    .from('contacts')
    .insert([
      { name, email, company, message }
    ])

  if (error) {
    console.error('Lỗi khi lưu liên hệ:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
