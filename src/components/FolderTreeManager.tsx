"use client";

import { useState, useEffect, useCallback } from "react";
import { Folder, FolderOpen, FolderPlus, Plus, Trash2, ChevronRight, ChevronDown, Loader2, CornerDownRight } from "lucide-react";

interface FolderItem {
  id: number;
  name: string;
  type: string;
  parent_id: number | null;
}

interface FolderTreeManagerProps {
  folderType: "VIDEO" | "RESOURCE";
  selectedFolderId: number | null;
  onSelectFolder: (id: number | null) => void;
  onFolderTaxonomyChanged?: () => void;
}

export default function FolderTreeManager({ folderType, selectedFolderId, onSelectFolder, onFolderTaxonomyChanged }: FolderTreeManagerProps) {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingParentId, setCreatingParentId] = useState<number | null | "ROOT">(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/folders?type=${folderType}`);
      const data = await res.json();
      if (data.success) {
        setFolders(data.folders || []);
        // Tự động mở rộng các node cha mồi
        const expands: Record<number, boolean> = {};
        (data.folders || []).forEach((f: FolderItem) => {
          if (f.parent_id === null) expands[f.id] = true;
        });
        setExpandedNodes(expands);
      }
    } catch (err) {
      console.error("Failed to fetch folder taxonomy", err);
    } finally {
      setLoading(false);
    }
  }, [folderType]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Thêm thư mục mới
  const handleCreateFolder = async (e: React.FormEvent, targetParentId: number | null) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch("/api/admin/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          type: folderType,
          parent_id: targetParentId
        }),
      });

      const data = await res.json();
      if (data.success && data.folder) {
        setFolders(prev => [...prev, data.folder]);
        // Tự động bung node cha nếu vừa tạo con
        if (targetParentId) {
          setExpandedNodes(prev => ({ ...prev, [targetParentId]: true }));
        }
        onFolderTaxonomyChanged?.();
      } else {
        alert(data.error || "Tạo thư mục thất bại");
      }

      setNewFolderName("");
      setCreatingParentId(null);
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Xóa thư mục
  const handleDeleteFolder = async (id: number, name: string) => {
    if (!confirm(`Xóa chuyên mục "${name}"? Các tài nguyên bên trong sẽ tự động chuyển về gốc chưa phân loại.`)) return;

    try {
      const res = await fetch(`/api/admin/folders?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        // Nếu đang chọn node bị xóa, reset select
        if (selectedFolderId === id) onSelectFolder(null);
        // Lọc khỏi tree
        setFolders(prev => prev.filter(f => f.id !== id));
        onFolderTaxonomyChanged?.();
      }
    } catch (err: any) {
      alert("Lỗi xóa thư mục: " + err.message);
    }
  };

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Hàm đệ quy render cấu trúc Node
  const renderTreeNodes = (parentId: number | null, depth = 0) => {
    const childNodes = folders.filter(f => f.parent_id === parentId);
    if (childNodes.length === 0) return null;

    return (
      <div className={`space-y-1 ${depth > 0 ? 'ml-4 pl-3 border-l border-white/5 mt-1' : ''}`}>
        {childNodes.map(node => {
          const isSelected = selectedFolderId === node.id;
          const isExpanded = expandedNodes[node.id];
          const hasChildren = folders.some(f => f.parent_id === node.id);
          const isAddingChild = creatingParentId === node.id;

          return (
            <div key={node.id} className="space-y-1">
              <div
                onClick={() => onSelectFolder(isSelected ? null : node.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer group ${
                  isSelected 
                    ? "bg-secondary/10 border border-secondary/30 text-secondary font-bold" 
                    : "bg-surface/40 hover:bg-surface/80 border border-transparent text-foreground/80"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Chevron Mở rộng */}
                  <button
                    type="button"
                    onClick={e => toggleExpand(node.id, e)}
                    className="p-0.5 text-foreground/40 hover:text-foreground shrink-0"
                  >
                    {hasChildren ? (
                      isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                      <span className="w-3.5 h-3.5 block" />
                    )}
                  </button>

                  {/* Icon thư mục */}
                  <span className={isSelected ? "text-secondary" : "text-amber-400/80"}>
                    {isExpanded || isSelected ? <FolderOpen className="w-4 h-4 shrink-0" /> : <Folder className="w-4 h-4 shrink-0" />}
                  </span>

                  <span className="truncate">{node.name}</span>

                  {/* Cờ số lượng con */}
                  {hasChildren && (
                    <span className="text-[9px] bg-background text-foreground/40 px-1.5 py-0.5 rounded-md shrink-0">
                      {folders.filter(f => f.parent_id === node.id).length}
                    </span>
                  )}
                </div>

                {/* Operations thao tác nhánh */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => { setCreatingParentId(node.id); setNewFolderName(""); }}
                    className="p-1 hover:bg-secondary/10 text-secondary rounded transition-colors"
                    title="Tạo thư mục con"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteFolder(node.id, node.name)}
                    className="p-1 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                    title="Xóa thư mục"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Form chèn thư mục con ngay dưới Node */}
              {isAddingChild && (
                <form
                  onSubmit={e => handleCreateFolder(e, node.id)}
                  className="flex items-center gap-2 ml-6 pl-2 pr-3 py-1.5 bg-background/80 border border-secondary/30 rounded-xl animate-fade-in"
                >
                  <CornerDownRight className="w-3 h-3 text-secondary shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    required
                    placeholder="Tên thư mục con..."
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    className="bg-transparent text-xs text-foreground focus:outline-none w-full"
                  />
                  <button type="submit" className="text-xs text-secondary font-bold shrink-0 hover:underline">
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatingParentId(null)}
                    className="text-[10px] text-foreground/40 hover:text-foreground shrink-0"
                  >
                    Hủy
                  </button>
                </form>
              )}

              {/* Render recursive children */}
              {isExpanded && renderTreeNodes(node.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-surface/30 to-surface/10 border border-white/5 rounded-2xl p-4 space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <FolderTreeIcon />
          </span>
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Cây Thư Mục Phân Cấp</h3>
            <span className="text-[10px] text-foreground/40 block">Click vào thư mục để tự động lọc danh sách</span>
          </div>
        </div>

        {/* Nút reset / Mở form gốc */}
        <div className="flex items-center gap-2">
          {selectedFolderId !== null && (
            <button
              onClick={() => onSelectFolder(null)}
              className="text-[10px] text-secondary bg-secondary/10 border border-secondary/20 px-2 py-1 rounded-md hover:bg-secondary text-black font-bold transition-all"
            >
              Hiển thị Tất cả
            </button>
          )}

          <button
            onClick={() => { setCreatingParentId("ROOT"); setNewFolderName(""); }}
            className="p-1.5 bg-surface hover:bg-secondary/10 hover:text-secondary rounded-lg border border-white/5 transition-all text-foreground/60"
            title="Thêm Thư mục Gốc"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form tạo Root Folder */}
      {creatingParentId === "ROOT" && (
        <form
          onSubmit={e => handleCreateFolder(e, null)}
          className="flex items-center gap-2 px-3 py-2 bg-background border border-amber-500/30 rounded-xl animate-fade-in"
        >
          <FolderPlus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            required
            placeholder="Nhập tên chuyên mục gốc..."
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            className="bg-transparent text-xs text-foreground focus:outline-none w-full"
          />
          <button type="submit" className="text-xs text-amber-400 font-bold shrink-0 hover:underline">
            Tạo
          </button>
          <button
            type="button"
            onClick={() => setCreatingParentId(null)}
            className="text-[10px] text-foreground/40 hover:text-foreground shrink-0"
          >
            Hủy
          </button>
        </form>
      )}

      {/* Container cấu trúc cây */}
      <div className="pt-1">
        {loading ? (
          <div className="py-6 text-center text-amber-400"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
        ) : folders.length === 0 ? (
          <div className="py-6 text-center text-[11px] text-foreground/30 italic">
            Chưa có cây chuyên mục nào. Bấm nút dấu (+) bên trên để khởi tạo.
          </div>
        ) : (
          renderTreeNodes(null, 0)
        )}
      </div>
    </div>
  );
}

function FolderTreeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}
