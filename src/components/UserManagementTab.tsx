"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Search, Shield, Crown, Ban, Trash2, Mail,
  CheckCircle, XCircle, RefreshCw, ChevronDown, Filter,
  UserCheck, UserX, Star, Loader2, AlertTriangle, Eye, X
} from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone?: string | null;
  address?: string | null;
  occupation?: string | null;
  interests?: string | null;
  goals?: string | null;
  canManageContent?: boolean;
  canModerateComments?: boolean;
  canGrantPremium?: boolean;
  provider: string;
  role: string;
  isPremium: boolean;
  isBlocked: boolean;
  bannedUntil: string | null;
  emailConfirmed: boolean;
  lastSignIn: string | null;
  createdAt: string;
}

interface UserStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  premium: number;
  blocked: number;
  byProvider: { google: number; facebook: number; email: number };
}

const PROVIDER_LABELS: Record<string, { label: string; color: string }> = {
  google: { label: "Google", color: "text-red-400 bg-red-500/10" },
  facebook: { label: "Facebook", color: "text-blue-400 bg-blue-500/10" },
  email: { label: "Email", color: "text-gray-400 bg-gray-500/10" },
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Avatar({ user }: { user: UserItem }) {
  const initials = (user.fullName || user.email || "?").charAt(0).toUpperCase();
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt={initials} className="w-9 h-9 rounded-full object-cover border border-white/10" />;
  }
  return (
    <div className="w-9 h-9 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary font-bold text-sm">
      {initials}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: number; sub?: string; color: string }) {
  return (
    <div className={`rounded-xl p-4 border ${color} flex flex-col gap-1`}>
      <span className="text-xs text-foreground/50 font-medium">{label}</span>
      <span className="text-2xl font-black">{value.toLocaleString()}</span>
      {sub && <span className="text-xs text-foreground/40">{sub}</span>}
    </div>
  );
}

// Detail modal
function UserDetailModal({ user, onClose, onAction }: { user: UserItem; onClose: () => void; onAction: (userId: string, action: string, value: any) => Promise<void>; }) {
  const [loading, setLoading] = useState(false);
  const prov = PROVIDER_LABELS[user.provider] || { label: user.provider, color: "text-gray-400 bg-gray-500/10" };

  const doAction = async (action: string, value: any) => {
    setLoading(true);
    await onAction(user.id, action, value);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-5">
          <h3 className="text-lg font-bold flex items-center gap-2"><Eye className="w-5 h-5 text-secondary" /> Chi tiết người dùng</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-all"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/5">
          <Avatar user={user} />
          <div>
            <div className="font-bold">{user.fullName || "Chưa đặt tên"}</div>
            <div className="text-sm text-foreground/50">{user.email}</div>
            <div className="flex gap-2 mt-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prov.color}`}>{prov.label}</span>
              {user.isPremium && <span className="text-xs px-2 py-0.5 rounded-full font-medium text-amber-400 bg-amber-500/10">Premium</span>}
              {user.isBlocked && <span className="text-xs px-2 py-0.5 rounded-full font-medium text-red-400 bg-red-500/10">Bị khóa</span>}
              {!user.emailConfirmed && <span className="text-xs px-2 py-0.5 rounded-full font-medium text-orange-400 bg-orange-500/10">Chưa xác thực</span>}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between"><span className="text-foreground/50">Đăng ký</span><span>{fmtDate(user.createdAt)}</span></div>
          <div className="flex justify-between"><span className="text-foreground/50">Đăng nhập cuối</span><span>{fmtDateTime(user.lastSignIn)}</span></div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/50">Quyền hệ thống</span>
            <select
              value={user.role}
              onChange={(e) => doAction("setRole", e.target.value)}
              className="bg-surface border border-white/10 rounded px-2 py-0.5 text-xs font-bold text-secondary focus:outline-none cursor-pointer"
            >
              <option value="user">Học viên (User)</option>
              <option value="admin">Quản trị (Admin)</option>
            </select>
          </div>
          <div className="flex justify-between"><span className="text-foreground/50">Email xác thực</span>{user.emailConfirmed ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}</div>
        </div>

        {/* Ngữ cảnh AI & Định hướng cá nhân */}
        <div className="bg-background/40 rounded-xl p-3 border border-white/5 space-y-2 mb-5 text-xs">
          <div className="font-bold text-[10px] text-secondary uppercase tracking-wider">🧠 Tri thức AI & Định hướng</div>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <div>
              <span className="text-foreground/40 block text-[9px]">SĐT / Zalo:</span>
              <span className="font-mono text-foreground font-bold">{user.phone || "—"}</span>
            </div>
            <div>
              <span className="text-foreground/40 block text-[9px]">Khu vực:</span>
              <span className="text-foreground truncate block">{user.address || "—"}</span>
            </div>
          </div>
          {user.occupation && (
            <div>
              <span className="text-foreground/40 block text-[9px]">Nghề nghiệp:</span>
              <span className="text-foreground font-medium">{user.occupation}</span>
            </div>
          )}
          {user.interests && (
            <div>
              <span className="text-foreground/40 block text-[9px]">Sở thích công nghệ:</span>
              <span className="text-secondary/90 line-clamp-1">{user.interests}</span>
            </div>
          )}
          {user.goals && (
            <div>
              <span className="text-foreground/40 block text-[9px]">Mục tiêu ứng dụng:</span>
              <p className="text-foreground/80 bg-surface/60 p-2 rounded border border-white/5 mt-0.5 leading-relaxed line-clamp-3">
                {user.goals}
              </p>
            </div>
          )}
        </div>

        {/* Phân quyền Quản lý Chi tiết (RBAC) */}
        <div className="bg-surface/50 rounded-xl p-3 border border-white/5 space-y-2 mb-5 text-xs">
          <div className="font-bold text-[10px] text-cyan-400 uppercase tracking-wider flex items-center justify-between">
            <span>🔐 Ủy quyền Trợ lý Quản trị</span>
            <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-1 py-0.2 rounded font-bold">RBAC</span>
          </div>
          
          <div className="space-y-1.5 pt-1">
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors">
              <span className="text-foreground/80 text-xs">📁 Cập nhật Video & Tài liệu</span>
              <input
                type="checkbox"
                checked={!!user.canManageContent}
                onChange={(e) => doAction("setPermissions", {
                  canManageContent: e.target.checked,
                  canModerateComments: !!user.canModerateComments,
                  canGrantPremium: !!user.canGrantPremium,
                })}
                className="rounded bg-background border-border text-secondary focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors">
              <span className="text-foreground/80 text-xs">💬 Duyệt bình luận học viên</span>
              <input
                type="checkbox"
                checked={!!user.canModerateComments}
                onChange={(e) => doAction("setPermissions", {
                  canManageContent: !!user.canManageContent,
                  canModerateComments: e.target.checked,
                  canGrantPremium: !!user.canGrantPremium,
                })}
                className="rounded bg-background border-border text-secondary focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors">
              <span className="text-foreground/80 text-xs">👑 Cấp tài khoản Premium VIP</span>
              <input
                type="checkbox"
                checked={!!user.canGrantPremium}
                onChange={(e) => doAction("setPermissions", {
                  canManageContent: !!user.canManageContent,
                  canModerateComments: !!user.canModerateComments,
                  canGrantPremium: e.target.checked,
                })}
                className="rounded bg-background border-border text-secondary focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-secondary" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => doAction("setPremium", !user.isPremium)} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${user.isPremium ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20" : "bg-surface border border-border hover:bg-white/5"}`}>
              <Crown className="w-4 h-4" />{user.isPremium ? "Hủy Premium" : "Cấp Premium"}
            </button>
            <button onClick={() => doAction("ban", !user.isBlocked)} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${user.isBlocked ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}>
              {user.isBlocked ? <><UserCheck className="w-4 h-4" /> Mở khóa</> : <><Ban className="w-4 h-4" /> Khóa TK</>}
            </button>
            {!user.emailConfirmed && (
              <button onClick={() => doAction("confirmEmail", true)} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all col-span-2">
                <Mail className="w-4 h-4" /> Xác nhận Email thủ công
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserManagementTab() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterProvider, setFilterProvider] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users);
      setStats(data.stats);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (userId: string, action: string, value: any) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchUsers();
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Xóa vĩnh viễn tài khoản "${email}"?\nHành động này không thể hoàn tác!`)) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchUsers();
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.email?.toLowerCase().includes(q) || u.fullName?.toLowerCase().includes(q);
    const matchProvider = filterProvider === "all" || u.provider === filterProvider;
    const matchStatus =
      filterStatus === "all" ? true :
      filterStatus === "premium" ? u.isPremium :
      filterStatus === "blocked" ? u.isBlocked :
      filterStatus === "unconfirmed" ? !u.emailConfirmed : true;
    return matchSearch && matchProvider && matchStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-secondary">
      <Loader2 className="w-8 h-8 animate-spin mr-3" />
      <span className="text-foreground/50">Đang tải danh sách người dùng...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400" />
      <div>
        <p className="font-bold text-red-400 mb-1">Không thể tải dữ liệu</p>
        <p className="text-sm text-foreground/50 max-w-sm">{error}</p>
        {error.includes("SERVICE_ROLE_KEY") && (
          <p className="text-xs text-amber-400 mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 max-w-sm">
            ⚠️ Cần thêm <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> vào file <code>.env.local</code> và Vercel Environment Variables.
          </p>
        )}
      </div>
      <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg hover:bg-secondary/20 transition-all text-sm font-medium">
        <RefreshCw className="w-4 h-4" /> Thử lại
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard label="Tổng users" value={stats.total} color="bg-secondary/5 border-secondary/20" />
          <StatCard label="Hôm nay" value={stats.today} sub="đăng ký mới" color="bg-cyan-500/5 border-cyan-500/20" />
          <StatCard label="Tháng này" value={stats.thisMonth} sub="đăng ký mới" color="bg-blue-500/5 border-blue-500/20" />
          <StatCard label="Premium" value={stats.premium} color="bg-amber-500/5 border-amber-500/20" />
          <StatCard label="Google" value={stats.byProvider.google} color="bg-red-500/5 border-red-500/20" />
          <StatCard label="Bị khóa" value={stats.blocked} color="bg-red-900/20 border-red-800/30" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Tìm theo email hoặc tên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-background border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-secondary/50 focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all"
          />
        </div>
        <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)} className="bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-secondary/50 focus:outline-none transition-all cursor-pointer">
          <option value="all">Tất cả nguồn</option>
          <option value="google">Google</option>
          <option value="facebook">Facebook</option>
          <option value="email">Email</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-secondary/50 focus:outline-none transition-all cursor-pointer">
          <option value="all">Tất cả trạng thái</option>
          <option value="premium">Premium</option>
          <option value="blocked">Bị khóa</option>
          <option value="unconfirmed">Chưa xác thực</option>
        </select>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm hover:bg-white/5 transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Results count */}
      <div className="text-sm text-foreground/40">
        Hiển thị <span className="text-foreground font-medium">{filtered.length}</span> / {users.length} người dùng
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-foreground/40 border border-dashed border-border rounded-xl">
          Không tìm thấy người dùng nào.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-background/50">
                <th className="py-3 px-4 text-xs font-bold text-foreground/40 uppercase tracking-wider">Người dùng</th>
                <th className="py-3 px-4 text-xs font-bold text-foreground/40 uppercase tracking-wider">Nguồn</th>
                <th className="py-3 px-4 text-xs font-bold text-foreground/40 uppercase tracking-wider">Trạng thái</th>
                <th className="py-3 px-4 text-xs font-bold text-foreground/40 uppercase tracking-wider">Đăng ký</th>
                <th className="py-3 px-4 text-xs font-bold text-foreground/40 uppercase tracking-wider">Đăng nhập cuối</th>
                <th className="py-3 px-4 text-xs font-bold text-foreground/40 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const prov = PROVIDER_LABELS[user.provider] || { label: user.provider, color: "text-gray-400 bg-gray-500/10" };
                const isActing = actionLoading === user.id;
                return (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} />
                        <div>
                          <div className="font-medium text-sm flex items-center gap-1.5">
                            {user.fullName || <span className="text-foreground/40 italic">Chưa đặt tên</span>}
                            {user.isPremium && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          </div>
                          <div className="text-xs text-foreground/40 flex items-center gap-1">
                            {user.emailConfirmed ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                            {user.email}
                          </div>
                          {(user.phone || user.occupation) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {user.phone && <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-1.5 py-0.2 rounded font-mono">📞 {user.phone}</span>}
                              {user.occupation && <span className="text-[10px] bg-surface text-foreground/70 border border-white/5 px-1.5 py-0.2 rounded truncate max-w-[150px]">💼 {user.occupation}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${prov.color}`}>{prov.label}</span>
                    </td>
                    <td className="py-3 px-4">
                      {user.isBlocked ? (
                        <span className="text-xs px-2 py-1 rounded-full font-medium text-red-400 bg-red-500/10 flex items-center gap-1 w-fit"><Ban className="w-3 h-3" /> Khóa</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full font-medium text-green-400 bg-green-500/10 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Hoạt động</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-foreground/50">{fmtDate(user.createdAt)}</td>
                    <td className="py-3 px-4 text-xs text-foreground/50">{fmtDateTime(user.lastSignIn)}</td>
                    <td className="py-3 px-4">
                      {isActing ? (
                        <div className="flex justify-end"><Loader2 className="w-5 h-5 animate-spin text-secondary" /></div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setSelectedUser(user)} title="Chi tiết" className="p-1.5 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-all">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleAction(user.id, "setPremium", !user.isPremium)} title={user.isPremium ? "Hủy Premium" : "Cấp Premium"} className={`p-1.5 rounded-lg transition-all ${user.isPremium ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" : "bg-surface border border-border hover:bg-white/5 text-foreground/50"}`}>
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleAction(user.id, "ban", !user.isBlocked)} title={user.isBlocked ? "Mở khóa" : "Khóa tài khoản"} className={`p-1.5 rounded-lg transition-all ${user.isBlocked ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}>
                            {user.isBlocked ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleDelete(user.id, user.email || "")} title="Xóa tài khoản" className="p-1.5 bg-red-900/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
