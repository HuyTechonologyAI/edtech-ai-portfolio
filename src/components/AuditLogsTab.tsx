"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, Search, RefreshCw, Loader2, AlertTriangle, User, Calendar, FileText, Video, MessageSquare, Shield, Crown, Plus, Trash2, Pencil, CheckCircle, XCircle } from "lucide-react";

interface AuditLogItem {
  id: string | number;
  user_id: string | null;
  user_email: string;
  user_name: string | null;
  action_type: string;
  target_resource: string;
  details: Record<string, any>;
  created_at: string;
}

const ACTION_CONFIGS: Record<string, { label: string; color: string; icon: any }> = {
  // Video actions
  CREATE_VIDEO: { label: "Đăng Video mới", color: "text-green-400 bg-green-500/10 border-green-500/20", icon: Plus },
  UPDATE_VIDEO: { label: "Cập nhật Video", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Pencil },
  DELETE_VIDEO: { label: "Xóa Video", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: Trash2 },
  
  // Resource actions
  CREATE_RESOURCE: { label: "Đăng Tài liệu", color: "text-green-400 bg-green-500/10 border-green-500/20", icon: Plus },
  UPDATE_RESOURCE: { label: "Cập nhật Tài liệu", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Pencil },
  DELETE_RESOURCE: { label: "Xóa Tài liệu", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: Trash2 },
  
  // Comment actions
  APPROVE_COMMENT: { label: "Duyệt Bình luận", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: CheckCircle },
  REJECT_COMMENT: { label: "Ẩn Bình luận", color: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: XCircle },
  DELETE_COMMENT: { label: "Xóa Bình luận", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: Trash2 },
  
  // Delegation & Premium actions
  GRANT_PREMIUM: { label: "Cấp Premium VIP", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", icon: Crown },
  APPOINT_ROLE: { label: "Bổ nhiệm Trợ lý", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", icon: Shield },
  REVOKE_ROLE: { label: "Tước quyền CMS", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: Trash2 },
};

export default function AuditLogsTab() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter variables
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [limit, setLimit] = useState(100);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/audit-logs?limit=${limit}&actionType=${selectedAction}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tải nhật ký thao tác");
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit, selectedAction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Formatter mapping helper
  const fmtDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    } catch {
      return iso;
    }
  };

  // Filter client local output collection matching parameters
  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.user_email.toLowerCase().includes(q) ||
      log.target_resource.toLowerCase().includes(q) ||
      log.user_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface/40 p-4 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-base font-bold text-secondary flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            <span>Thống kê Quản trị Cấp cao (Audit Logs)</span>
          </h2>
          <p className="text-xs text-foreground/50 mt-0.5">
            Lịch sử lưu vết thời gian thực mọi hoạt động thêm, sửa, xóa, duyệt từ đội ngũ ban quản trị website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Action category dropdown filter */}
          <select
            value={selectedAction}
            onChange={e => setSelectedAction(e.target.value)}
            className="bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-secondary/50 cursor-pointer"
          >
            <option value="all">Tất cả thao tác</option>
            <option value="CREATE_VIDEO">Đăng Video</option>
            <option value="UPDATE_VIDEO">Sửa Video</option>
            <option value="DELETE_VIDEO">Xóa Video</option>
            <option value="CREATE_RESOURCE">Đăng Tài liệu</option>
            <option value="UPDATE_RESOURCE">Sửa Tài liệu</option>
            <option value="DELETE_RESOURCE">Xóa Tài liệu</option>
            <option value="APPROVE_COMMENT">Duyệt Bình luận</option>
            <option value="DELETE_COMMENT">Xóa Bình luận</option>
            <option value="GRANT_PREMIUM">Cấp Premium VIP</option>
            <option value="APPOINT_ROLE">Bổ nhiệm Trợ lý</option>
            <option value="REVOKE_ROLE">Tước quyền CMS</option>
          </select>

          {/* Refresh Action Hook */}
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 bg-surface border border-border rounded-xl hover:bg-white/5 transition-all text-foreground/70 hover:text-foreground disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-secondary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Lookup Bar Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input
          type="text"
          placeholder="Tìm kiếm theo Email trợ lý hoặc Tên tài liệu/đối tượng tác động..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-surface border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-foreground focus:outline-none focus:border-secondary/50 transition-all shadow-inner"
        />
        {searchQuery && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-foreground/40 bg-background px-2 py-0.5 rounded">
            Tìm thấy {filteredLogs.length} kết quả
          </span>
        )}
      </div>

      {/* Timeline Stream Listing Content */}
      <div className="bg-surface/20 rounded-2xl border border-border p-4 md:p-6 min-h-[400px]">
        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-foreground/40 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            <span className="text-xs">Đang truy xuất sổ cái nhật ký...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16 space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-xs font-bold text-red-400">{error}</p>
            <p className="text-[11px] text-foreground/40 max-w-sm mx-auto">
              (Gợi ý: Nếu bạn chưa tạo bảng <code className="text-secondary bg-surface px-1 py-0.2 rounded">audit_logs</code> trong Supabase, hãy sao chép đoạn mã SQL do AI cung cấp để kích hoạt phân hệ nhé).
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-foreground/40 text-xs border border-dashed border-white/5 rounded-xl">
            Không tìm thấy nhật ký thao tác nào tương ứng với tiêu chí lọc.
          </div>
        ) : (
          <div className="relative border-l border-white/10 ml-3 md:ml-4 pl-4 md:pl-6 space-y-6">
            {filteredLogs.map((log) => {
              const cfg = ACTION_CONFIGS[log.action_type] || {
                label: log.action_type,
                color: "text-foreground/70 bg-surface border-border",
                icon: FileText,
              };
              const IconComp = cfg.icon;

              return (
                <div key={log.id} className="relative group animate-fade-in">
                  {/* Timeline pointer bullet dot */}
                  <div className="absolute -left-[21px] md:-left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-background group-hover:scale-125 transition-transform" />

                  {/* Main event card block */}
                  <div className="bg-background/60 hover:bg-surface/40 p-3.5 md:p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all space-y-2">
                    {/* Sub header category */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold flex items-center gap-1 ${cfg.color}`}>
                          <IconComp className="w-3 h-3" />
                          <span>{cfg.label}</span>
                        </span>
                        
                        <span className="text-foreground/40 text-[10px] hidden sm:inline">•</span>
                        
                        {/* Target entity detail text */}
                        <span className="text-xs font-bold text-foreground/90 line-clamp-1">
                          {log.target_resource}
                        </span>
                      </div>

                      {/* Timestamp string marker */}
                      <span className="text-[10px] text-foreground/40 font-mono shrink-0 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fmtDateTime(log.created_at)}
                      </span>
                    </div>

                    {/* Operator actor details view */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-foreground/60 text-[11px]">
                        <User className="w-3 h-3 text-secondary" />
                        <span>Thực hiện bởi:</span>
                        <span className="font-bold text-foreground">{log.user_name || log.user_email.split("@")[0]}</span>
                        <span className="text-foreground/40 font-mono text-[10px]">({log.user_email})</span>
                      </div>

                      {/* Custom payloads dynamic info output */}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="text-[10px] text-foreground/40 italic hidden md:block">
                          {log.details.category ? `Danh mục: ${log.details.category}` : log.details.type ? `Loại: ${log.details.type}` : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="flex justify-between items-center text-[11px] text-foreground/40 px-2">
        <span>Hiển thị {filteredLogs.length} thao tác cộng tác gần đây</span>
        <span>Cơ chế bảo mật không can thiệp luồng dữ liệu lõi (Async Hooks)</span>
      </div>
    </div>
  );
}
