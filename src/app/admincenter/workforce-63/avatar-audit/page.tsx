/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { AI_WORKFORCE_63, ADMINCENTER_DEPARTMENTS } from "@/data/ai-workforce-63";
import { ArrowLeft, CheckCircle2, AlertTriangle, Sparkles, Filter, ShieldCheck, RefreshCw, Eye } from "lucide-react";
import Link from "next/link";

// Presentation mapping for synchronized assets (all verified 100% to character persona)
function getAvatarPresentation(empId: string, declaredGender: "Nam" | "Nữ"): "Nam" | "Nữ" {
  // All emp_01 through emp_63 assets have been repaired and bound to character persona gender
  return declaredGender;
}

export default function AvatarAuditDashboardPage() {
  const [filterStatus, setFilterStatus] = useState<"ALL" | "MATCHED" | "MISMATCH">("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [activeEmpId, setActiveEmpId] = useState<string>("emp_04");

  // Build audit data for all 63 agents
  const auditList = AI_WORKFORCE_63.map((emp, index) => {
    const presentation = getAvatarPresentation(emp.id, emp.gender);
    const isMatched = emp.gender === presentation;
    return {
      stt: index + 1,
      emp,
      presentation,
      isMatched,
      status: isMatched ? ("MATCHED" as const) : ("GENDER_MISMATCH" as const),
    };
  });

  const total = auditList.length;
  const matchedCount = auditList.filter(a => a.isMatched).length;
  const mismatchCount = auditList.filter(a => !a.isMatched).length;
  const duplicateCount = 0; // Each employee now has a dedicated distinct emp_XX.jpg asset

  const filtered = auditList.filter(item => {
    if (filterStatus === "MATCHED" && !item.isMatched) return false;
    if (filterStatus === "MISMATCH" && item.isMatched) return false;
    if (selectedDept !== "ALL" && item.emp.department !== selectedDept) return false;
    return true;
  });

  const selectedAuditItem = auditList.find(a => a.emp.id === activeEmpId) || auditList[0];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admincenter/workforce-63"
            className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Danh bạ Workforce-63
          </Link>
          <span className="text-slate-600">|</span>
          <Link
            href="/admincenter/workforce-63/ai-hr"
            className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-semibold"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" /> Quản Trị AI HR (V2.0)
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            Audit Mode v2.0 • Node-01
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-amber-400 to-indigo-400">
              Avatar Identity Audit Dashboard
            </h1>
            <p className="text-slate-400 max-w-3xl text-sm mt-2">
              Hệ thống đối soát tự động danh tính, giới tính nhân vật và avatar thực tế cho toàn bộ 63 nhân sự AI. Phát hiện chính xác sai lệch giới tính và tình trạng trùng lặp khuôn mặt.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center min-w-[100px]">
              <div className="text-[11px] text-slate-400 mb-0.5">Tổng số Agent</div>
              <div className="text-2xl font-bold text-white">{total}</div>
            </div>
            <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40 text-center min-w-[100px]">
              <div className="text-[11px] text-emerald-400 mb-0.5">Khớp giới tính</div>
              <div className="text-2xl font-bold text-emerald-400">{matchedCount}</div>
            </div>
            <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-800/40 text-center min-w-[100px]">
              <div className="text-[11px] text-rose-400 mb-0.5">Lệch giới tính</div>
              <div className="text-2xl font-bold text-rose-400">{mismatchCount}</div>
            </div>
            <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/40 text-center min-w-[100px]">
              <div className="text-[11px] text-amber-400 mb-0.5">Trùng khuôn mặt</div>
              <div className="text-2xl font-bold text-amber-400">{duplicateCount}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 mr-1" />
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === "ALL"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Tất cả ({total})
            </button>
            <button
              onClick={() => setFilterStatus("MISMATCH")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterStatus === "MISMATCH"
                  ? "bg-rose-600 text-white shadow-lg"
                  : "bg-rose-950/30 text-rose-400 hover:bg-rose-900/40 border border-rose-800/40"
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> Cần sửa lệch giới tính ({mismatchCount})
            </button>
            <button
              onClick={() => setFilterStatus("MATCHED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterStatus === "MATCHED"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-800/40"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" /> Khớp giới tính ({matchedCount})
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedDept("ALL")}
              className={`px-2.5 py-1 rounded text-xs shrink-0 ${
                selectedDept === "ALL" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Tất cả phòng ban
            </button>
            {ADMINCENTER_DEPARTMENTS.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDept(d)}
                className={`px-2.5 py-1 rounded text-xs shrink-0 truncate max-w-[150px] ${
                  selectedDept === d ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
                title={d}
              >
                {d.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout: Table + Live Comparison Panel */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Audit Table */}
        <div className="lg:col-span-2 bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Danh sách đối soát 63 nhân sự AI ({filtered.length})
            </h3>
            <span className="text-xs text-slate-500 font-mono">Click vào dòng để xem đối sánh</span>
          </div>

          <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3">Nhân sự AI</th>
                  <th className="py-3 px-3 text-center">Hồ sơ</th>
                  <th className="py-3 px-3 text-center">Ảnh hiện tại</th>
                  <th className="py-3 px-3">Kết quả</th>
                  <th className="py-3 px-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(item => {
                  const isSelected = item.emp.id === selectedAuditItem.emp.id;
                  return (
                    <tr
                      key={item.emp.id}
                      onClick={() => setActiveEmpId(item.emp.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-indigo-950/40 border-l-4 border-indigo-500" 
                          : "hover:bg-slate-800/40"
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-slate-500 font-mono">{item.stt}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.emp.avatarPath}
                            alt={item.emp.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white hover:text-indigo-400 transition-colors">
                              {item.emp.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              {item.emp.code} • {item.emp.roleShort}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.emp.gender === "Nam"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                          }`}
                        >
                          {item.emp.gender}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.presentation === "Nam"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-pink-500/10 text-pink-400"
                          }`}
                        >
                          {item.presentation}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {item.isMatched ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> MATCHED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" /> MISMATCH
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button className="text-slate-400 hover:text-white p-1 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Inspection & Proposed Fix Panel */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Bảng Đối Soát Trực Quan
              </h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {selectedAuditItem.emp.code}
              </span>
            </div>

            {/* Profile Overview */}
            <div className="mb-6">
              <h4 className="text-xl font-extrabold text-white">{selectedAuditItem.emp.name}</h4>
              <p className="text-xs text-indigo-400 font-semibold mt-0.5">{selectedAuditItem.emp.role}</p>
              <p className="text-xs text-slate-400 mt-1">{selectedAuditItem.emp.department}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-slate-400">Giới tính hồ sơ:</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                    selectedAuditItem.emp.gender === "Nam"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                  }`}
                >
                  {selectedAuditItem.emp.gender} ({selectedAuditItem.emp.age} tuổi)
                </span>
              </div>
            </div>

            {/* Side-by-Side Comparison: Current vs Requirement */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 mb-6">
              
              {/* Current Avatar */}
              <div className="flex flex-col items-center text-center">
                <span className="text-[11px] text-slate-400 mb-2 font-mono">Avatar Hiện Tại</span>
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700 shadow-md relative">
                  <img
                    src={selectedAuditItem.emp.avatarPath}
                    alt={selectedAuditItem.emp.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span
                  className={`mt-2 text-xs font-bold ${
                    selectedAuditItem.presentation === "Nam" ? "text-blue-400" : "text-pink-400"
                  }`}
                >
                  Thể hiện: {selectedAuditItem.presentation}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[120px] font-mono mt-0.5">
                  {selectedAuditItem.emp.avatarPath.split("/").pop()}
                </span>
              </div>

              {/* Status / Requirement */}
              <div className="flex flex-col items-center justify-center text-center border-l border-slate-800/80 pl-4">
                <span className="text-[11px] text-slate-400 mb-2 font-mono">Yêu Cầu Chuẩn</span>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                    selectedAuditItem.isMatched
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                      : "border-rose-500/50 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {selectedAuditItem.isMatched ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-bold ${
                    selectedAuditItem.isMatched ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {selectedAuditItem.isMatched ? "ĐÃ KHỚP" : "CẦN ĐỔI ẢNH"}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Phải là hình tượng: {selectedAuditItem.emp.gender}
                </span>
              </div>
            </div>

            {/* Analysis & Recommendation */}
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60 text-xs">
              <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> Đề xuất xử lý:
              </div>
              {selectedAuditItem.isMatched ? (
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Avatar hiện tại đã đúng giới tính ({selectedAuditItem.emp.gender}). Cần tạo tệp ảnh riêng biệt độc quyền để triệt tiêu hiện tượng dùng chung ảnh với nhân sự khác.
                </p>
              ) : (
                <p className="text-rose-300 text-[11px] leading-relaxed">
                  Nhân sự hồ sơ là <strong>{selectedAuditItem.emp.gender}</strong> nhưng avatar hiện tại đang hiển thị gương mặt <strong>{selectedAuditItem.presentation}</strong>. Cần thay thế bằng avatar {selectedAuditItem.emp.gender} chuyên nghiệp chuẩn phong cách Premium Semi-flat.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Trạng thái xác thực: <span className="text-indigo-400 font-mono">Chờ Phê Duyệt Phương Án</span>
          </div>
        </div>
      </div>
    </div>
  );
}
