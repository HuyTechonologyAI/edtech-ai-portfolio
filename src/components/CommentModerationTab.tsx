"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, CheckCircle, XCircle, Trash2, Star, MessageSquare, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface CommentItem {
  id: number;
  item_type: string;
  item_id: number;
  user_email: string;
  content: string;
  rating: number;
  status: string;
  created_at: string;
}

export default function CommentModerationTab() {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const logAudit = async (actionType: string, targetResource: string, details: any = {}) => {
    if (!user) return;
    try {
      const uMeta = (user as any).user_metadata || {};
      await fetch("/api/admin/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: uMeta.full_name || uMeta.name || null,
          actionType,
          targetResource,
          details,
        }),
      });
    } catch {
      // silent fail telemetry hook
    }
  };

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/comments");
      if (!res.ok) throw new Error("Không thể tải danh sách bình luận");
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const updateStatus = async (id: number, targetStatus: string) => {
    try {
      const targetComm = comments.find(c => c.id === id);
      const res = await fetch(`/api/admin/comments?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: targetStatus } : c))
      );

      // Log telemetries
      logAudit(
        targetStatus === "approved" ? "APPROVE_COMMENT" : "REJECT_COMMENT",
        `Bình luận #${id} của ${targetComm?.user_email || "Học viên"}`,
        { id, previousStatus: targetComm?.status, newStatus: targetStatus, content: targetComm?.content }
      );
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  const deleteComment = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này?")) return;
    try {
      const targetComm = comments.find(c => c.id === id);
      const res = await fetch(`/api/admin/comments?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa thất bại");
      
      setComments((prev) => prev.filter((c) => c.id !== id));

      // Log telemetries
      logAudit(
        "DELETE_COMMENT",
        `Bình luận #${id} của ${targetComm?.user_email || "Học viên"}`,
        { id, content: targetComm?.content }
      );
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-secondary">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-white/5 flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <MessageSquare className="w-5 h-5 text-secondary" />
            <span>Kiểm duyệt Bình luận</span>
          </h2>
          <p className="text-xs text-foreground/40 mt-1">
            Quản lý, phê duyệt hoặc loại bỏ các nhận xét/đánh giá từ học viên trước khi hiển thị công khai.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg font-bold">
            {comments.filter((c) => c.status === "pending").length} Chờ duyệt
          </span>
          <span className="text-xs bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-1 rounded-lg font-bold">
            {comments.filter((c) => c.status === "approved").length} Đã duyệt
          </span>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl text-foreground/40 text-sm">
          Chưa có bình luận nào trên hệ thống.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((item) => {
            const isPending = item.status === "pending";
            const isApproved = item.status === "approved";
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isPending
                    ? "bg-amber-500/5 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                    : isApproved
                    ? "bg-surface border-white/5"
                    : "bg-surface/40 border-red-500/20 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1.5 flex-1 min-w-[250px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-secondary">
                        {item.user_email}
                      </span>
                      <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-foreground/60 uppercase font-mono">
                        {item.item_type === "videos" ? "🎬 Video" : "📚 Tài liệu"} #{item.item_id}
                      </span>
                      <div className="flex items-center gap-0.5 ml-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < item.rating ? "text-amber-400 fill-amber-400" : "text-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed bg-background/40 p-3 rounded-lg border border-white/5 mt-2">
                      {item.content}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-foreground/40">
                        Đăng lúc: {new Date(item.created_at).toLocaleString("vi-VN")}
                      </span>
                      <span className="text-[10px] text-foreground/20">•</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isPending
                            ? "bg-amber-500/10 text-amber-400"
                            : isApproved
                            ? "bg-secondary/10 text-secondary"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    {isPending && (
                      <button
                        onClick={() => updateStatus(item.id, "approved")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/30 rounded-lg hover:bg-secondary hover:text-black transition-all text-xs font-bold"
                        title="Duyệt cho phép hiển thị"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Duyệt</span>
                      </button>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => updateStatus(item.id, "rejected")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500 hover:text-black transition-all text-xs font-bold"
                        title="Tạm ẩn bình luận"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Ẩn</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteComment(item.id)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                      title="Xóa vĩnh viễn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
