"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Video, FileText, Plus, Trash2, Pencil, Loader2, X, Save, Eye, BarChart3, Users, Crown, MessageSquare, Shield, ClipboardList, Sparkles, Gift, Layers, Smartphone, Award, TrendingUp } from "lucide-react";
import UserManagementTab from "./UserManagementTab";
import CommentModerationTab from "./CommentModerationTab";
import RoleDelegationTab from "./RoleDelegationTab";
import AuditLogsTab from "./AuditLogsTab";
import AiTrendsAnalyticsTab from "./AiTrendsAnalyticsTab";
import DailyTasksAdminTab from "./DailyTasksAdminTab";
import FolderTreeManager from "./FolderTreeManager";
import SaaSAndAffiliateSettingsTab from "./SaaSAndAffiliateSettingsTab";
import { ViewportSimulatorTab } from "./ViewportSimulatorTab";
import { CertificateManagementTab } from "./CertificateManagementTab";
import { GrowthAnalyticsTab } from "./GrowthAnalyticsTab";
import { KnowledgeBaseTab } from "./KnowledgeBaseTab";
import { useAuth } from "@/components/AuthProvider";

interface ViewStats {
  today: number;
  week: number;
  month: number;
  year: number;
  total: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"videos" | "resources" | "users" | "premium" | "comments" | "roles" | "logs" | "trends" | "tasks" | "settings" | "simulator" | "certificates" | "growth" | "knowledge">("videos");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  // View stats for resources
  const [viewStats, setViewStats] = useState<Record<number, ViewStats>>({});
  const [showStatsId, setShowStatsId] = useState<number | null>(null);

  // Folder Taxonomy states
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [foldersList, setFoldersList] = useState<any[]>([]);

  const fetchFoldersList = async (type: string) => {
    try {
      const res = await fetch(`/api/admin/folders?type=${type}`);
      const data = await res.json();
      const loaded = data.folders || [];
      if (loaded.length > 0) {
        setFoldersList(loaded);
      } else {
        setFoldersList([
          { id: 1, name: "🚀 Khởi Đầu Trí Tuệ Nhân Tạo", type: "RESOURCE", parent_id: null },
          { id: 2, name: "⚡ Kỹ thuật Prompt Nâng Cao", type: "RESOURCE", parent_id: 1 },
          { id: 3, name: "🤖 Tự Động Hóa Thực Chiến", type: "VIDEO", parent_id: null },
          { id: 4, name: "🔗 n8n Workflow Enterprise", type: "VIDEO", parent_id: 3 },
          { id: 5, name: "📦 Make.com Templates", type: "RESOURCE", parent_id: null }
        ].filter(f => f.type === type));
      }
    } catch {
      // Giữ nguyên danh sách hiện tại
    }
  };


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/${activeTab}`);
      const data = await res.json();
      setItems(data[activeTab] || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchViewStats = async () => {
    try {
      const res = await fetch("/api/resources/views");
      const data = await res.json();
      setViewStats(data.stats || {});
    } catch (error) {
      console.error("Failed to fetch view stats", error);
    }
  };

  useEffect(() => {
    fetchData();
    setSelectedFolderId(null);
    if (activeTab === "resources") {
      fetchViewStats();
      fetchFoldersList("RESOURCE");
    } else if (activeTab === "videos") {
      fetchFoldersList("VIDEO");
    }
  }, [activeTab]);

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
      // fail silently for telemetry
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mục này?")) return;
    try {
      const deletedItem = items.find(i => i.id === id);
      const title = deletedItem?.title || `#${id}`;
      
      await fetch(`/api/${activeTab}?id=${id}`, { method: "DELETE" });
      
      // Log telemetries
      logAudit(
        activeTab === "videos" ? "DELETE_VIDEO" : "DELETE_RESOURCE",
        `${activeTab === "videos" ? "Video" : "Tài liệu"}: ${title}`,
        { id }
      );
      
      fetchData();
    } catch (error) {
      alert("Lỗi khi xóa");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setIsAdding(false);
    // Pre-fill form with existing data
    if (activeTab === "videos") {
      setFormData({
        title: item.title || "",
        description: item.description || "",
        youtubeUrl: item.youtubeUrl || "",
        duration: item.duration || "",
        isFeatured: item.isFeatured || false,
        folder_id: item.folder_id || item.folderId || null,
      });
    } else if (activeTab === "premium") {
      setFormData({
        title: item.title || "",
        description: item.description || "",
        link: item.link || "",
        category: item.category || "Workflow",
      });
    } else {
      setFormData({
        title: item.title || "",
        description: item.description || "",
        link: item.link || "",
        type: item.type || "",
        isPremium: item.isPremium || false,
        folder_id: item.folder_id || item.folderId || null,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const payload = { ...formData };
      if (activeTab === "videos") {
        payload.isFeatured = payload.isFeatured === "true" || payload.isFeatured === true;
      } else if (activeTab === "resources") {
        payload.isPremium = payload.isPremium === "true" || payload.isPremium === true;
      }

      const res = await fetch(`/api/${activeTab}?id=${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Lỗi cập nhật");
      }

      // Log telemetries
      logAudit(
        activeTab === "videos" ? "UPDATE_VIDEO" : "UPDATE_RESOURCE",
        `${activeTab === "videos" ? "Video" : "Tài liệu"}: ${payload.title}`,
        { id: editingId, ...payload }
      );

      setEditingId(null);
      setFormData({});
      fetchData();
    } catch (error: any) {
      alert("Lỗi khi cập nhật: " + error.message);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (activeTab === "videos") {
        payload.isFeatured = payload.isFeatured === "true" || payload.isFeatured === true;
      } else if (activeTab === "resources") {
        payload.isPremium = payload.isPremium === "true" || payload.isPremium === true;
      }

      const res = await fetch(`/api/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Lỗi khi thêm mới");
      }

      // Log telemetries
      logAudit(
        activeTab === "videos" ? "CREATE_VIDEO" : "CREATE_RESOURCE",
        `${activeTab === "videos" ? "Video" : "Tài liệu"}: ${payload.title}`,
        { ...payload }
      );

      setIsAdding(false);
      setFormData({});
      fetchData();
    } catch (error: any) {
      alert("Lỗi: " + error.message);
    }
  };

  // Reusable form fields component
  const renderFormFields = (isEdit: boolean = false) => (
    <>
      <div>
        <label className="block text-sm font-medium mb-1 text-foreground/70">Tiêu đề *</label>
        <input
          required
          type="text"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all"
          placeholder="Nhập tiêu đề..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-foreground/70">Mô tả</label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-surface border border-white/10 rounded-lg p-3 min-h-[100px] text-foreground focus:border-secondary/50 focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all resize-y"
          placeholder="Nhập mô tả..."
        />
      </div>

      {(activeTab === "videos" || activeTab === "resources") && (
        <div>
          <label className="block text-sm font-medium mb-1 text-amber-400 font-bold">📁 Chọn Thư Mục Chủ Đề</label>
          <select
            value={formData.folder_id || ""}
            onClick={() => fetchFoldersList(activeTab === "videos" ? "VIDEO" : "RESOURCE")}
            onFocus={() => fetchFoldersList(activeTab === "videos" ? "VIDEO" : "RESOURCE")}
            onChange={(e) => setFormData({ ...formData, folder_id: e.target.value ? Number(e.target.value) : null })}
            className="w-full bg-surface border border-amber-500/30 rounded-lg p-3 text-foreground focus:border-amber-400 focus:outline-none transition-all cursor-pointer"
          >
            <option value="">— Không thuộc thư mục nào (Gốc) —</option>
            {foldersList.map(f => (
              <option key={f.id} value={f.id}>
                {f.parent_id ? "↳ " : ""}{f.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeTab === "videos" ? (
        <>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/70">Youtube URL (Link video) *</label>
            <input
              required
              type="url"
              value={formData.youtubeUrl || ""}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/70">Thời lượng (VD: 15:20)</label>
            <input
              type="text"
              value={formData.duration || ""}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all"
              placeholder="00:00"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id={`isFeatured-${isEdit ? "edit" : "add"}`}
              checked={formData.isFeatured || false}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-5 h-5 accent-secondary"
            />
            <label htmlFor={`isFeatured-${isEdit ? "edit" : "add"}`} className="text-sm font-medium text-foreground/70">
              Đánh dấu là Video Nổi bật (Featured)
            </label>
          </div>
        </>
      ) : activeTab === "premium" ? (
        <>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/70">Link bảo mật (File JSON / Tài nguyên) *</label>
            <input
              required
              type="url"
              value={formData.link || ""}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/70">Danh mục (VD: Make/n8n Workflow, AI Prompt)</label>
            <input
              type="text"
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all"
              placeholder="Make/n8n Workflow"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/70">Link tải (Drive/PDF) *</label>
            <input
              required
              type="url"
              value={formData.link || ""}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all"
              placeholder="https://drive.google.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/70">Loại file (VD: PDF, PPTX)</label>
            <input
              type="text"
              value={formData.type || ""}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-surface border border-white/10 rounded-lg p-3 text-foreground focus:border-secondary/50 focus:outline-none focus:ring-1 focus:ring-secondary/30 transition-all"
              placeholder="PDF"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id={`isPremium-${isEdit ? "edit" : "add"}`}
              checked={formData.isPremium || false}
              onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
              className="w-5 h-5 accent-secondary"
            />
            <label htmlFor={`isPremium-${isEdit ? "edit" : "add"}`} className="text-sm font-medium text-foreground/70">
              Tài liệu Premium (Có phí/Khóa)
            </label>
          </div>
        </>
      )}
    </>
  );

  const isStudentAccount = user && user.app_metadata?.role !== "admin" && (user as any).user_metadata?.role !== "admin";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (isStudentAccount) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl text-center border border-red-500/30 shadow-2xl animate-scale-up">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Quyền truy cập bị từ chối</h2>
          <p className="text-sm text-foreground/70 mb-6">
            Tài khoản học viên (<span className="text-secondary font-bold">{user.email}</span>) không có quyền truy cập hệ thống Quản trị viên CMS.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={async () => {
                await signOut();
                window.location.href = "/admin/login";
              }}
              className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              Đăng xuất tài khoản học viên
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 bg-surface border border-border text-foreground/70 rounded-xl font-bold text-sm hover:text-foreground transition-all"
            >
              Quay lại Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-secondary flex items-center gap-2">
            ZentraTech CMS
          </h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex md:flex-col gap-2 overflow-x-auto pb-3 md:pb-0 scrollbar-none shrink-0 border-b border-white/5 md:border-b-0">
          <button 
            onClick={() => {setActiveTab("videos"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "videos" ? "bg-secondary/10 border border-secondary/30 text-secondary font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <Video className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> Quản lý Video
          </button>
          <button 
            onClick={() => {setActiveTab("resources"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "resources" ? "bg-secondary/10 border border-secondary/30 text-secondary font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <FileText className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> Quản lý Tài liệu
          </button>
          <button 
            onClick={() => {setActiveTab("users"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "users" ? "bg-secondary/10 border border-secondary/30 text-secondary font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <Users className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> Quản lý User
          </button>
          <button 
            onClick={() => {setActiveTab("roles"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "roles" ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <Shield className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-cyan-400" /> Phân quyền
          </button>
          <button 
            onClick={() => {setActiveTab("premium"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "premium" ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <Crown className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-amber-400" /> Premium
          </button>
          <button 
            onClick={() => {setActiveTab("comments"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "comments" ? "bg-secondary/10 border border-secondary/30 text-secondary font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5 shrink-0" /> Bình luận
          </button>
          <button 
            onClick={() => {setActiveTab("logs"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "logs" ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <ClipboardList className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-blue-400" /> Nhật ký
          </button>
          <button 
            onClick={() => {setActiveTab("trends"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "trends" ? "bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-purple-400" /> AI Xu hướng
          </button>
          <button 
            onClick={() => {setActiveTab("tasks"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "tasks" ? "bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <Gift className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-orange-400" /> Đổi thưởng
          </button>
          <button 
            onClick={() => {setActiveTab("settings"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "settings" ? "bg-secondary/10 border border-secondary/30 text-secondary font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <Layers className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-secondary" /> Cấu hình SaaS
          </button>
          <button 
            onClick={() => {setActiveTab("simulator"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "simulator" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <Smartphone className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-emerald-400" /> Giả lập Giao diện
          </button>
          <button 
            onClick={() => {setActiveTab("certificates"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "certificates" ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <Award className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-rose-400" /> Quản lý Chứng chỉ
          </button>
          <button 
            onClick={() => {setActiveTab("growth"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "growth" ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-amber-400" /> Phân tích Tăng trưởng
          </button>
          <button 
            onClick={() => {setActiveTab("knowledge"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:p-4 rounded-xl transition-all whitespace-nowrap shrink-0 text-xs md:text-sm font-medium ${activeTab === "knowledge" ? "bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-purple-400" /> 🧠 Tri thức AI
          </button>
        </div>


        {/* Content */}
        <div className="flex-1 bg-surface rounded-2xl border border-border p-6 min-h-[500px]">
          {activeTab === "settings" ? (
            <SaaSAndAffiliateSettingsTab />
          ) : activeTab === "users" ? (
            <UserManagementTab />
          ) : activeTab === "roles" ? (
            <RoleDelegationTab />
          ) : activeTab === "logs" ? (
            <AuditLogsTab />
          ) : activeTab === "trends" ? (
            <AiTrendsAnalyticsTab />
          ) : activeTab === "tasks" ? (
            <DailyTasksAdminTab />
          ) : activeTab === "comments" ? (
            <CommentModerationTab />
          ) : activeTab === "simulator" ? (
            <ViewportSimulatorTab />
          ) : activeTab === "certificates" ? (
            <CertificateManagementTab />
          ) : activeTab === "growth" ? (
            <GrowthAnalyticsTab />
          ) : activeTab === "knowledge" ? (
            <KnowledgeBaseTab />
          ) : (

          <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold capitalize">Danh sách {activeTab}</h2>
            {!isAdding && editingId === null && (
              <button 
                onClick={() => { setIsAdding(true); setEditingId(null); setFormData({}); }}
                className="flex items-center gap-2 bg-secondary text-black px-4 py-2 rounded-lg font-bold hover:scale-105 transition-all shadow-[0_0_10px_rgba(0,255,133,0.3)]"
              >
                <Plus className="w-4 h-4" /> Thêm Mới
              </button>
            )}
          </div>

          {/* Add Form */}
          {isAdding ? (
            <div className="bg-background rounded-xl p-6 border border-secondary/20 shadow-[0_0_20px_rgba(0,255,133,0.05)]">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-secondary" />
                Thêm {activeTab === "videos" ? "Video" : "Tài liệu"} mới
              </h3>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                {renderFormFields(false)}
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button type="submit" className="flex items-center gap-2 bg-secondary text-black px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-[0_0_10px_rgba(0,255,133,0.2)]">
                    <Save className="w-4 h-4" /> Lưu
                  </button>
                  <button type="button" onClick={() => { setIsAdding(false); setFormData({}); }} className="flex items-center gap-2 bg-surface border border-border px-6 py-2.5 rounded-lg hover:bg-border/50 transition-all">
                    <X className="w-4 h-4" /> Hủy
                  </button>
                </div>
              </form>
            </div>
          ) : editingId !== null ? (
            /* Edit Form */
            <div className="bg-background rounded-xl p-6 border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-400" />
                <span>Chỉnh sửa {activeTab === "videos" ? "Video" : "Tài liệu"}</span>
                <span className="text-sm font-normal text-foreground/40 ml-2">#{editingId}</span>
              </h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {renderFormFields(true)}
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button type="submit" className="flex items-center gap-2 bg-amber-500 text-black px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <Save className="w-4 h-4" /> Cập nhật
                  </button>
                  <button type="button" onClick={handleCancelEdit} className="flex items-center gap-2 bg-surface border border-border px-6 py-2.5 rounded-lg hover:bg-border/50 transition-all">
                    <X className="w-4 h-4" /> Hủy
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Table & Taxonomy Tree Studio */
            <div className="space-y-6">
              {(activeTab === "videos" || activeTab === "resources") && (
                <FolderTreeManager
                  folderType={activeTab === "videos" ? "VIDEO" : "RESOURCE"}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={setSelectedFolderId}
                  onFolderTaxonomyChanged={() => fetchFoldersList(activeTab === "videos" ? "VIDEO" : "RESOURCE")}
                />
              )}

              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20 text-secondary">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-20 text-foreground/50 border border-dashed border-border rounded-xl">
                    Chưa có dữ liệu. Hãy bấm &quot;Thêm mới&quot;.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-4 px-4 font-bold text-sm text-foreground/50">ID</th>
                        <th className="py-4 px-4 font-bold text-sm text-foreground/50">TIÊU ĐỀ</th>
                        <th className="py-4 px-4 font-bold text-sm text-foreground/50">LINK</th>
                        {activeTab === "resources" && (
                          <th className="py-4 px-4 font-bold text-sm text-foreground/50 text-center">LƯỢT XEM</th>
                        )}
                        <th className="py-4 px-4 font-bold text-sm text-foreground/50 text-right">THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items
                        .filter(item => selectedFolderId === null || item.folder_id === selectedFolderId || item.folderId === selectedFolderId)
                        .map((item) => {
                          const stats = activeTab === "resources" ? viewStats[item.id] : null;
                      return (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="py-4 px-4 text-sm text-foreground/50">#{item.id}</td>
                        <td className="py-4 px-4 font-medium">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{item.title}</span>
                            {(() => {
                              const fId = item.folder_id ?? item.folderId;
                              const targetFolder = foldersList.find(f => f.id === fId);
                              if (!targetFolder) return null;
                              return (
                                <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-md font-bold shrink-0">
                                  📁 {targetFolder.name}
                                </span>
                              );
                            })()}
                            {activeTab === "premium" && item.category && (
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold shrink-0">
                                {item.category}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <div className="text-xs text-foreground/40 mt-1 max-w-[300px] truncate">{item.description}</div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-blue-400">
                          <a href={activeTab === "videos" ? item.youtubeUrl : item.link} target="_blank" rel="noreferrer" className="truncate block max-w-[200px] hover:text-blue-300 transition-colors">
                            {activeTab === "videos" ? item.youtubeUrl : item.link}
                          </a>
                        </td>
                        {activeTab === "resources" && (
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => setShowStatsId(showStatsId === item.id ? null : item.id)}
                              className="inline-flex items-center gap-1.5 text-xs bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-1.5 rounded-lg font-bold hover:bg-secondary/20 transition-all"
                              title="Xem thống kê lượt xem"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {stats?.total || 0}
                            </button>
                            {showStatsId === item.id && stats && (
                              <div className="absolute z-50 mt-2 right-auto bg-background border border-border rounded-xl p-4 shadow-2xl shadow-black/50 min-w-[220px] text-left">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                                  <BarChart3 className="w-4 h-4 text-secondary" />
                                  <span className="text-sm font-bold">Thống kê lượt xem</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-cyan-400">Hôm nay</span>
                                    <span className="font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-md">{stats.today}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-blue-400">Tuần này</span>
                                    <span className="font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md">{stats.week}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-purple-400">Tháng này</span>
                                    <span className="font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-md">{stats.month}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-amber-400">Năm nay</span>
                                    <span className="font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md">{stats.year}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
                                    <span className="text-secondary font-medium">Tổng cộng</span>
                                    <span className="font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-md">{stats.total}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        )}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(activeTab === "videos" || activeTab === "resources") && (
                              <select
                                value={item.folder_id || item.folderId || ""}
                                onChange={async (e) => {
                                  const newFolderId = e.target.value ? Number(e.target.value) : null;
                                  try {
                                    const res = await fetch(`/api/${activeTab}?id=${item.id}`, {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ folder_id: newFolderId })
                                    });
                                    if (res.ok) {
                                      fetchData();
                                    } else {
                                      alert("Lỗi di chuyển thư mục");
                                    }
                                  } catch { alert("Lỗi kết nối"); }
                                }}
                                className="text-[11px] bg-surface/90 border border-white/10 rounded-lg px-2 py-1 text-foreground/70 hover:text-amber-400 focus:outline-none focus:border-amber-400 transition-all max-w-[130px] truncate"
                                title="Chuyển nhanh vào thư mục"
                              >
                                <option value="">[Gốc]</option>
                                {foldersList.map(f => (
                                  <option key={f.id} value={f.id}>
                                    {f.name}
                                  </option>
                                ))}
                              </select>
                            )}

                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500 hover:text-black transition-all"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            </div>
          )}
          </>
          )}
        </div>
      </main>
    </div>
  );
}
