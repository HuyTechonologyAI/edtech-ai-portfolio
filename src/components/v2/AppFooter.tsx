/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { Cpu } from "lucide-react";
import { PUBLIC_ECOSYSTEM } from "@/lib/public-ecosystem";

export function AppFooter() {
  return (
    <footer className="w-full bg-[#04070D] border-t border-white/10 text-slate-400 text-xs">
      <div className="container mx-auto px-4 md:px-6 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission Column (Span 2 on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#0070F3] p-0.5 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                <div className="w-full h-full bg-[#070B14] rounded-[6px] flex items-center justify-center text-[#00E5FF]">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <span className="text-sm font-black text-white tracking-tight">
                HUY TECHNOLOGY AI GROUP
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              H�! sinh thái công ngh�! AI và giải pháp tự ��"ng hóa quy trình nghi�!p vụ, kết n�i công ngh�! lõi, giáo dục s�, h� trợ kê khai kế toán và truyền thông chuyên �ề.
            </p>

            <div className="space-y-1 text-xs text-slate-400 pt-2">
              <p>�x� Trụ s�x: Tam Hi�!p, TP. Biên Hòa, T�0nh Đ�ng Nai</p>
              <p>�x~ Hotline: 096.136.4600 | �S0️ huytechnologyai2025@gmail.com</p>
            </div>
          </div>

          {/* Ecosystem Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              6 Đơn V�9 Chuyên Môn
            </h4>
            <ul className="space-y-2 text-xs">
              {PUBLIC_ECOSYSTEM.map((org) => (
                <li key={org.id}>
                  <Link
                    href={org.public_website_target}
                    target={org.public_website_target.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="hover:text-[#00E5FF] transition-colors"
                  >
                    {org.display_name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Giải Pháp Trọng Tâm
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#solutions" className="hover:text-[#00E5FF] transition-colors">
                  Tự Đ�"ng Hóa n8n / Make
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="hover:text-[#00E5FF] transition-colors">
                  Hạ Tầng AI N�"i B�" (Private AI)
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="hover:text-[#00E5FF] transition-colors">
                  Giáo Án AI Chuẩn CV 5512
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="hover:text-[#00E5FF] transition-colors">
                  Kê Khai Thuế & Bóc Tách OCR
                </Link>
              </li>
              <li>
                <Link href="#solutions" className="hover:text-[#00E5FF] transition-colors">
                  Mô Hình AI Agency as a Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Platforms & Governance Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Nền Tảng & Vận Hành
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="https://gvcncdsai.io.vn" target="_blank" rel="noopener noreferrer" className="hover:text-[#00E5FF] transition-colors">
                  Smart Teacher Schedule AI � 
                </Link>
              </li>
              <li>
                <Link href="https://smarttax-ai.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-[#00E5FF] transition-colors">
                  SmartTax AI Assistant � 
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-[#00E5FF] transition-colors">
                  Thư Vi�!n Tài Li�!u Kỹ Thuật
                </Link>
              </li>
              <li>
                <Link href="#leadership" className="hover:text-[#00E5FF] transition-colors">
                  Sáng Lập & Lãnh Đạo
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 HUY TECHNOLOGY AI GROUP. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300">Ch�nh s�ch b�o m�t</Link>
            <Link href="/terms" className="hover:text-slate-300">i�u kho�n d�ch v�</Link>
            <Link href="/security" className="hover:text-slate-300">Cam k�t b�o m�t d� li�u</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
