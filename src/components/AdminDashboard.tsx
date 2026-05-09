"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Video, FileText, Plus, Trash2, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"videos" | "resources">("videos");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
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
            onClick={() => {setActiveTab("videos"); setIsAdding(false);}}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === "videos" ? "bg-secondary/10 border border-secondary/30 text-secondary" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <Video className="w-5 h-5" /> Quản lý Video
          </button>
          <button 
            onClick={() => {setActiveTab("resources"); setIsAdding(false);}}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all ${activeTab === "resources" ? "bg-secondary/10 border border-secondary/30 text-secondary" : "bg-surface text-foreground/70 hover:bg-surface/80"}`}
          >
            <FileText className="w-5 h-5" /> Quản lý Tài liệu
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-surface rounded-2xl border border-border p-6 min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold capitalize">Danh sách {activeTab}</h2>
            {!isAdding && (
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 bg-secondary text-black px-4 py-2 rounded-lg font-bold hover:scale-105 transition-all shadow-[0_0_10px_rgba(0,255,133,0.3)]"
              >
                <Plus className="w-4 h-4" /> Thêm Mới
              </button>
            )}
          </div>

          {isAdding ? (
            <div className="bg-background rounded-xl p-6 border border-border animate-in fade-in">
              <h3 className="text-xl font-bold mb-4">Thêm {activeTab === "videos" ? "Video" : "Tài liệu"}</h3>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
                  <input required type="text" onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 min-h-[100px]" />
                </div>
                
                {activeTab === "videos" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Youtube URL (Link video) *</label>
                      <input required type="url" onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Thời lượng (VD: 15:20)</label>
                      <input type="text" onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3" />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <input type="checkbox" id="isFeatured" onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} className="w-5 h-5" />
                      <label htmlFor="isFeatured" className="text-sm font-medium">Đánh dấu là Video Nổi bật (Featured)</label>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Link tải (Drive/PDF) *</label>
                      <input required type="url" onChange={(e) => setFormData({...formData, link: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Loại file (VD: PDF, PPTX)</label>
                      <input type="text" onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3" />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <input type="checkbox" id="isPremium" onChange={(e) => setFormData({...formData, isPremium: e.target.checked})} className="w-5 h-5" />
                      <label htmlFor="isPremium" className="text-sm font-medium">Tài liệu Premium (Có phí/Khóa)</label>
                    </div>
                  </>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="bg-secondary text-black px-6 py-2 rounded-lg font-bold hover:opacity-90">
                    Lưu
                  </button>
                  <button type="button" onClick={() => setIsAdding(false)} className="bg-surface border border-border px-6 py-2 rounded-lg hover:bg-border/50">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 text-secondary">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20 text-foreground/50 border border-dashed border-border rounded-xl">
                  Chưa có dữ liệu. Hãy bấm "Thêm mới".
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
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 text-sm text-foreground/50">#{item.id}</td>
                        <td className="py-4 px-4 font-medium">{item.title}</td>
                        <td className="py-4 px-4 text-sm text-blue-400">
                          <a href={activeTab === "videos" ? item.youtubeUrl : item.link} target="_blank" rel="noreferrer" className="truncate block max-w-[200px]">
                            {activeTab === "videos" ? item.youtubeUrl : item.link}
                          </a>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
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
