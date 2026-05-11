"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Video, FileText, Plus, Trash2, Pencil, Loader2, X, Save } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"videos" | "resources">("videos");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

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

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mục này?")) return;
    try {
      await fetch(`/api/${activeTab}?id=${id}`, { method: "DELETE" });
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
      });
    } else {
      setFormData({
        title: item.title || "",
        description: item.description || "",
        link: item.link || "",
        type: item.type || "",
        isPremium: item.isPremium || false,
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
      } else {
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
      } else {
        payload.isPremium = payload.isPremium === "true" || payload.isPremium === true;
      }

      await fetch(`/api/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setIsAdding(false);
      setFormData({});
      fetchData();
    } catch (error) {
      alert("Lỗi khi thêm mới");
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
        <div className="w-full md:w-64 flex flex-col gap-2">
          <button 
            onClick={() => {setActiveTab("videos"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === "videos" ? "bg-secondary/10 border border-secondary/30 text-secondary" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <Video className="w-5 h-5" /> Quản lý Video
          </button>
          <button 
            onClick={() => {setActiveTab("resources"); setIsAdding(false); setEditingId(null);}}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === "resources" ? "bg-secondary/10 border border-secondary/30 text-secondary" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <FileText className="w-5 h-5" /> Quản lý Tài liệu
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-surface rounded-2xl border border-border p-6 min-h-[500px]">
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
            /* Table */
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
                      <th className="py-4 px-4 font-bold text-sm text-foreground/50 text-right">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="py-4 px-4 text-sm text-foreground/50">#{item.id}</td>
                        <td className="py-4 px-4 font-medium">
                          <div>{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-foreground/40 mt-1 max-w-[300px] truncate">{item.description}</div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-blue-400">
                          <a href={activeTab === "videos" ? item.youtubeUrl : item.link} target="_blank" rel="noreferrer" className="truncate block max-w-[200px] hover:text-blue-300 transition-colors">
                            {activeTab === "videos" ? item.youtubeUrl : item.link}
                          </a>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
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
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
