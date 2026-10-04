import { AppHeader } from "@/components/v2/AppHeader";
import { AppFooter } from "@/components/v2/AppFooter";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#04070D] flex flex-col font-sans">
      <AppHeader />
      <main className="flex-grow flex items-center justify-center pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-white mb-6">Điều Khoản Dịch Vụ</h1>
          <div className="prose prose-invert max-w-none text-slate-300">
            <p>Bản cập nhật cuối: 04/10/2026</p>
            <p>Bằng việc sử dụng các dịch vụ của HUY TECHNOLOGY AI GROUP, bạn đồng ý với các điều khoản sau.</p>
            <h2>1. Trách nhiệm người dùng</h2>
            <p>Bạn không được sử dụng AI để tạo ra nội dung vi phạm pháp luật, thuần phong mỹ tục, hoặc các chính sách của nền tảng bên thứ ba.</p>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
