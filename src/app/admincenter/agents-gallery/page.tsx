"use client";

import React, { useState } from "react";
import { AI_AGENTS, AGENT_CATEGORIES, AgentState, AIAgent } from "../../../data/agents";
import { AgentAvatar } from "../../../components/admin/AgentAvatar";
import { ArrowLeft, User, CheckCircle2, Sparkles, Briefcase } from "lucide-react";
import Link from "next/link";

export default function AgentsGalleryPage() {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(AI_AGENTS[0]);
  
  // Trạng thái mô phỏng cho Gallery
  const mockStates: AgentState[] = ["idle", "running", "success", "waiting", "error"];
  const getMockState = (index: number): AgentState => {
    return mockStates[index % mockStates.length];
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <Link href="/admincenter" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại AdminCenter
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Human Workforce
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                10 Nam • 10 Nữ (18 - 40 tuổi)
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              AI Agent Avatar Gallery
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm mt-2">
              Hệ thống nhận diện 20 nhân sự AI Agency với tên tiếng Việt 2 chữ chuẩn hóa, phân công theo 4 chuyên khoa nghiệp vụ, đại diện bằng avatar chân dung 2.5D bán thân.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center min-w-[100px]">
              <div className="text-xs text-slate-400 mb-0.5">Quy mô</div>
              <div className="text-2xl font-bold text-white">20 <span className="text-xs font-normal text-slate-400">Nhân sự</span></div>
            </div>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center min-w-[120px]">
              <div className="text-xs text-slate-400 mb-0.5">Tên nhân sự</div>
              <div className="text-sm font-bold text-indigo-400 mt-1">Chuẩn Việt 2 chữ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Gallery Section (Left - 3 cols) */}
        <div className="lg:col-span-3 space-y-10">
          {AGENT_CATEGORIES.map((category, catIndex) => (
            <div key={category} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/80 backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/60">
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-3 text-white">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                  {category}
                </h2>
                <span className="text-xs font-medium text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
                  {AI_AGENTS.filter(a => a.category === category).length} Agents
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 gap-x-6">
                {AI_AGENTS.filter(a => a.category === category).map((agent, index) => (
                  <AgentAvatar
                    key={agent.id}
                    agent={agent}
                    state={getMockState(index + catIndex * 2)}
                    size="medium"
                    onClick={setSelectedAgent}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Detail Section (Right - 1 col) */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl backdrop-blur-md">
            <h3 className="text-lg font-bold border-b border-slate-800 pb-4 mb-5 flex items-center gap-2 text-white">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Hồ sơ nhân sự số
            </h3>
            
            {selectedAgent ? (
              <div className="space-y-6">
                <div className="flex justify-center py-2">
                  <AgentAvatar 
                    agent={selectedAgent} 
                    state="success" 
                    size="large" 
                  />
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-xs text-slate-500">Họ và tên</div>
                      <div className="text-lg font-bold text-white">{selectedAgent.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Giới tính & Tuổi</div>
                      <div className="text-sm font-semibold text-indigo-400">{selectedAgent.gender} • {selectedAgent.age} tuổi</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-1">Chức danh / Vai trò</div>
                    <div className="font-semibold text-slate-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedAgent.color }}></span>
                      {selectedAgent.title} <span className="text-xs font-mono text-slate-500">({selectedAgent.role})</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-1">Mã định danh hệ thống (ID)</div>
                    <div className="font-mono text-xs bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-slate-300">
                      {selectedAgent.id}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-1">Màu thương hiệu (HEX)</div>
                    <div className="flex items-center gap-2.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="w-5 h-5 rounded-md border border-slate-700 shadow-inner" style={{ backgroundColor: selectedAgent.color }}></div>
                      <span className="font-mono text-xs font-medium text-slate-300">{selectedAgent.color}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-1">Nhiệm vụ chuyên môn</div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                      {selectedAgent.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <User className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Bấm vào một Avatar để xem hồ sơ nhân sự.</p>
              </div>
            )}
          </div>
          
          {/* Note Section */}
          <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h4 className="flex items-center text-emerald-400 font-semibold mb-2.5 text-sm">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Tiêu chuẩn nhân sự AI
            </h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                Tên tiếng Việt 2 chữ chuẩn hóa theo từng nhân sự.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                Đa dạng giới tính nam/nữ, độ tuổi 18 - 40 tuổi.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                Phong cách bán thân 2.5D, tỷ lệ 1:1, viền màu HEX theo chuyên môn.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
