import { AppHeader } from "@/components/v2/AppHeader";
import { AppFooter } from "@/components/v2/AppFooter";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#04070D] flex flex-col font-sans">
      <AppHeader />
      <main className="flex-grow flex items-center justify-center pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-white mb-6">Chính Sách Bảo Mật</h1>
          <div className="prose prose-invert max-w-none text-slate-300">
            <p>Bản cập nhật cuối: 04/10/2026</p>
            <p>Hệ sinh thái HUY TECHNOLOGY AI GROUP cam kết bảo vệ dữ liệu cá nhân của người dùng.</p>
            <h2>1. Thu thập dữ liệu</h2>
            <p>Chúng tôi chỉ thu thập các thông tin cần thiết phục vụ cho việc vận hành AI Agency và các dịch vụ tự động hóa.</p>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
