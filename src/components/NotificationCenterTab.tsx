"use client";

import { useState } from "react";
import { Bell, Send, Mail, CheckCircle2, Search, Users, ShieldAlert, Rocket, MessageSquare } from "lucide-react";

export default function NotificationCenterTab() {
  const [notificationType, setNotificationType] = useState<"in-app" | "email">("in-app");
  const [targetAudience, setTargetAudience] = useState<"all" | "premium" | "free">("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    // Giả lập gọi API gửi thông báo
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
      setTitle("");
      setMessage("");
      setTimeout(() => setSendSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Trung Tâm Thông Báo (Broadcast)</h2>
        <p className="text-foreground/50 text-sm mt-1">Gửi thông báo In-app hoặc Email hàng loạt tới học viên</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form soạn thảo */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background rounded-xl p-6 border border-white/5 space-y-6">
            
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-bold mb-3">Loại thông báo</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setNotificationType("in-app")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                    notificationType === "in-app"
                      ? "bg-secondary/10 border-secondary text-secondary"
                      : "bg-surface border-white/10 text-foreground/50 hover:bg-white/5"
                  }`}
                >
                  <Bell className="w-5 h-5" /> In-app Popup
                </button>
                <button
                  onClick={() => setNotificationType("email")}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                    notificationType === "email"
                      ? "bg-blue-500/10 border-blue-500 text-blue-400"
                      : "bg-surface border-white/10 text-foreground/50 hover:bg-white/5"
                  }`}
                >
                  <Mail className="w-5 h-5" /> Email Broadcast
                </button>
              </div>
            </div>

            {/* Audience Selection */}
            <div>
              <label className="block text-sm font-bold mb-3">Đối tượng nhận</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none"
              >
                <option value="all">Tất cả học viên (All Users)</option>
                <option value="premium">Chỉ học viên Premium (Pro/VIP)</option>
                <option value="free">Chỉ tài khoản miễn phí</option>
              </select>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-bold mb-3">Tiêu đề thông báo</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Cập nhật khóa học n8n mới..."
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-3">Nội dung</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Nhập nội dung thông báo..."
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={isSending || !title || !message}
              className="w-full flex items-center justify-center gap-2 bg-secondary text-black py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isSending ? (
                <>Đang gửi...</>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Gửi Thông Báo {notificationType === "email" && "Email"}
                </>
              )}
            </button>

            {sendSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Gửi thông báo thành công!
              </div>
            )}
          </div>
        </div>

        {/* Lịch sử & Preview */}
        <div className="space-y-6">
          <div className="bg-background rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-secondary" /> Preview (Xem trước)
            </h3>
            
            <div className={`p-4 rounded-xl border shadow-xl ${notificationType === "email" ? "bg-white text-black border-gray-200" : "bg-surface border-secondary/30"}`}>
              {notificationType === "email" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">ZT</div>
                    <div>
                      <p className="text-xs text-gray-500">Từ: ZentraTech Academy</p>
                      <p className="font-bold text-sm">{title || "Tiêu đề Email"}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {message || "Nội dung email sẽ hiển thị ở đây..."}
                  </div>
                  <div className="pt-4 border-t border-gray-100 text-center">
                    <button className="px-4 py-2 bg-black text-white text-xs rounded font-bold">Xem chi tiết</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 relative">
                  <div className="absolute -top-6 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Mới</div>
                  <h4 className="font-bold text-secondary text-sm">{title || "Tiêu đề Popup"}</h4>
                  <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {message || "Nội dung thông báo In-app..."}
                  </p>
                  <p className="text-[10px] text-foreground/40 pt-2 mt-2 border-t border-white/10">Vừa xong</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-background rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-4">Lịch sử gửi (3 gần nhất)</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0 h-fit"><Mail className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-bold">Ra mắt khóa học n8n</p>
                  <p className="text-xs text-foreground/50">Gửi 1,200 Email • 2 ngày trước</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-secondary/10 text-secondary rounded-lg shrink-0 h-fit"><Bell className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-bold">Bảo trì hệ thống AI API</p>
                  <p className="text-xs text-foreground/50">Popup In-app • 5 ngày trước</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 h-fit"><MessageSquare className="w-4 h-4" /></div>
                <div>
                  <p className="text-sm font-bold">Khuyến mãi Black Friday</p>
                  <p className="text-xs text-foreground/50">Gửi 5,400 Email • 2 tháng trước</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
