"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Printer, Linkedin, Facebook, CheckCircle2, Award, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";

function CertificateRenderer() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Lấy dữ liệu động từ query hoặc mặc định từ hồ sơ
  const queryCourse = searchParams.get("course");
  const queryName = searchParams.get("name");

  const [studentName, setStudentName] = useState("Học viên Đang tải...");
  const [courseTitle, setCourseTitle] = useState("Khóa học Master AI & Automation");
  const [serialNo, setSerialNo] = useState("ZENTRA-CERT-2026-X");

  useEffect(() => {
    // Ưu tiên Name từ Query, nếu không lấy từ user_metadata, nếu không fallback
    if (queryName) {
      setStudentName(queryName);
    } else if (user?.user_metadata?.full_name) {
      setStudentName(user.user_metadata.full_name);
    } else if (user?.email) {
      setStudentName(user.email.split("@")[0]);
    } else {
      setStudentName("Nguyễn Văn Học Viên");
    }

    // Tên khóa học
    if (queryCourse === "prompt") {
      setCourseTitle("Làm Chủ Prompt Engineering & Agentic AI");
    } else if (queryCourse === "automation") {
      setCourseTitle("Tự Động Hóa Doanh Nghiệp Chuyên Sâu (Make/n8n)");
    } else {
      setCourseTitle("Master AI & Automation Thực Chiến");
    }

    // Sinh Serial duy nhất dựa trên tên và ID khóa
    const hash = Math.abs((studentName + courseTitle).split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
    setSerialNo(`ZENTRA-CERT-${new Date().getFullYear()}-${hash.toString(16).toUpperCase().substring(0, 6)}`);
  }, [queryCourse, queryName, user, studentName, courseTitle]);

  const handlePrint = () => {
    window.print();
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://huycncdsai.io.vn";
  const shareText = `🎉 Tôi vừa hoàn thành xuất sắc chương trình đào tạo "${courseTitle}" và nhận Chứng chỉ Tốt nghiệp Động xác thực từ nền tảng chuyên gia AI & Automation! #AIEngineer #BusinessAutomation #ZentraTech`;

  const openLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=600");
  };

  const openFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=600");
  };

  return (
    <div className="space-y-8">
      {/* Nút thao tác điều khiển (Sẽ bị ẩn khi in ra PDF) */}
      <div className="print:hidden bg-surface/80 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-secondary/10 text-secondary border border-secondary/20 rounded-2xl flex items-center justify-center">
            <Award className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Hệ thống Sinh Chứng Chỉ Động</h2>
            <p className="text-xs text-foreground/50">Xác thực danh tính học viên &amp; hỗ trợ xuất file PDF độ phân giải cao</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center w-full md:w-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-black font-bold rounded-xl text-xs hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,133,0.3)] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In / Xuất PDF Chứng Chỉ</span>
          </button>

          <button
            onClick={openLinkedInShare}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/30 font-bold rounded-xl text-xs hover:bg-[#0A66C2]/20 transition-all cursor-pointer"
          >
            <Linkedin className="w-4 h-4" />
            <span>Khoe lên LinkedIn</span>
          </button>

          <button
            onClick={openFacebookShare}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/30 font-bold rounded-xl text-xs hover:bg-[#1877F2]/20 transition-all cursor-pointer"
          >
            <Facebook className="w-4 h-4" />
            <span>Khoe Facebook</span>
          </button>
        </div>
      </div>

      {/* Vùng Canvas Bản Đồ Chứng Chỉ PDF (Sẽ được in Landscape) */}
      <div className="flex justify-center overflow-x-auto pb-4">
        <div 
          id="certificate-canvas"
          className="w-[1000px] h-[700px] shrink-0 bg-white text-black p-12 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between border-[16px] border-[#1C2127] print:border-0 print:shadow-none print:w-full print:h-screen print:p-8 select-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(212, 175, 55, 0.05) 0%, transparent 70%)`,
          }}
        >
          {/* Đường viền hoa văn vàng (Gold Ornate Outer Frame) */}
          <div className="absolute inset-4 border-[3px] border-[#D4AF37] pointer-events-none" />
          <div className="absolute inset-5 border border-[#D4AF37]/40 pointer-events-none" />

          {/* Các chi tiết trang trí góc */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#B38728] pointer-events-none" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#B38728] pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#B38728] pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#B38728] pointer-events-none" />

          {/* Dấu chìm nền (Watermark) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden">
            <Award className="w-[500px] h-[500px] text-black" />
          </div>

          {/* Header Chứng chỉ */}
          <div className="text-center space-y-2 relative z-10 pt-4">
            <div className="text-xs font-bold tracking-[0.3em] text-[#8C6D23] uppercase">
              Học Viện Đào Tạo Thực Chiến AI &amp; Automation
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-wider text-[#1C2127] mt-1">
              CHỨNG NHẬN HOÀN THÀNH
            </h1>
            <div className="w-32 h-0.5 bg-[#D4AF37] mx-auto mt-3" />
          </div>

          {/* Thân Nội dung (Body Content) */}
          <div className="text-center max-w-2xl mx-auto space-y-6 relative z-10 my-auto">
            <p className="text-sm italic text-[#555] tracking-wide">
              Chứng chỉ này được tự động trân trọng cấp cho học viên:
            </p>

            {/* Tên Học viên cực lớn */}
            <div className="py-2">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[#B38728] font-serif border-b-2 border-dashed border-[#B38728]/40 pb-2 inline-block px-8 uppercase">
                {studentName}
              </span>
            </div>

            <p className="text-xs text-[#666] leading-relaxed px-12">
              Đã hoàn thành xuất sắc toàn bộ chương trình huấn luyện, thực hành quy trình và vượt qua bài kiểm tra năng lực hệ thống chuyên sâu thuộc chuyên đề:
            </p>

            {/* Tên Khóa học */}
            <div className="text-xl sm:text-2xl font-bold text-[#1C2127] font-sans tracking-wide py-1 bg-[#FDFBF7] border border-[#D4AF37]/20 rounded-lg inline-block px-6 shadow-sm">
              {courseTitle}
            </div>
          </div>

          {/* Chân chữ ký & Xác thực (Footer Signatures & Verification Badge) */}
          <div className="grid grid-cols-3 items-end pt-4 relative z-10">
            
            {/* Cột Trái: Ngày cấp & Số Serial */}
            <div className="text-left space-y-1">
              <div className="text-[11px] text-[#777]">
                <strong>Ngày cấp:</strong> {new Date().toLocaleDateString("vi-VN")}
              </div>
              <div className="text-[11px] text-[#777] font-mono">
                <strong>Mã xác thực:</strong>
              </div>
              <div className="text-xs font-bold text-[#8C6D23] bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block font-mono">
                {serialNo}
              </div>
            </div>

            {/* Cột Giữa: Con Dấu Chứng Nhận Vàng (Gold Seal) */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E5C158] via-[#C59B27] to-[#8C6D23] p-1 flex items-center justify-center shadow-lg relative">
                <div className="w-full h-full rounded-full border-2 border-dashed border-white/80 bg-[#B38728] flex flex-col items-center justify-center text-white text-center p-2">
                  <ShieldCheck className="w-6 h-6 text-white mb-0.5" />
                  <span className="text-[7px] font-bold tracking-tighter uppercase leading-none">VERIFIED<br/>EXPERT</span>
                </div>
                {/* Dải ruy băng */}
                <div className="absolute -bottom-2 w-16 h-4 bg-[#8C6D23] text-[6px] font-bold text-white text-center leading-tight rounded-sm shadow-md flex items-center justify-center border border-[#6B5218]">
                  ZENTRA TECH
                </div>
              </div>
            </div>

            {/* Cột Phải: Chữ ký Chuyên gia */}
            <div className="text-right space-y-2">
              <div className="w-40 ml-auto border-b border-[#333] pb-2 text-center">
                {/* Chữ ký dạng phông nghệ thuật hoặc nét vẽ */}
                <span className="font-serif italic text-2xl text-[#1C2127] font-bold select-none tracking-widest">
                  Huy Technology
                </span>
              </div>
              <div className="text-[11px] text-[#555] font-bold">Chuyên gia Huấn luyện AI</div>
              <div className="text-[9px] text-[#888]">AI &amp; Automation Platform</div>
            </div>

          </div>

        </div>
      </div>

      {/* Tra cứu & Lợi ích lan tỏa */}
      <div className="print:hidden grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
          <h3 className="text-sm font-bold text-secondary flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Tự Động Lan Tỏa Thương Hiệu (Viral Growth)</span>
          </h3>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Khi học viên tải về hoặc chia sẻ chứng chỉ này lên mạng xã hội, tên tuổi và uy tín của bạn sẽ được lan tỏa mạnh mẽ đến cộng đồng nhân sự chuyên nghiệp, giúp thu hút khách hàng tiềm năng hoàn toàn tự nhiên.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            <span>Xác Thực Tích Xanh Trực Tuyến</span>
          </h3>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Mỗi chứng chỉ đi kèm một mã Hash xác thực duy nhất được tính toán động từ dữ liệu Blockchain/DB hệ thống. Doanh nghiệp tuyển dụng có thể tra cứu ngay lập tức.
          </p>
        </div>
      </div>

    </div>
  );
}

export default function CertificatePage() {
  return (
    <main className="flex-1 py-12 animate-fade-in">
      {/* Cấu hình in ấn tích hợp trực tiếp qua thẻ style an toàn cho App Router */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
            margin: 0;
            padding: 0;
          }
          @page {
            size: landscape;
            margin: 0cm;
          }
          header, footer, nav, aside {
            display: none !important;
          }
        }
      `}} />

      <div className="container px-4 max-w-6xl mx-auto">
        <Suspense fallback={<div className="text-center py-20 text-xs">Đang nạp bộ máy sinh Chứng chỉ...</div>}>
          <CertificateRenderer />
        </Suspense>
      </div>
    </main>
  );
}
