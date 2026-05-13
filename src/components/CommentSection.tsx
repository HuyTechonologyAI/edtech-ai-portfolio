"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Send, Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface Review {
  id: number;
  user_email: string;
  content: string;
  rating: number;
  created_at: string;
}

export function CommentSection({ itemType, itemId }: { itemType: string; itemId: number }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?itemType=${itemType}&itemId=${itemId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setIsLoading(false);
    }
  }, [itemType, itemId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg("Vui lòng đăng nhập để gửi bình luận");
      return;
    }
    if (!content.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_type: itemType,
          item_id: itemId,
          user_email: user.email,
          content: content.trim(),
          rating,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gửi bình luận thất bại");
      }

      setContent("");
      setRating(5);
      setSuccessMsg("🎉 Nhận xét của bạn đã được gửi thành công và đang chờ Admin duyệt hiển thị!");
      
      // Tự động xóa thông báo sau 6 giây
      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="mt-8 pt-8 border-t border-border/60">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-secondary" />
          <span>Bình luận & Đánh giá</span>
          <span className="text-xs bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full font-mono">
            {reviews.length} nhận xét
          </span>
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl text-sm font-bold">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>{avgRating} / 5.0</span>
          </div>
        )}
      </div>

      {/* Review Submission Form */}
      <div className="glass-panel p-5 rounded-2xl mb-8 relative overflow-hidden">
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary/20 border border-secondary/40 text-secondary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {user.email?.[0] || "U"}
                </div>
                <span className="text-xs font-medium text-foreground/80 truncate max-w-[200px]">
                  {user.email}
                </span>
              </div>
              
              {/* Star selector */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-foreground/50 mr-1.5">Đánh giá:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-foreground/20"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ cảm nhận, kết quả học tập hoặc câu hỏi của bạn về nội dung này..."
              className="w-full bg-background/50 border border-white/5 rounded-xl p-3 text-xs text-foreground focus:border-secondary/40 focus:outline-none focus:ring-1 focus:ring-secondary/20 transition-all resize-y custom-scrollbar"
            />

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="text-xs text-secondary bg-secondary/10 border border-secondary/20 p-3 rounded-xl animate-fade-in font-medium">
                {successMsg}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-black rounded-xl text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(0,255,133,0.2)]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi bình luận</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-foreground/60 mb-3">
              Bạn cần đăng nhập tài khoản học viên để tham gia thảo luận và đánh giá.
            </p>
            <button
              onClick={() => {
                window.location.href = "/auth";
              }}
              className="px-4 py-2 bg-surface border border-border hover:border-secondary/40 rounded-xl text-xs font-bold text-secondary transition-all"
            >
              Đăng nhập / Đăng ký
            </button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-secondary/50" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl text-foreground/40 text-xs">
            ✨ Hãy là người đầu tiên để lại đánh giá cho nội dung này!
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-xl bg-surface/30 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                    {rev.user_email[0]}
                  </div>
                  <span className="text-xs font-bold text-foreground/80">
                    {rev.user_email.split("@")[0]}
                  </span>
                  <span className="text-[10px] text-foreground/30">• {new Date(rev.created_at).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < rev.rating ? "text-amber-400 fill-amber-400" : "text-foreground/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-line pl-8">
                {rev.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
