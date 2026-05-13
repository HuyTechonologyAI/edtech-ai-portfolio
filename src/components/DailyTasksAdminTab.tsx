"use client";

import { useState, useEffect, useCallback } from "react";
import { Gift, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Loader2, Sparkles, UserCheck, Flame, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface DailyTaskItem {
  id: number;
  title: string;
  reward_points: number;
  target_type: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export default function DailyTasksAdminTab() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Create Form states
  const [title, setTitle] = useState("");
  const [rewardPoints, setRewardPoints] = useState<number>(10);
  const [targetType, setTargetType] = useState("READ_EBOOK");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tasks");
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks || []);
      } else {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle Form Post insertion
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          reward_points: rewardPoints,
          target_type: targetType,
          created_by: user?.email || "admin@zentratech.io"
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Add to head
      if (data.task) {
        setTasks(prev => [data.task, ...prev]);
      } else {
        fetchTasks();
      }

      // Reset
      setTitle("");
      setRewardPoints(10);
      alert("Đã tạo nhiệm vụ hàng ngày thành công!");
    } catch (err: any) {
      alert("Lỗi tạo nhiệm vụ: " + err.message);
    }
  };

  // Toggle activation state
  const toggleActive = async (item: DailyTaskItem) => {
    setActionLoading(item.id);
    try {
      const targetState = !item.is_active;
      const res = await fetch(`/api/admin/tasks?id=${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: targetState }),
      });
      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");

      setTasks(prev => prev.map(t => t.id === item.id ? { ...t, is_active: targetState } : t));
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete task completely
  const handleDeleteTask = async (id: number) => {
    if (!confirm("Xóa vĩnh viễn nhiệm vụ này khỏi danh sách Checklist của học viên?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/tasks?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa thất bại");

      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Informative Header Banner */}
      <div className="bg-gradient-to-r from-orange-500/10 via-surface to-amber-500/5 border border-orange-500/20 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-orange-400 text-sm uppercase tracking-wider">
            <Gift className="w-4 h-4" /> Hệ thống Gamification &amp; Điểm Thưởng
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed max-w-2xl">
            Tỷ giá quy đổi nội bộ: <strong className="text-amber-400 font-bold">1 Point = 1.000.000 VNĐ</strong>. Học viên đọc sách hoặc xem video 10 phút mỗi ngày sẽ tích lũy ngay 10 Points để đổi các Khóa học Premium giá trị cao.
          </p>
        </div>

        <div className="bg-surface/80 border border-white/5 px-4 py-2 rounded-xl text-center shrink-0">
          <span className="text-[10px] text-foreground/40 block uppercase">Nhiệm vụ đang mở</span>
          <span className="text-base font-extrabold text-orange-400">{tasks.filter(t => t.is_active).length} Thử thách</span>
        </div>
      </div>

      {/* Creation Layout & Table Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Creation Workspace Form */}
        <div className="lg:col-span-1 bg-surface/40 border border-white/5 rounded-2xl p-4 space-y-4 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 border-b border-white/5 pb-2">
            <Plus className="w-3.5 h-3.5" /> Khởi tạo Nhiệm vụ Mới
          </h3>

          <form onSubmit={handleCreateTask} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] text-foreground/70 font-medium block">Tên hiển thị nhiệm vụ:</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Đọc sách Tối ưu Workflow 10 phút"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-orange-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-foreground/70 font-medium block">Điểm thưởng (Points):</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={rewardPoints}
                  onChange={e => setRewardPoints(Number(e.target.value))}
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-orange-400 font-bold focus:outline-none focus:border-orange-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-foreground/70 font-medium block">Loại hành vi (Target):</label>
                <select
                  value={targetType}
                  onChange={e => setTargetType(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-xl px-2 py-2 text-xs text-foreground focus:outline-none focus:border-orange-400"
                >
                  <option value="READ_EBOOK">📚 Đọc Ebook</option>
                  <option value="WATCH_VIDEO">🎬 Xem Video</option>
                  <option value="DAILY_CHECKIN">⚡ Điểm danh</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all cursor-pointer"
              >
                Đăng Nhiệm Vụ Này
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Managed Tasks List Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-surface/30 rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 bg-background/50 flex justify-between items-center text-xs">
              <span className="font-bold text-foreground/60 uppercase">Danh sách Tác vụ Thu hút Học viên</span>
              <span className="text-[10px] text-foreground/40 italic">Tự động reset tiến độ mỗi 00:00 hàng ngày</span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-orange-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : tasks.length === 0 ? (
              <div className="py-16 text-center text-foreground/40 text-xs border-t border-white/5">
                Chưa có nhiệm vụ hàng ngày nào được tạo. Hãy điền form bên trái.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {tasks.map(item => {
                  const isActing = actionLoading === item.id;
                  return (
                    <div key={item.id} className={`p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-all ${!item.is_active ? 'opacity-50 bg-background/30' : ''}`}>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-foreground truncate">{item.title}</span>
                          <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                            +{item.reward_points} Points
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-foreground/40">
                          <span>Loại: <strong className="text-foreground/70">{item.target_type === 'READ_EBOOK' ? 'Đọc Sách' : item.target_type === 'WATCH_VIDEO' ? 'Xem Video' : 'Check-in'}</strong></span>
                          <span>•</span>
                          <span>Đăng bởi: {item.created_by.split("@")[0]}</span>
                        </div>
                      </div>

                      {/* Control Operations */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isActing ? (
                          <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                        ) : (
                          <>
                            <button
                              onClick={() => toggleActive(item)}
                              className="p-1 hover:text-orange-400 text-foreground/40 transition-colors"
                              title={item.is_active ? "Tạm ẩn nhiệm vụ" : "Bật hiển thị lại"}
                            >
                              {item.is_active ? <ToggleRight className="w-6 h-6 text-orange-400" /> : <ToggleLeft className="w-6 h-6 text-foreground/30" />}
                            </button>

                            <button
                              onClick={() => handleDeleteTask(item.id)}
                              className="p-1.5 hover:bg-red-500/10 text-red-500/70 hover:text-red-500 rounded-lg transition-colors"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
