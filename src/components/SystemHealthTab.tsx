"use client";

import { useState } from "react";
import { Activity, Database, Server, Zap, RefreshCw, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function SystemHealthTab() {
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [revalidateStatus, setRevalidateStatus] = useState<{ type: "success" | "error", message: string } | null>(null);

  const handleRevalidate = async (path?: string) => {
    setIsRevalidating(true);
    setRevalidateStatus(null);
    try {
      const res = await fetch("/api/admin/system/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(path ? { path } : {}),
      });
      const data = await res.json();
      
      if (res.ok) {
        setRevalidateStatus({ type: "success", message: data.message || "Đã xóa cache thành công" });
      } else {
        setRevalidateStatus({ type: "error", message: data.error || "Lỗi xóa cache" });
      }
    } catch (error: any) {
      setRevalidateStatus({ type: "error", message: "Không thể kết nối đến server" });
    } finally {
      setIsRevalidating(false);
      setTimeout(() => setRevalidateStatus(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sức khỏe hệ thống & Bộ nhớ đệm</h2>
          <p className="text-foreground/50 text-sm mt-1">Giám sát hiệu suất và quản lý bộ nhớ đệm (Cache) của ứng dụng</p>
        </div>
        <button 
          onClick={() => handleRevalidate()}
          disabled={isRevalidating}
          className="flex items-center gap-2 bg-secondary text-black px-4 py-2.5 rounded-lg font-bold hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,255,133,0.3)] disabled:opacity-50 disabled:hover:scale-100"
        >
          <RefreshCw className={`w-4 h-4 ${isRevalidating ? "animate-spin" : ""}`} />
          Xóa toàn bộ Cache Web
        </button>
      </div>

      {revalidateStatus && (
        <div className={`p-4 rounded-xl border ${revalidateStatus.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-red-500/10 border-red-500/30 text-red-500"} flex items-center gap-2`}>
          {revalidateStatus.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{revalidateStatus.message}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background rounded-xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Server className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
            </span>
          </div>
          <p className="text-sm text-foreground/50 mb-1">Vercel Serverless</p>
          <h3 className="text-2xl font-black">99.9%</h3>
          <p className="text-xs text-emerald-400 mt-2">Hoạt động bình thường</p>
        </div>

        <div className="bg-background rounded-xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <Database className="w-6 h-6" />
            </div>
            <span className="text-xs text-foreground/40 font-mono">PostgreSQL</span>
          </div>
          <p className="text-sm text-foreground/50 mb-1">Supabase DB Latency</p>
          <h3 className="text-2xl font-black">42ms</h3>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Tốc độ phản hồi cực nhanh</p>
        </div>

        <div className="bg-background rounded-xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-foreground/50 mb-1">API Error Rate (24h)</p>
          <h3 className="text-2xl font-black">0.01%</h3>
          <p className="text-xs text-amber-400 mt-2">12 lỗi được tự động khắc phục</p>
        </div>
        
        <div className="bg-background rounded-xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-foreground/50 mb-1">Next.js Cache Hit Ratio</p>
          <h3 className="text-2xl font-black">94.2%</h3>
          <p className="text-xs text-emerald-400 mt-2">Tối ưu chi phí băng thông tốt</p>
        </div>
      </div>

      {/* Fine-grained Cache Control */}
      <div className="bg-background rounded-xl p-6 border border-white/5 mt-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-secondary" /> Xóa Bộ Nhớ Đệm Từng Phần (Granular Revalidation)
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface border border-white/5 rounded-lg">
            <div>
              <p className="font-bold">Dữ liệu Khóa học & Lộ trình (Roadmap)</p>
              <p className="text-xs text-foreground/50">Cập nhật ngay nếu bạn vừa thêm giai đoạn mới hoặc sửa bài học.</p>
            </div>
            <button 
              onClick={() => handleRevalidate("/roadmap")}
              disabled={isRevalidating}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
            >
              Làm mới trang Lộ trình
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-surface border border-white/5 rounded-lg">
            <div>
              <p className="font-bold">Dữ liệu Bảng Xếp Hạng (Leaderboard)</p>
              <p className="text-xs text-foreground/50">Làm mới nếu bảng xếp hạng chưa cập nhật điểm mới nhất.</p>
            </div>
            <button 
              onClick={() => handleRevalidate("/rewards")}
              disabled={isRevalidating}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
            >
              Làm mới trang Đổi Thưởng
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface border border-white/5 rounded-lg">
            <div>
              <p className="font-bold">Dữ liệu Tài liệu / Video (Resources)</p>
              <p className="text-xs text-foreground/50">Làm mới danh mục tài liệu hoặc video mới upload.</p>
            </div>
            <button 
              onClick={() => handleRevalidate("/resources")}
              disabled={isRevalidating}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
            >
              Làm mới trang Tài liệu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
