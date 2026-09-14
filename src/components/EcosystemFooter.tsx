import Link from "next/link";
import { 
  ExternalLink, 
  GraduationCap, 
  FileSpreadsheet, 
  Cpu, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Award, 
  Sparkles,
  Zap,
  Globe2
} from "lucide-react";

export function EcosystemFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/60 bg-gradient-to-b from-background via-slate-950/80 to-slate-950 text-foreground/80 mt-auto overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ff85]/40 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#00ff85]/5 blur-3xl rounded-full pointer-events-none" />

      {/* Top Banner: 3-Platform Ecosystem Banner */}
      <div className="border-b border-border/30 bg-slate-900/40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#00ff85]/20 to-cyan-500/20 border border-[#00ff85]/30 text-[#00ff85]">
                <Globe2 className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#00ff85] tracking-wider uppercase flex items-center gap-1.5 justify-center md:justify-start">
                  <Sparkles className="w-3.5 h-3.5" /> Hệ sinh thái Công nghệ Huy Technology AI
                </div>
                <div className="text-sm text-foreground/90 font-medium">
                  Kết nối đồng bộ 3 giải pháp tiên phong: Giáo dục EduTech - Tài chính FinTech - Tự động hóa Doanh nghiệp
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href="https://gvcncdsai.io.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-medium transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>EduViet AI</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </a>
              <a
                href="https://smarttax-ai.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>SmartTax AI</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </a>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00ff85]/15 border border-[#00ff85]/40 text-[#00ff85] text-xs font-bold shadow-[0_0_12px_rgba(0,255,133,0.2)]">
                <Cpu className="w-3.5 h-3.5" />
                <span>AI & AutoExpert (Hiện tại)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Founder Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="font-bold text-2xl tracking-tight flex items-center gap-2">
              <span>AI & Auto</span>
              <span className="text-secondary neon-glow-text">Expert</span>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed max-w-sm">
              Nền tảng đào tạo thực chiến & giải pháp Trí tuệ nhân tạo (AI Agent, n8n, Make.com) được sáng lập bởi 
              <strong className="text-foreground"> ThS. Ngô Quốc Huy</strong> thuộc hệ sinh thái công nghệ 
              <strong className="text-secondary"> Huy Technology AI Hub</strong> (Vạn Hỏa Long Tech).
            </p>

            <div className="pt-2 space-y-2 text-xs text-foreground/60">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#00ff85]" />
                <span>Hotline / Zalo: <a href="tel:0961364600" className="text-foreground/90 font-bold hover:text-secondary transition-colors">0961 364 600</a></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Hỗ trợ kỹ thuật: <a href="mailto:huytechnologyai2025@gmail.com" className="text-foreground/90 font-bold hover:text-cyan-400 transition-colors">huytechnologyai2025@gmail.com</a></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Việt Nam • Đào tạo & Chuyển giao công nghệ toàn quốc</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Bảo mật & Chứng chỉ số
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" /> Tối ưu x10 Hiệu suất
              </div>
            </div>
          </div>

          {/* Col 2: Hệ sinh thái liên kết */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-[#00ff85]" /> Hệ Sinh Thái AI
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="https://gvcncdsai.io.vn" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block hover:text-cyan-400 transition-colors"
                >
                  <div className="font-medium flex items-center justify-between">
                    <span>EduViet - Smart Teacher</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-foreground/50">Trợ lý Giáo viên 4.0 (CV 5512, TT 22)</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://smarttax-ai.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block hover:text-amber-400 transition-colors"
                >
                  <div className="font-medium flex items-center justify-between">
                    <span>SmartTax AI</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-foreground/50">Kê khai thuế & Kế toán AI</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://huycncdsai.io.vn" 
                  className="group block text-secondary font-medium"
                >
                  <div className="flex items-center justify-between">
                    <span>AI & AutoExpert Hub</span>
                    <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded">Hiện tại</span>
                  </div>
                  <span className="text-xs text-foreground/50">Đào tạo AI & Tự động hóa n8n</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Khóa học & Tài nguyên */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" /> Chương Trình
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/roadmap" className="hover:text-secondary transition-colors">
                  Lộ trình học thực chiến
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-secondary transition-colors">
                  Kho Prompt & Tài liệu AI
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-secondary transition-colors">
                  Thư viện Video bài giảng
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-secondary font-medium hover:underline flex items-center gap-1">
                  <span>💎 Bảng giá Premium & VIP</span>
                </Link>
              </li>
              <li>
                <Link href="/certificate" className="hover:text-secondary transition-colors flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tra cứu Chứng chỉ AI</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Hỗ trợ & Đối tác */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Hỗ Trợ & Đối Tác
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/contact" className="hover:text-secondary transition-colors">
                  Liên hệ & Đặt lịch tư vấn
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
                  <span>🎁 Đổi điểm quà tặng</span>
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  🤝 Đối tác liên kết (Affiliate)
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-foreground/60 hover:text-foreground transition-colors text-xs">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-foreground/40 hover:text-foreground/80 transition-colors text-xs flex items-center gap-1">
                  <span>🔒 Cổng Quản trị Admin</span>
                </Link>
              </li>
              <li className="pt-2 border-t border-border/20 text-xs text-foreground/70">
                <div className="font-semibold text-foreground/90 mb-0.5 flex items-center gap-1">
                  <span>💳 Tài khoản ACB:</span>
                  <span className="font-mono text-[#00ff85]">37780997</span>
                </div>
                <div className="text-[11px] text-foreground/50">Chủ TK: NGO QUOC HUY • CN Tân Mai</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="border-t border-border/30 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foreground/50">
          <div>
            &copy; {currentYear} <strong className="text-foreground/80">Huy Technology AI Hub</strong> — Vạn Hỏa Long Tech. Bản quyền thuộc về ThS. Ngô Quốc Huy.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-400 font-medium">Hệ thống hoạt động 99.9%</span>
            </span>
            <span>•</span>
            <span>Made with Next.js 16 & Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
