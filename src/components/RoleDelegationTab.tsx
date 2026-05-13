"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Search, UserCheck, UserX, Plus, RefreshCw, Loader2, CheckCircle2, AlertTriangle, Eye, X, Crown, FileText, Video, MessageSquare, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface UserItem {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone?: string | null;
  occupation?: string | null;
  canManageContent?: boolean;
  canModerateComments?: boolean;
  canGrantPremium?: boolean;
  provider: string;
  role: string;
  isPremium: boolean;
  createdAt: string;
}

export default function RoleDelegationTab() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Appointment Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchCandidate, setSearchCandidate] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<UserItem | null>(null);
  
  // Capability edit states inside modal
  const [canManageContent, setCanManageContent] = useState(false);
  const [canModerateComments, setCanModerateComments] = useState(false);
  const [canGrantPremium, setCanGrantPremium] = useState(false);
  const [assignRoleAdmin, setAssignRoleAdmin] = useState(false);

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
      // silent telemetry fallback
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle single action patch execution
  const patchUserProperty = async (userId: string, action: string, value: any) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  // 1. Submit New Appointment
  const handleAppointSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setActionLoading(selectedCandidate.id);
    try {
      // Set capability metadata object
      await patchUserProperty(selectedCandidate.id, "setPermissions", {
        canManageContent,
        canModerateComments,
        canGrantPremium,
      });

      // Also set standard role mapping if explicitly requested
      const targetRole = assignRoleAdmin ? "admin" : "user";
      if (selectedCandidate.role !== targetRole) {
        await patchUserProperty(selectedCandidate.id, "setRole", targetRole);
      }

      // Log telemetries
      logAudit(
        "APPOINT_ROLE",
        `Tài khoản: ${selectedCandidate.email}`,
        {
          targetUserId: selectedCandidate.id,
          permissions: { canManageContent, canModerateComments, canGrantPremium },
          assignedRole: targetRole,
        }
      );

      setIsModalOpen(false);
      setSelectedCandidate(null);
      await fetchUsers();
    } catch (err: any) {
      alert("Lỗi khi bổ nhiệm: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 2. Revoke/Remove Access Entirely
  const handleRevokeAccess = async (targetUser: UserItem) => {
    if (!confirm(`Thu hồi toàn bộ quyền quản trị của tài khoản "${targetUser.email}"?\nTài khoản sẽ trở về trạng thái học viên tiêu chuẩn.`)) return;

    setActionLoading(targetUser.id);
    try {
      // Clear permissions metadata object
      await patchUserProperty(targetUser.id, "setPermissions", {
        canManageContent: false,
        canModerateComments: false,
        canGrantPremium: false,
      });

      // Demote role if currently admin
      if (targetUser.role === "admin") {
        await patchUserProperty(targetUser.id, "setRole", "user");
      }

      // Log telemetries
      logAudit(
        "REVOKE_ROLE",
        `Tài khoản: ${targetUser.email}`,
        { targetUserId: targetUser.id }
      );

      await fetchUsers();
    } catch (err: any) {
      alert("Lỗi khi gỡ quyền: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Select candidate parameters side-effects mapping
  const handleSelectCandidate = (candidate: UserItem) => {
    setSelectedCandidate(candidate);
    setCanManageContent(!!candidate.canManageContent);
    setCanModerateComments(!!candidate.canModerateComments);
    setCanGrantPremium(!!candidate.canGrantPremium);
    setAssignRoleAdmin(candidate.role === "admin");
  };

  // Filter Active Administrators / Delegated Staff
  const delegatedStaff = users.filter(u => 
    u.canManageContent || u.canModerateComments || u.canGrantPremium || u.role === "admin"
  );

  // Search candidate user items list
  const candidateResults = users.filter(u => 
    searchCandidate && (
      u.email.toLowerCase().includes(searchCandidate.toLowerCase()) || 
      u.fullName?.toLowerCase().includes(searchCandidate.toLowerCase())
    )
  ).slice(0, 5); // limit output top matches

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-secondary">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        <span className="text-foreground/50">Đang nạp danh sách phân quyền...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <p className="font-bold text-red-400 max-w-md mx-auto">{error}</p>
        <button onClick={fetchUsers} className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg text-sm">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface/40 p-4 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span>Quản lý Đội ngũ Quản trị & Trợ lý</span>
          </h2>
          <p className="text-xs text-foreground/50 mt-0.5">
            Danh sách các tài khoản đang được phân quyền can thiệp vào hoạt động của website.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCandidate(null);
            setSearchCandidate("");
            setCanManageContent(false);
            setCanModerateComments(false);
            setCanGrantPremium(false);
            setAssignRoleAdmin(false);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-black rounded-xl font-extrabold text-xs hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Bổ nhiệm Quyền Mới</span>
        </button>
      </div>

      {/* Delegated Staff Roster Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface/20">
        {delegatedStaff.length === 0 ? (
          <div className="text-center py-16 text-foreground/40 text-xs">
            Chưa có tài khoản nào được phân quyền quản lý hệ thống. Hãy bấm &quot;Bổ nhiệm Quyền Mới&quot;.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-background/50 text-foreground/40 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Tài khoản Quản lý</th>
                <th className="py-3 px-4">Vai trò (Role)</th>
                <th className="py-3 px-4">Đặc quyền được giao (Granular Flags)</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {delegatedStaff.map((user) => {
                const isActing = actionLoading === user.id;
                const initials = (user.fullName || user.email).charAt(0).toUpperCase();

                return (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                            {initials}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-foreground/90 flex items-center gap-1.5 truncate max-w-[180px]">
                            {user.fullName || <span className="italic text-foreground/40">Chưa đặt tên</span>}
                          </div>
                          <div className="text-foreground/50 text-[11px] truncate max-w-[180px]">{user.email}</div>
                          {user.phone && <div className="text-[10px] text-secondary font-mono mt-0.5">📞 {user.phone}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {user.role === "admin" ? (
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-extrabold uppercase text-[9px]">
                          Admin Toàn quyền
                        </span>
                      ) : (
                        <span className="bg-surface border border-white/10 text-foreground/70 px-2 py-0.5 rounded font-medium text-[10px]">
                          Trợ lý Ủy quyền
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {user.canManageContent && (
                          <span className="bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1">
                            <Video className="w-3 h-3" /> Nội dung
                          </span>
                        )}
                        {user.canModerateComments && (
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Bình luận
                          </span>
                        )}
                        {user.canGrantPremium && (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Premium VIP
                          </span>
                        )}

                        {!user.canManageContent && !user.canModerateComments && !user.canGrantPremium && user.role === "admin" && (
                          <span className="text-foreground/40 italic text-[10px]">Kế thừa toàn bộ quyền Admin</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isActing ? (
                        <div className="flex justify-end"><Loader2 className="w-4 h-4 animate-spin text-red-400" /></div>
                      ) : (
                        <button
                          onClick={() => handleRevokeAccess(user)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all font-medium border border-red-500/20 text-[11px]"
                          title="Tước bỏ toàn bộ đặc quyền quản lý"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa quyền</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Interactive Appointment Config Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-left" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4" /> Bổ nhiệm Trợ lý Quản lý
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            {/* Step 1: Candidate search lookup */}
            {!selectedCandidate ? (
              <div className="space-y-3">
                <label className="text-xs text-foreground/70 block font-medium">1. Tìm kiếm Tài khoản Học viên:</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="text"
                    placeholder="Nhập địa chỉ Email hoặc Tên học viên..."
                    value={searchCandidate}
                    onChange={e => setSearchCandidate(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-cyan-400/50 transition-all"
                  />
                </div>

                {/* Candidate suggestions display */}
                {searchCandidate && (
                  <div className="bg-background rounded-xl border border-white/5 divide-y divide-white/5 max-h-40 overflow-y-auto">
                    {candidateResults.length === 0 ? (
                      <div className="p-3 text-center text-[11px] text-foreground/40">Không tìm thấy tài khoản phù hợp.</div>
                    ) : (
                      candidateResults.map(cand => (
                        <button
                          key={cand.id}
                          type="button"
                          onClick={() => handleSelectCandidate(cand)}
                          className="w-full text-left p-2.5 hover:bg-white/5 transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold truncate max-w-[200px]">{cand.fullName || cand.email?.split("@")[0]}</div>
                            <div className="text-[10px] text-foreground/40 truncate max-w-[200px]">{cand.email}</div>
                          </div>
                          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-medium">Chọn</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Step 2: Granular capabilities assignment switches */
              <form onSubmit={handleAppointSubmit} className="space-y-4">
                <div className="bg-background/50 rounded-xl p-3 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-foreground/40 block uppercase">Đang cấu hình quyền cho:</span>
                    <span className="font-bold text-secondary">{selectedCandidate.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCandidate(null)}
                    className="text-[10px] text-cyan-400 underline hover:text-cyan-300"
                  >
                    Đổi tài khoản
                  </button>
                </div>

                <div className="space-y-2.5 pt-1">
                  <label className="text-xs text-foreground/70 block font-bold border-b border-white/5 pb-1">
                    2. Thiết lập Cờ Đặc quyền Hoạt động:
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-surface/50 border border-white/5 hover:border-white/10 cursor-pointer transition-all">
                    <span className="text-xs text-foreground/90 font-medium">📁 Cập nhật Video & Tài liệu</span>
                    <input
                      type="checkbox"
                      checked={canManageContent}
                      onChange={e => setCanManageContent(e.target.checked)}
                      className="rounded bg-background border-border text-cyan-400 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-surface/50 border border-white/5 hover:border-white/10 cursor-pointer transition-all">
                    <span className="text-xs text-foreground/90 font-medium">💬 Kiểm duyệt Bình luận</span>
                    <input
                      type="checkbox"
                      checked={canModerateComments}
                      onChange={e => setCanModerateComments(e.target.checked)}
                      className="rounded bg-background border-border text-cyan-400 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-surface/50 border border-white/5 hover:border-white/10 cursor-pointer transition-all">
                    <span className="text-xs text-foreground/90 font-medium">👑 Cấp tài khoản Premium VIP</span>
                    <input
                      type="checkbox"
                      checked={canGrantPremium}
                      onChange={e => setCanGrantPremium(e.target.checked)}
                      className="rounded bg-background border-border text-cyan-400 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Super admin global upgrade optional mapping */}
                  <div className="pt-2">
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-purple-500/5 border border-purple-500/10 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignRoleAdmin}
                        onChange={e => setAssignRoleAdmin(e.target.checked)}
                        className="rounded bg-background border-border text-purple-400 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-[11px] text-purple-400 font-bold">Thăng cấp làm Admin Toàn quyền (Super Admin)</span>
                    </label>
                  </div>
                </div>

                {/* Submissions Action Boundary */}
                <div className="pt-3 border-t border-white/5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-surface border border-white/5 text-xs text-foreground/70"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1.5 px-5 py-2 bg-cyan-500 text-black rounded-xl font-bold text-xs hover:opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
                  >
                    {actionLoading !== null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                    <span>Xác nhận Bổ nhiệm</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
