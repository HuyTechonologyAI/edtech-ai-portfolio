/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { AI_WORKFORCE_63, ADMINCENTER_DEPARTMENTS, AIEmployee } from "../../../data/ai-workforce-63";
import { ArrowLeft, CheckCircle2, Sparkles, Briefcase, Filter, ShieldCheck, Cpu } from "lucide-react";
import Link from "next/link";

export default function Workforce63GalleryPage() {
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee>(AI_WORKFORCE_63[0]);

  const filteredEmployees = selectedDept === "ALL" 
    ? AI_WORKFORCE_63 
    : AI_WORKFORCE_63.filter(emp => emp.department === selectedDept);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-6 md:p-10 font-sans">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link href="/admincenter" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Bảng Quản Trị AdminCenter
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Chuẩn Khối Nghiệp Vụ AdminCenter
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> 63 Nhân Sự AI (50% Nam • 50% Nữ)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> Node-01 Telemetry Ready
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              63 AI Agency Workforce Roster
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm mt-2">
              Khung danh bạ 63 nhân sự AI của hệ thống <span className="text-indigo-400 font-mono">huycncdsai.io.vn/admincenter</span>, phân chia theo 8 khối nghiệp vụ cốt lõi, tên tiếng Việt 2 chữ chuẩn hóa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admincenter/workforce-63/avatar-audit"
              className="bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-indigo-500/30 flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Kiểm toán Avatar (Audit Mode)
            </Link>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center min-w-[95px]">
              <div className="text-xs text-slate-400 mb-0.5">Tổng quy mô</div>
              <div className="text-2xl font-bold text-white">63 <span className="text-xs font-normal text-slate-400">Agents</span></div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center min-w-[95px]">
              <div className="text-xs text-slate-400 mb-0.5">Khối nghiệp vụ</div>
              <div className="text-2xl font-bold text-indigo-400">8 <span className="text-xs font-normal text-slate-400">Khối</span></div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-500 shrink-0 ml-1 mr-2" />
          <button
            onClick={() => setSelectedDept("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              selectedDept === "ALL" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Tất cả (63)
          </button>
          {ADMINCENTER_DEPARTMENTS.map(dept => {
            const count = AI_WORKFORCE_63.filter(e => e.department === dept).length;
            const shortDeptName = dept.split(" (")[0];
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  selectedDept === dept 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
                title={dept}
              >
                {shortDeptName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid & Profile */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Grid: 63 Avatars */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {filteredEmployees.map((emp) => {
              const isSelected = selectedEmployee.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`group relative flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isSelected 
                      ? "bg-slate-800/80 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-102" 
                      : "bg-slate-900/50 hover:bg-slate-800/40 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  {/* System Code Badge */}
                  <div className="absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-950/80 text-slate-400 border border-slate-800">
                    {emp.code}
                  </div>

                  {/* Avatar Frame */}
                  <div 
                    className="relative rounded-full p-[3px] mt-2 transition-transform duration-300 group-hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${emp.color}, #6366f1)` }}
                  >
                    <div className="bg-slate-950 rounded-full p-[2px]">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center relative">
                        <img 
                          src={emp.avatarPath} 
                          alt={emp.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="w-full h-full hidden items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: `${emp.color}40` }}
                        >
                          {emp.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Name and Role */}
                  <div className="mt-3 text-center w-full">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {emp.name}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5 line-clamp-1" title={emp.roleShort}>
                      {emp.roleShort}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800">
                        {emp.gender} • {emp.age}t
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Selected Employee Profile */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl backdrop-blur-md">
            <h3 className="text-base font-bold border-b border-slate-800 pb-3 mb-5 flex items-center gap-2 text-white">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Hồ Sơ Nhân Sự AI
            </h3>

            {selectedEmployee ? (
              <div className="space-y-4">
                {/* Large Avatar */}
                <div className="flex justify-center py-2">
                  <div 
                    className="relative rounded-full p-[4px] shadow-xl"
                    style={{ background: `linear-gradient(135deg, ${selectedEmployee.color}, #818cf8)` }}
                  >
                    <div className="bg-slate-950 rounded-full p-[3px]">
                      <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-900">
                        <img 
                          src={selectedEmployee.avatarPath} 
                          alt={selectedEmployee.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="w-full h-full hidden items-center justify-center text-white font-bold text-2xl"
                          style={{ backgroundColor: `${selectedEmployee.color}40` }}
                        >
                          {selectedEmployee.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">[{selectedEmployee.code}]</div>
                      <div className="text-lg font-bold text-white">{selectedEmployee.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">Nhân chủng</div>
                      <div className="text-xs font-semibold text-indigo-400">{selectedEmployee.gender} • {selectedEmployee.age} tuổi</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500 mb-1">Khối nghiệp vụ AdminCenter</div>
                    <div className="text-xs font-semibold text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 leading-snug">
                      {selectedEmployee.department}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500 mb-1">Chức danh hệ thống đầy đủ</div>
                    <div className="text-xs font-semibold text-slate-200">
                      {selectedEmployee.role}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500 mb-1">Màu nhận diện chuyên khoa</div>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="w-4 h-4 rounded border border-slate-700" style={{ backgroundColor: selectedEmployee.color }}></div>
                      <span className="font-mono text-xs text-slate-300">{selectedEmployee.color}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500 mb-1">Nhiệm vụ chuyên môn cốt lõi</div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      {selectedEmployee.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Quality Standard Note */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <h4 className="flex items-center text-xs font-semibold text-emerald-400 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Chuẩn Khối Nghiệp Vụ
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Được đồng bộ trực tiếp với cơ sở kiến trúc 59 AI Agency và 4 CTO của AdminCenter.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
