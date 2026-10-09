/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sparkles,
  Search,
  Filter,
  X,
  ArrowRight,
  ShieldCheck,
  Users,
  Building2,
  CheckCircle2,
  Layers,
  Cpu,
} from "lucide-react";
import { AI_WORKFORCE_63, ADMINCENTER_DEPARTMENTS, AIEmployee } from "@/data/ai-workforce-63";

// Friendly short names for department filter tabs
const DEPT_SHORT_NAMES: Record<string, string> = {
  "Ban Quản trị & Điều phối Tối cao (Governance & Strategy)": "Ban Quản trị & Điều phối",
  "Khối Công nghệ & Kiến trúc Cốt lõi (Technology AI)": "Khối Công nghệ AI",
  "Khối Giáo dục & EdTech AI (HUY AI School)": "Khối Giáo dục & EdTech",
  "Khối Tài chính, Thuế & Kế toán AI (SmartTax & Accounting)": "Khối Tài chính & Thuế",
  "Khối Sáng tạo Nội dung & n8n Publishing (Creative Labs)": "Khối Sáng tạo & n8n",
  "Khối Tiếp thị, Tăng trưởng & CRM (Marketing & Client Growth)": "Khối Tiếp thị & CRM",
  "Khối Hạ tầng, DevOps & Vận hành Node-01 (Infrastructure & SRE)": "Khối Hạ tầng & SRE",
  "Khối An toàn Thông tin & AI HR (Security & Human Resources)": "Khối An toàn & AI HR",
};

export function AiWorkforceDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"DEFAULT" | "NAME" | "DEPT">("DEFAULT");
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedEmployee(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedEmployee) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedEmployee]);

  // Count employees per department
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: AI_WORKFORCE_63.length };
    for (const emp of AI_WORKFORCE_63) {
      counts[emp.department] = (counts[emp.department] || 0) + 1;
    }
    return counts;
  }, []);

  // Filtered and sorted employees
  const filteredEmployees = useMemo(() => {
    let list = [...AI_WORKFORCE_63];

    // Filter by department
    if (selectedDept !== "ALL") {
      list = list.filter((emp) => emp.department === selectedDept);
    }

    // Filter by search query (accent-insensitive)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          emp.role.toLowerCase().includes(q) ||
          emp.roleShort.toLowerCase().includes(q) ||
          emp.code.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q) ||
          emp.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "NAME") {
      list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    } else if (sortBy === "DEPT") {
      list.sort((a, b) => a.department.localeCompare(b.department, "vi"));
    }

    return list;
  }, [selectedDept, searchQuery, sortBy]);

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section
      id="ai-workforce"
      className="w-full py-20 md:py-24 bg-[#070B14] scroll-mt-24 md:scroll-mt-28 border-t border-white/5 relative"
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> AI Digital Workforce
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            ĐỘI NGŨ 63 NHÂN SỰ AI
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Khám phá đội ngũ 63 nhân sự AI chuyên biệt thuộc 8 phòng ban, được thiết kế để phối hợp trong nghiên cứu, công nghệ, giáo dục, tài chính, truyền thông, kinh doanh và vận hành tự động hóa. Mỗi nhân sự AI có vai trò, năng lực và trách nhiệm riêng trong hệ sinh thái HUY TECHNOLOGY AI GROUP.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] sm:text-xs text-amber-300/90 leading-normal">
            <span>⚠️</span>
            <span>
              <strong>Lưu ý minh bạch:</strong> Đây là 63 nhân vật AI ảo chuyên biệt trong hệ sinh thái tự động hóa, không phải nhân viên con người. Mọi tác vụ đều tuân thủ nguyên tắc ủy nhiệm có giám sát của con người (Human Governance).
            </span>
          </div>
        </div>

        {/* Hero Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
            <div className="flex items-center justify-center text-[#00E5FF] mb-2">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">63</div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1">
              Nhân sự AI đã xác thực
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
            <div className="flex items-center justify-center text-[#38BDF8] mb-2">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#38BDF8]">8</div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1">
              Khối nghiệp vụ chuyên trách
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
            <div className="flex items-center justify-center text-[#00FF85] mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#00FF85]">6</div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1">
              Business Units tích hợp
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
            <div className="flex items-center justify-center text-amber-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">100%</div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1">
              Chuẩn danh tính & Avatar
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-10">
          {/* Search & Sort Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên AI (ví dụ: Mai Anh, Công Thành), chức danh hoặc mã..."
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00E5FF] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label="Xóa từ khóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "DEFAULT" | "NAME" | "DEPT")}
                className="bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#00E5FF]"
                aria-label="Sắp xếp danh sách nhân sự"
              >
                <option value="DEFAULT">Thứ tự hệ thống (L1 → L3)</option>
                <option value="NAME">Tên nhân sự (A - Z)</option>
                <option value="DEPT">Khối phòng ban</option>
              </select>
            </div>
          </div>

          {/* Department Filter Pills (Horizontal scrollable on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedDept("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                selectedDept === "ALL"
                  ? "bg-gradient-to-r from-[#00E5FF] to-[#0070F3] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                  : "bg-[#0F172A] text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              <span>Tất cả</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedDept === "ALL" ? "bg-black/20 text-black" : "bg-white/10 text-slate-300"
                }`}
              >
                {deptCounts.ALL}
              </span>
            </button>

            {ADMINCENTER_DEPARTMENTS.map((dept) => {
              const shortName = DEPT_SHORT_NAMES[dept] || dept;
              const count = deptCounts[dept] || 0;
              const isSelected = selectedDept === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? "bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] font-bold"
                      : "bg-[#0F172A] text-slate-400 hover:text-white border border-white/10"
                  }`}
                >
                  <span>{shortName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? "bg-black/20 text-black" : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results Summary & Reset */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Hiển thị <strong>{filteredEmployees.length}</strong> / 63 nhân sự AI
              {selectedDept !== "ALL" && (
                <span className="text-[#00E5FF]"> • {DEPT_SHORT_NAMES[selectedDept]}</span>
              )}
              {searchQuery && <span> • Từ khóa: &quot;{searchQuery}&quot;</span>}
            </span>

            {(selectedDept !== "ALL" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDept("ALL");
                  setSearchQuery("");
                }}
                className="text-[11px] text-[#00E5FF] hover:underline flex items-center gap-1"
              >
                <Filter className="w-3 h-3" /> Đặt lại bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* 63 AI Employee Cards Grid */}
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#0F172A] rounded-3xl border border-white/10">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              Không tìm thấy nhân sự AI phù hợp
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
              Không có nhân sự nào khớp với từ khóa tìm kiếm hoặc bộ lọc phòng ban hiện tại.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDept("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-[#00E5FF] text-black text-xs font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
            >
              Xem tất cả 63 nhân sự AI
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredEmployees.map((emp) => {
              const hasImgError = imgErrors[emp.id];
              const shortDept = DEPT_SHORT_NAMES[emp.department] || emp.department;

              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="rounded-2xl bg-[#0F172A]/90 border border-white/10 hover:border-white/25 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                  style={{
                    borderTopColor: emp.color,
                    borderTopWidth: "3px",
                  }}
                >
                  {/* Top metadata tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                      {emp.code}
                    </span>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        emp.gender === "Nữ"
                          ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                          : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                      }`}
                    >
                      Nhân vật {emp.gender}
                    </span>
                  </div>

                  {/* Avatar & Core Information */}
                  <div className="flex flex-col items-center text-center space-y-3 my-2">
                    {/* Circular Avatar */}
                    <div className="relative">
                      <div
                        className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden p-0.5 transition-transform duration-300 group-hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${emp.color}, #00E5FF)`,
                        }}
                      >
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#070B14]">
                          {hasImgError ? (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-300 font-bold text-xl">
                              {emp.name.split(" ").pop()?.charAt(0) || "AI"}
                            </div>
                          ) : (
                            <img
                              src={emp.avatarPath}
                              alt={`${emp.name} - ${emp.role}`}
                              loading="lazy"
                              onError={() => handleImageError(emp.id)}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>

                      {/* Small Verified Badge */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00E5FF] text-black flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Name & Title */}
                    <div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-[#00E5FF] transition-colors">
                        {emp.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-300 mt-0.5 line-clamp-1">
                        {emp.roleShort}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {shortDept}
                      </p>
                    </div>

                    {/* Description preview */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed text-left sm:text-center">
                      {emp.description}
                    </p>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="pt-3 border-t border-white/5 mt-2 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {emp.id}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#00E5FF] font-semibold text-[11px] group-hover:translate-x-1 transition-transform">
                      Hồ sơ năng lực <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Governance Commitment Footer */}
        <div className="mt-14 text-center text-xs text-slate-400 max-w-3xl mx-auto space-y-2">
          <p>
            🔒 <strong className="text-white">Kiến trúc phối hợp an toàn (DAG Orchestration):</strong> Toàn bộ 63 nhân sự AI hoạt động theo luồng công việc tự động hóa có kiểm soát, phân định rõ ràng giữa tầng lập kế hoạch (Planning), thực thi (Execution) và phê duyệt tuân thủ (Approval Gate).
          </p>
        </div>
      </div>

      {/* Modal Profile Viewer (Agent Profile Drawer) */}
      {selectedEmployee && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-agent-name"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedEmployee(null)}
        >
          <div
            className="w-full max-w-xl bg-[#0B1120] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              borderTopColor: selectedEmployee.color,
              borderTopWidth: "4px",
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              aria-label="Đóng cửa sổ chi tiết"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-white/10 text-center sm:text-left">
              {/* Large Avatar */}
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-0.5 shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${selectedEmployee.color}, #00E5FF)`,
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#070B14]">
                  {imgErrors[selectedEmployee.id] ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-300 font-bold text-2xl">
                      {selectedEmployee.name.split(" ").pop()?.charAt(0) || "AI"}
                    </div>
                  ) : (
                    <img
                      src={selectedEmployee.avatarPath}
                      alt={selectedEmployee.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-[#00E5FF]">
                    {selectedEmployee.code}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      selectedEmployee.gender === "Nữ"
                        ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                        : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    }`}
                  >
                    Nhân vật {selectedEmployee.gender}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedEmployee.id}
                  </span>
                </div>

                <h3 id="modal-agent-name" className="text-2xl font-black text-white">
                  {selectedEmployee.name}
                </h3>

                <p className="text-xs sm:text-sm font-bold text-slate-200">
                  {selectedEmployee.role}
                </p>

                <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{selectedEmployee.department}</span>
                </p>
              </div>
            </div>

            {/* Profile Body */}
            <div className="py-6 space-y-5">
              {/* Core Description & Mission */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#00E5FF]" /> Nhiệm Vụ & Năng Lực Chuyên Môn
                </h4>
                <div className="p-4 rounded-2xl bg-[#0F172A] border border-white/5 text-xs text-slate-300 leading-relaxed">
                  {selectedEmployee.description}
                </div>
              </div>

              {/* Ecosystem Role & Operating Model */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#38BDF8]" /> Vai Trò Trong Hệ Sinh Thái
                </h4>
                <div className="p-4 rounded-2xl bg-[#0F172A] border border-white/5 space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF85] shrink-0 mt-0.5" />
                    <span>
                      <strong>Mô hình phối hợp:</strong> Tham gia chuỗi tác vụ DAG tự động, xử lý dữ liệu và bàn giao kết quả theo chuẩn giao thức liên lạc tác tử A2A (Agent-to-Agent).
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF85] shrink-0 mt-0.5" />
                    <span>
                      <strong>Cơ chế bảo mật:</strong> Không lưu trữ dữ liệu cá nhân ngoài phạm vi phiên làm việc; toàn bộ tiến trình ghi nhận nhật ký kiểm toán độc lập.
                    </span>
                  </div>
                </div>
              </div>

              {/* Transparency Notice Box */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Xác thực danh tính AI ảo (Virtual AI Identity)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/80">
                  Đây là nhân sự số chuyên môn hóa thuộc quyền quản trị của HUY TECHNOLOGY AI GROUP. Nhân sự không thay thế trách nhiệm pháp lý của con người mà hoạt động như một trợ lý thông minh cao cấp.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedDept(selectedEmployee.department);
                  setSelectedEmployee(null);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" /> Xem các AI cùng phòng ban
              </button>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-xs font-bold text-black transition-colors"
              >
                Đóng hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
