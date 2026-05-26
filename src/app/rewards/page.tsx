"use client";

import { useState, useEffect, useCallback } from "react";
import { Gift, Zap, CheckCircle2, Flame, Trophy, Lock, Unlock, ArrowRight, Loader2, RefreshCw, BookOpen, Video, ExternalLink, Play } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { TiltCard } from "@/components/TiltCard";

interface DailyTask {
  id: number;
  title: string;
  reward_points: number;
  target_type: string;
}

interface StudentBalance {
  points: number;
  redeemed_courses: string[];
  streak_count?: number;
  last_checkin_date?: string | null;
}

export default function RewardsGamificationPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<StudentBalance>({ points: 0, redeemed_courses: [], streak_count: 0, last_checkin_date: null });
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [completedToday, setCompletedToday] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Mảng danh sách các Khóa học Premium quy đổi
  const storeCourses = [
    {
      id: "course_ai_agents",
      title: "Khóa học: Làm Chủ AI Agents & Trợ Lý Ảo Tự Động Hóa",
      description: "Xây dựng hệ thống Agent tự phân tích dữ liệu, tự động phản hồi Email và vận hành CSKH đa kênh.",
      pointsCost: 30,
      image: "/media__1778636226462.png",
      category: "PREMIUM COURSE",
      targetUrl: "/roadmap"
    },
    {
      id: "workflow_n8n_mastery",
      title: "Bộ Template: 50 Kịch Bản Tự Động Hóa n8n Doanh Nghiệp",
      description: "Tích hợp sâu hệ thống CRM, tự động xuất hóa đơn và bắn thông báo trực tiếp qua Telegram/Zalo.",
      pointsCost: 50,
      image: "/media__1778637103413.png",
      category: "EXCLUSIVE TEMPLATES",
      targetUrl: "/resources"
    },
    {
      id: "vip_consulting_pass",
      title: "Vé Tham Dự Buổi Live Q&A Kỹ Thuật Trực Tiếp Cùng CEO",
      description: "Cơ hội đặt câu hỏi và nhờ chuyên gia gỡ rối trực tiếp kiến trúc tự động hóa của doanh nghiệp bạn.",
      pointsCost: 80,
      image: "/media__1778638007245.png",
      category: "VIP PASS",
      targetUrl: "/contact"
    }
  ];

  const fetchHubData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rewards?email=${encodeURIComponent(user.email || "")}`);
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance || { points: 0, redeemed_courses: [], streak_count: 0, last_checkin_date: null });
        setTasks(data.tasks || []);
        setCompletedToday(data.completedToday || []);
      }
    } catch {
      // fallback local demo state
      setBalance({ points: 20, redeemed_courses: [], streak_count: 0, last_checkin_date: null });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHubData();
  }, [fetchHubData]);

  // Nhận điểm thưởng khi hoàn thành nhiệm vụ
  const handleClaimReward = async (task: DailyTask) => {
    if (!user) {
      alert("Vui lòng đăng nhập để tích lũy điểm thưởng!");
      return;
    }

    setActionLoading(`claim_${task.id}`);
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete_task",
          userEmail: user.email,
          taskId: task.id,
          rewardPoints: task.reward_points
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Kích hoạt sự kiện để Header Streak Widget tự động cập nhật
      window.dispatchEvent(new Event("checkin-completed"));

      // Tải lại toàn bộ dữ liệu để cập nhật điểm và streak chính xác từ server
      await fetchHubData();

      alert(`🎉 Chúc mừng! Bạn đã tích lũy thành công +${data.pointsAwarded || task.reward_points} Points! ${
        task.target_type === "DAILY_CHECKIN"
          ? `Chuỗi điểm danh hiện tại của bạn: 🔥 ${data.streakCount || 1} ngày.`
          : ""
      }`);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Đổi Khóa học Miễn phí
  const handleRedeemCourse = async (course: typeof storeCourses[0]) => {
    if (!user) {
      alert("Vui lòng đăng nhập để đổi thưởng!");
      return;
    }

    if (balance.points < course.pointsCost) {
      alert(`❌ Số dư của bạn không đủ. Khóa học này cần ${course.pointsCost} Points, bạn đang có ${balance.points} Points.`);
      return;
    }

    if (!confirm(`Xác nhận quy đổi "${course.title}" với giá ${course.pointsCost} Points?`)) return;

    setActionLoading(`redeem_${course.id}`);
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "redeem_course",
          userEmail: user.email,
          courseId: course.id,
          rewardPoints: course.pointsCost
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Cập nhật số dư và thêm khóa học
      setBalance(prev => ({
        ...prev,
        points: prev.points - course.pointsCost,
        redeemed_courses: [...prev.redeemed_courses, course.id]
      }));
      alert(`🎁 Đổi thưởng thành công! Bạn đã sở hữu vĩnh viễn quyền truy cập khóa học "${course.title}".`);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Tính toán định giá tương đương
  const equivalentVND = balance.points * 1000000;
  const formattedVND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(equivalentVND);

  return (
    <main className="flex-1 py-12 overflow-hidden animate-fade-in">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto space-y-10">
        {/* Premium Banner Intro */}
        <div className="relative rounded-3xl bg-gradient-to-r from-orange-950/60 via-surface to-amber-950/30 p-8 border border-orange-500/30 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8 text-center lg:text-left">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-extrabold uppercase tracking-widest">
                <Trophy className="w-4 h-4 text-amber-400 animate-bounce" /> ZentraTech Gamification Hub
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
                Hoàn Thành Nhiệm Vụ Hàng Ngày <br />
                <span className="text-orange-400 neon-glow-text">Đổi Khóa Học Bản Quyền</span>
              </h1>
              <p className="text-xs md:text-sm text-foreground/70 leading-relaxed">
                Đọc tài liệu hoặc xem video bài giảng 10 phút mỗi ngày giúp bạn tích lũy ngay <strong className="text-amber-400">10 Points</strong>. Với tỷ giá đặc quyền <strong className="text-orange-400">1 Point = 1.000.000 VNĐ</strong>, bạn có thể tự do quy đổi toàn bộ các Khóa học Premium đắt giá hoàn toàn miễn phí!
              </p>
            </div>

            {/* Points Identity & Streak Card Badge */}
            <div className="w-full lg:w-96 flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0 justify-center">
              {/* Thẻ Điểm */}
              <div className="w-full sm:w-1/2 lg:w-full bg-surface/90 backdrop-blur-md border border-orange-500/20 rounded-2xl p-5 shadow-[0_0_30px_rgba(249,115,22,0.1)] flex flex-col items-center space-y-2">
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Số dư tài sản của bạn</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                    {balance.points}
                  </span>
                  <span className="text-sm font-bold text-orange-400 font-mono">Points</span>
                </div>

                <div className="w-full pt-2 border-t border-white/5 text-center">
                  <span className="text-[9px] text-foreground/40 block">Định giá quy đổi tương đương:</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono tracking-tight">{formattedVND}</span>
                </div>
              </div>

              {/* Thẻ Streak */}
              <div className="w-full sm:w-1/2 lg:w-full bg-gradient-to-br from-amber-500/10 via-surface to-orange-500/5 backdrop-blur-md border border-amber-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(245,158,11,0.15)] space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-500" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-4 w-4 rounded-full bg-amber-500/20 animate-ping" />
                      <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20 animate-pulse" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-foreground/80 leading-none">Daily Streak</h4>
                      <p className="text-[9px] text-foreground/40 mt-0.5">Điểm danh liên tục</p>
                    </div>
                  </div>
                  
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {balance.streak_count || 0} <span className="text-xs font-normal text-foreground/60">ngày</span>
                  </span>
                </div>

                {/* 7-day Milestone Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[9px] text-foreground/50 font-bold uppercase">
                    <span>Mốc thưởng lũy tiến</span>
                    <span className="text-amber-400 font-mono">{(balance.streak_count || 0) % 7}/7 ngày</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      style={{ width: `${Math.min((((balance.streak_count || 0) % 7 === 0 && (balance.streak_count || 0) > 0) ? 7 : (balance.streak_count || 0) % 7) / 7 * 100, 100)}%` }}
                    />
                  </div>
                  
                  {/* Indicators for milestones */}
                  <div className="flex justify-between text-[8px] font-bold text-foreground/40 font-mono px-0.5">
                    <span className={balance.streak_count && balance.streak_count % 7 >= 1 ? "text-amber-500/70" : ""}>Ngày 1 (+2)</span>
                    <span className={balance.streak_count && balance.streak_count % 7 >= 3 ? "text-amber-500/70 font-black" : ""}>Ngày 3 (+5) 🔥</span>
                    <span className={balance.streak_count && balance.streak_count % 7 === 0 && balance.streak_count > 0 ? "text-amber-400 font-black animate-pulse" : ""}>Ngày 7 (+10) 👑</span>
                  </div>
                </div>

                {!user && (
                  <Link href="/auth" className="w-full mt-1 block text-center py-1.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg border border-amber-500/30">
                    Đăng nhập để đồng bộ
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Daily Tasks Checklist */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span>Nhiệm Vụ Thu Hút Hằng Ngày</span>
              </h2>
              <p className="text-xs text-foreground/40 mt-0.5">Checklist được Admin và Trợ giảng cập nhật liên tục để thử thách học viên</p>
            </div>
            <button onClick={fetchHubData} className="flex items-center gap-1 text-xs text-foreground/40 hover:text-orange-400 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Làm mới
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-orange-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl text-foreground/40 text-xs">
              Hôm nay chưa có nhiệm vụ nào được đăng tải.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tasks.map(task => {
                const isDone = completedToday.includes(task.id);
                const isActing = actionLoading === `claim_${task.id}`;

                return (
                  <TiltCard key={task.id}>
                    <div className={`p-5 rounded-2xl border transition-all h-full flex flex-col justify-between group ${
                      isDone
                        ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                        : "bg-surface/60 border-white/5 hover:border-orange-500/30"
                    }`}>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`p-2 rounded-xl text-xs font-bold ${
                            task.target_type === 'READ_EBOOK' ? 'bg-blue-500/10 text-blue-400' : task.target_type === 'WATCH_VIDEO' ? 'bg-orange-500/10 text-orange-400' : 'bg-purple-500/10 text-purple-400'
                          }`}>
                            {task.target_type === 'READ_EBOOK' ? <BookOpen className="w-4 h-4" /> : task.target_type === 'WATCH_VIDEO' ? <Video className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                          </span>

                          <span className="text-xs font-extrabold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20 shrink-0 font-mono">
                            +{task.reward_points} Points
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-foreground/90 group-hover:text-orange-400 transition-colors leading-snug pt-1">
                          {task.title}
                        </h3>
                        <p className="text-[11px] text-foreground/50">
                          {task.target_type === 'READ_EBOOK' 
                            ? 'Mở xem tài liệu Ebook/Slide bất kỳ tối thiểu 10 phút.' 
                            : task.target_type === 'WATCH_VIDEO' 
                            ? 'Xem trọn vẹn video hướng dẫn chuyên sâu.' 
                            : `Nhiệm vụ đặc quyền: [${task.target_type}]`}
                        </p>
                      </div>

                      {/* Action triggers */}
                      <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between gap-2">
                        <Link
                          href={task.target_type === 'READ_EBOOK' ? '/resources' : '/videos'}
                          className="text-[11px] text-foreground/40 hover:text-foreground underline flex items-center gap-1"
                        >
                          <span>Tới thư viện</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>

                        {isDone ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Đã Nhận Thưởng</span>
                          </div>
                        ) : isActing ? (
                          <div className="px-4 py-1.5 bg-surface text-orange-400 rounded-xl text-xs font-bold flex items-center gap-1">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang xử lý...</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleClaimReward(task)}
                            className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all hover:scale-105 cursor-pointer"
                          >
                            ⚡ Bấm Nhận Thưởng
                          </button>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Store Redeem Showcase */}
        <div className="space-y-4 pt-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              <span>Kho Khóa Học &amp; Quà Tặng Độc Quyền</span>
            </h2>
            <p className="text-xs text-foreground/40 mt-0.5">Sử dụng số dư Points của bạn để mở khóa vĩnh viễn các tài nguyên bản quyền</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {storeCourses.map(course => {
              const isOwned = balance.redeemed_courses.includes(course.id);
              const isActing = actionLoading === `redeem_${course.id}`;

              return (
                <TiltCard key={course.id}>
                  <div className="bg-surface rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-between h-full group shadow-xl">
                    <div className="relative aspect-video w-full bg-surface border-b border-white/5 overflow-hidden">
                      {/* Using safe path rendering standard image tag format */}
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                      
                      <span className="absolute top-3 left-3 text-[9px] font-extrabold px-2 py-0.5 bg-black/70 backdrop-blur-md border border-white/10 rounded text-amber-400 uppercase">
                        {course.category}
                      </span>

                      <div className="absolute bottom-3 right-3 bg-orange-500 text-black font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
                        {course.pointsCost} Points
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-orange-400 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-[11px] text-foreground/60 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 mt-2">
                        {isOwned ? (
                          <Link
                            href={course.targetUrl}
                            className="w-full py-2 bg-secondary/10 hover:bg-secondary text-secondary hover:text-black rounded-xl text-xs font-bold border border-secondary/30 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Đã Sở Hữu - Bấm Vào Học</span>
                          </Link>
                        ) : isActing ? (
                          <button disabled className="w-full py-2 bg-surface text-orange-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang Mở Khóa...</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRedeemCourse(course)}
                            className="w-full py-2 bg-surface hover:bg-orange-500 text-orange-400 hover:text-black rounded-xl text-xs font-bold border border-orange-500/30 hover:border-orange-500 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Đổi Khóa Học ({course.pointsCost} Points)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
