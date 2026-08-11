"use client";

import { useState } from "react";
import { ToggleLeft, ToggleRight, Save, CheckCircle2, Zap, Layout, Bot, MessageSquare, AlertTriangle } from "lucide-react";

export default function FeatureFlagsTab() {
  const [flags, setFlags] = useState({
    enableGamification: true,
    enableAIChatbot: true,
    enableZaloButton: true,
    enableComments: true,
    maintenanceMode: false,
    enableNewRegistrations: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Giả lập gọi API lưu cờ tính năng
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quản Lý Cờ Tính Năng (Feature Flags)</h2>
          <p className="text-foreground/50 text-sm mt-1">Bật/tắt nhanh các tính năng lớn trên hệ thống mà không cần sửa code</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-secondary text-black px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-[0_0_15px_rgba(0,255,133,0.3)] disabled:opacity-50"
        >
          {isSaving ? "Đang lưu..." : <><Save className="w-4 h-4" /> Áp dụng thay đổi</>}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> Cập nhật cờ tính năng thành công!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Features */}
        <div className="bg-background rounded-xl p-6 border border-white/5 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-3">
            <Layout className="w-5 h-5 text-secondary" /> Trải Nghiệm Học Viên
          </h3>

          <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5">
            <div className="flex gap-4 items-center">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Zap className="w-5 h-5" /></div>
              <div>
                <p className="font-bold">Hệ Thống Gamification</p>
                <p className="text-xs text-foreground/50">Leaderboard, Streak và Nhiệm vụ hàng ngày.</p>
              </div>
            </div>
            <button onClick={() => toggleFlag("enableGamification")} className="text-secondary transition-transform hover:scale-105 cursor-pointer">
              {flags.enableGamification ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-foreground/30" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5">
            <div className="flex gap-4 items-center">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><MessageSquare className="w-5 h-5" /></div>
              <div>
                <p className="font-bold">Bình Luận Khóa Học</p>
                <p className="text-xs text-foreground/50">Tính năng thảo luận bên dưới video bài giảng.</p>
              </div>
            </div>
            <button onClick={() => toggleFlag("enableComments")} className="text-secondary transition-transform hover:scale-105 cursor-pointer">
              {flags.enableComments ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-foreground/30" />}
            </button>
          </div>

        </div>

        {/* Floating Widgets */}
        <div className="bg-background rounded-xl p-6 border border-white/5 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-3">
            <Bot className="w-5 h-5 text-purple-400" /> Công Cụ Floating
          </h3>

          <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5">
            <div className="flex gap-4 items-center">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Bot className="w-5 h-5" /></div>
              <div>
                <p className="font-bold">Trợ Lý AI Chatbot</p>
                <p className="text-xs text-foreground/50">Nút chat AI góc trái màn hình.</p>
              </div>
            </div>
            <button onClick={() => toggleFlag("enableAIChatbot")} className="text-secondary transition-transform hover:scale-105 cursor-pointer">
              {flags.enableAIChatbot ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-foreground/30" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-white/5">
            <div className="flex gap-4 items-center">
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><MessageSquare className="w-5 h-5" /></div>
              <div>
                <p className="font-bold">Nút Liên Hệ Zalo/Facebook</p>
                <p className="text-xs text-foreground/50">Nút liên hệ hỗ trợ đa kênh góc phải.</p>
              </div>
            </div>
            <button onClick={() => toggleFlag("enableZaloButton")} className="text-secondary transition-transform hover:scale-105 cursor-pointer">
              {flags.enableZaloButton ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-foreground/30" />}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="md:col-span-2 bg-red-500/5 rounded-xl p-6 border border-red-500/20 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-red-500/20 pb-3 text-red-500">
            <AlertTriangle className="w-5 h-5" /> Khu Vực Nguy Hiểm (Hệ Thống)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
              <div>
                <p className="font-bold text-red-400">Chế Độ Bảo Trì (Maintenance)</p>
                <p className="text-xs text-foreground/50 mt-1">Chặn toàn bộ truy cập, chỉ hiển thị trang "Đang nâng cấp".</p>
              </div>
              <button onClick={() => toggleFlag("maintenanceMode")} className="text-red-500 transition-transform hover:scale-105 cursor-pointer">
                {flags.maintenanceMode ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-foreground/30" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-white/5">
              <div>
                <p className="font-bold">Cho phép Đăng ký mới</p>
                <p className="text-xs text-foreground/50 mt-1">Tắt nếu bạn muốn dừng nhận học viên mới một thời gian.</p>
              </div>
              <button onClick={() => toggleFlag("enableNewRegistrations")} className="text-secondary transition-transform hover:scale-105 cursor-pointer">
                {flags.enableNewRegistrations ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-foreground/30" />}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
