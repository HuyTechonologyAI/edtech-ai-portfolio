"use client";

import { useState, useEffect, useCallback } from "react";
import { Gift, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Loader2, Sparkles, UserCheck, Flame, ToggleLeft, ToggleRight, Bot, Zap, HelpCircle } from "lucide-react";
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

interface AiTaskPayload {
  title: string;
  reward_points: number;
  target_type: string;
  reasoning: string;
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
  const [customTarget, setCustomTarget] = useState("");

  // AI Brainstorming Studio states
  const [aiSuggestions, setAiSuggestions] = useState<AiTaskPayload[]>([]);
  const [generatingAi, setGeneratingAi] = useState(false);

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

  // Handle Manual Form Post insertion
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalTargetType = targetType === "CUSTOM" ? (customTarget.trim().toUpperCase() || "CUSTOM_TASK") : targetType;

    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          reward_points: rewardPoints,
          target_type: finalTargetType,
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
      setCustomTarget("");
      alert("Đã tạo nhiệm vụ hàng ngày thành công!");
    } catch (err: any) {
      alert("Lỗi tạo nhiệm vụ: " + err.message);
    }
  };

  // Trigger Google Gemini API payload extraction
  const handleGenerateAiTasks = async () => {
    setGeneratingAi(true);
    setAiSuggestions([]);
    try {
      const res = await fetch("/api/admin/tasks/ai-generate", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setAiSuggestions(data.suggestions || []);
      } else {
        alert("Lỗi xử lý payload từ AI.");
      }
    } catch (err: any) {
      alert("Lỗi kết nối AI: " + err.message);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Dispatch suggested AI task straight onto active checklist
  const handlePostAiSuggestion = async (sug: AiTaskPayload) => {
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sug.title,
          reward_points: sug.reward_points,
          target_type: sug.target_type,
          created_by: "gemini_ai@zentratech.io"
        })
      });
      const data = await res.json();
      if (data.task) {
        setTasks(prev => [data.task, ...prev]);
        setAiSuggestions(prev => prev.filter(item => item.title !== sug.title));
        alert("⚡ Đã đăng tự động kịch bản AI lên Checklist của học viên thành công!");
      }
    } catch (err: any) {
      alert("Lỗi đăng tác vụ: " + err.message);
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
            Tỷ giá quy đổi nội bộ: <strong className="text-amber-400 font-bold">1 Point = 1.000.000 VNĐ</strong>. Hỗ trợ đa dạng hóa nhiệm vụ với Trợ lý ảo AI tự động sáng tạo thử thách để tối đa hóa động lực tương tác của người học.
          </p>
        </div>

        <div className="bg-surface/80 border border-white/5 px-4 py-2 rounded-xl text-center shrink-0">
          <span className="text-[10px] text-foreground/40 block uppercase">Nhiệm vụ đang mở</span>
          <span className="text-base font-extrabold text-orange-400">{tasks.filter(t => t.is_active).length} Thử thách</span>
        </div>
      </div>

      {/* NEW: AI Gamification Studio Section */}
      <div className="bg-gradient-to-br from-purple-950/20 via-surface to-surface border border-purple-500/30 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
              <Bot className="w-4 h-4" /> Studio Trợ Lý AI Tự Sinh Thử Thách
            </h3>
            <p className="text-[11px] text-foreground/50 mt-0.5">Gemini phân tích hành vi để đề xuất kịch bản nhiệm vụ độc đáo, chống nhàm chán</p>
          </div>

          <button
            onClick={handleGenerateAiTasks}
            disabled={generatingAi}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-surface disabled:text-foreground/40 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {generatingAi ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI Đang "Động Não"...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>🤖 Gợi Ý Bộ Thử Thách Hôm Nay</span>
              </>
            )}
          </button>
        </div>

        {/* Generated output state placeholders */}
        {generatingAi && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 rounded-xl bg-surface/40 border border-white/5 space-y-3 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                <div className="h-3 bg-white/5 rounded w-full"></div>
                <div className="h-3 bg-white/5 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {!generatingAi && aiSuggestions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 animate-fade-in">
            {aiSuggestions.map((sug, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface/80 border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3 group">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                      {sug.target_type}
                    </span>
                    <span className="text-xs font-black text-amber-400 shrink-0">
                      +{sug.reward_points} Points
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-purple-400 transition-colors">
                    {sug.title}
                  </h4>

                  <p className="text-[10px] text-foreground/60 italic leading-relaxed pt-1 border-t border-white/5">
                    💡 {sug.reasoning}
                  </p>
                </div>

                <button
                  onClick={() => handlePostAiSuggestion(sug)}
                  className="w-full mt-2 py-1.5 bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-white rounded-lg text-[11px] font-bold border border-purple-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3" />
                  <span>⚡ Đăng Ngay Lên Checklist</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creation Layout & Table Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Creation Workspace Form */}
        <div className="lg:col-span-1 bg-surface/40 border border-white/5 rounded-2xl p-4 space-y-4 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 border-b border-white/5 pb-2">
            <Plus className="w-3.5 h-3.5" /> Khởi tạo Tác vụ Thủ công
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
                  onChange={e => {
                    setTargetType(e.target.value);
                    if (e.target.value !== "CUSTOM") setCustomTarget("");
                  }}
                  className="w-full bg-background border border-white/10 rounded-xl px-2 py-2 text-xs text-foreground focus:outline-none focus:border-orange-400"
                >
                  <option value="READ_EBOOK">📚 Đọc Ebook</option>
                  <option value="WATCH_VIDEO">🎬 Xem Video</option>
                  <option value="DAILY_CHECKIN">⚡ Điểm danh</option>
                  <option value="CUSTOM">🏷️ Khác (Nhập tay)...</option>
                </select>
              </div>
            </div>

            {/* Custom Tag Parameter Input Box */}
            {targetType === "CUSTOM" && (
              <div className="space-y-1 animate-fade-in pt-1">
                <label className="text-[11px] text-orange-400 font-bold block">Nhập mã phân loại tùy chỉnh:</label>
                <input
                  type="text"
                  required
                  placeholder="PRACTICE_PROMPT, QUIZ_CHALLENGE..."
                  value={customTarget}
                  onChange={e => setCustomTarget(e.target.value)}
                  className="w-full bg-background border border-orange-500/30 rounded-xl px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-orange-400 uppercase"
                />
                <span className="text-[9px] text-foreground/40 block italic">Hệ thống hỗ trợ tự động bóc tách nhãn hiển thị cho học viên</span>
              </div>
            )}

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
                  const isBespoke = !['READ_EBOOK', 'WATCH_VIDEO', 'DAILY_CHECKIN'].includes(item.target_type);

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
                          <span>
                            Loại: <strong className={`font-mono ${isBespoke ? 'text-purple-400 font-bold' : 'text-foreground/70'}`}>
                              {isBespoke ? item.target_type : item.target_type === 'READ_EBOOK' ? 'Đọc Sách' : item.target_type === 'WATCH_VIDEO' ? 'Xem Video' : 'Check-in'}
                            </strong>
                          </span>
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
