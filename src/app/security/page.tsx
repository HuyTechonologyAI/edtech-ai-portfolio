import { AppHeader } from "@/components/v2/AppHeader";
import { AppFooter } from "@/components/v2/AppFooter";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#04070D] flex flex-col font-sans">
      <AppHeader />
      <main className="flex-grow flex items-center justify-center pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-white mb-6">Cam Kết Bảo Mật Dữ Liệu</h1>
          <div className="prose prose-invert max-w-none text-slate-300">
            <p>Bản cập nhật cuối: 04/10/2026</p>
            <p>Hệ thống của chúng tôi áp dụng kiến trúc Zero-Trust và Local AI.</p>
            <h2>1. Xử lý cục bộ (Local Processing)</h2>
            <p>Mọi luồng dữ liệu nhạy cảm được xử lý hoàn toàn trên Node-01 (Dell M4800) không qua API bên ngoài, đảm bảo an toàn tuyệt đối cho người dùng.</p>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
