"use client";

import { useState, useEffect } from "react";
import {
  Brain, Database, RefreshCw, Trash2, Plus, Loader2,
  FileText, Video, BookOpen, Sparkles, AlertTriangle,
  CheckCircle2, ChevronDown, ChevronUp, Zap
} from "lucide-react";

interface KnowledgeGroup {
  source_title: string;
  source_type: string;
  source_id: string | null;
  chunk_count: number;
}

interface IngestStats {
  total: number;
  bySourceType: {
    RESOURCE: number;
    VIDEO: number;
    OTHER: number;
  };
}

export function KnowledgeBaseTab() {
  const [groups, setGroups] = useState<KnowledgeGroup[]>([]);
  const [stats, setStats] = useState<IngestStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<any>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    sourceTitle: "",
    sourceType: "MANUAL",
    content: "",
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Tải danh sách và stats
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [chunksRes, statsRes] = await Promise.all([
        fetch("/api/knowledge?limit=200"),
        fetch("/api/knowledge/ingest"),
      ]);

      const chunksData = await chunksRes.json();
      const statsData = await statsRes.json();

      if (chunksData.success) {
        setGroups(
          (chunksData.data || []).map((g: any) => ({
            source_title: g.source_title,
            source_type: g.source_type,
            source_id: g.source_id,
            chunk_count: g.chunk_count,
          }))
        );
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error("Failed to load knowledge data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Nạp tự động từ Resources + Videos
  const handleAutoIngest = async () => {
    if (!confirm("Bạn có muốn nạp/cập nhật tri thức từ toàn bộ Thư viện Tài liệu và Video? Quá trình này có thể mất vài phút.")) return;
    setIsIngesting(true);
    setIngestResult(null);
    try {
      const res = await fetch("/api/knowledge/ingest", { method: "POST" });
      const data = await res.json();
      setIngestResult(data);
      fetchData();
    } catch (err: any) {
      setIngestResult({ success: false, error: err.message });
    } finally {
      setIsIngesting(false);
    }
  };

  // Nạp tri thức thủ công
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.content.trim() || !manualForm.sourceTitle.trim()) return;

    setManualSubmitting(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: manualForm.content,
          sourceTitle: manualForm.sourceTitle,
          sourceType: manualForm.sourceType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setManualForm({ sourceTitle: "", sourceType: "MANUAL", content: "" });
        setShowManualForm(false);
        fetchData();
      } else {
        alert("Lỗi nạp tri thức: " + (data.error || "Unknown"));
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    } finally {
      setManualSubmitting(false);
    }
  };

  // Xóa tri thức theo source
  const handleDeleteSource = async (sourceType: string, sourceId: string | null) => {
    if (!confirm(`Xóa tất cả tri thức loại ${sourceType}${sourceId ? ` #${sourceId}` : ""}?`)) return;

    try {
      const params = new URLSearchParams({ source_type: sourceType });
      if (sourceId) params.set("source_id", sourceId);

      const res = await fetch(`/api/knowledge?${params}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert("Lỗi xóa: " + data.error);
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "RESOURCE": return <FileText className="w-4 h-4 text-secondary" />;
      case "VIDEO": return <Video className="w-4 h-4 text-blue-400" />;
      case "PREMIUM": return <Sparkles className="w-4 h-4 text-amber-400" />;
      default: return <BookOpen className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getSourceColor = (type: string) => {
    switch (type) {
      case "RESOURCE": return "secondary";
      case "VIDEO": return "blue-400";
      case "PREMIUM": return "amber-400";
      default: return "cyan-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2.5">
            <Brain className="w-6 h-6 text-purple-400" />
            Tri Thức AI (Knowledge Base)
          </h2>
          <p className="text-sm text-foreground/50 mt-1">
            Quản lý cơ sở tri thức vector cho AI Tutor RAG pipeline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-bold hover:bg-cyan-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nạp thủ công
          </button>

          <button
            onClick={handleAutoIngest}
            disabled={isIngesting}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-xs font-bold hover:bg-purple-500 hover:text-black transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
          >
            {isIngesting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            {isIngesting ? "Đang nạp..." : "Nạp từ Thư viện"}
          </button>

          <button
            onClick={fetchData}
            className="p-2 text-foreground/40 hover:text-secondary rounded-lg transition-all"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-background/50 border border-white/5 rounded-xl p-4 text-center">
            <Database className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
            <div className="text-2xl font-bold text-purple-400">{stats.total}</div>
            <div className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">Tổng Chunks</div>
          </div>
          <div className="bg-background/50 border border-white/5 rounded-xl p-4 text-center">
            <FileText className="w-5 h-5 text-secondary mx-auto mb-1.5" />
            <div className="text-2xl font-bold text-secondary">{stats.bySourceType.RESOURCE}</div>
            <div className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">Tài liệu</div>
          </div>
          <div className="bg-background/50 border border-white/5 rounded-xl p-4 text-center">
            <Video className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
            <div className="text-2xl font-bold text-blue-400">{stats.bySourceType.VIDEO}</div>
            <div className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">Video</div>
          </div>
          <div className="bg-background/50 border border-white/5 rounded-xl p-4 text-center">
            <BookOpen className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
            <div className="text-2xl font-bold text-cyan-400">{stats.bySourceType.OTHER}</div>
            <div className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">Khác</div>
          </div>
        </div>
      )}

      {/* Ingest Result Banner */}
      {ingestResult && (
        <div className={`p-4 rounded-xl border ${ingestResult.success ? "bg-secondary/5 border-secondary/20" : "bg-red-500/5 border-red-500/20"}`}>
          <div className="flex items-start gap-3">
            {ingestResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-bold">
                {ingestResult.success
                  ? `✅ Nạp tri thức hoàn tất!`
                  : `❌ Lỗi: ${ingestResult.error}`}
              </p>
              {ingestResult.stats && (
                <p className="text-xs text-foreground/60 mt-1">
                  📄 {ingestResult.stats.resources} tài liệu | 🎥 {ingestResult.stats.videos} video | 🧩 {ingestResult.stats.totalChunks} chunks tổng cộng
                </p>
              )}
              {ingestResult.errors && ingestResult.errors.length > 0 && (
                <div className="mt-2 text-xs text-amber-400/80">
                  ⚠️ {ingestResult.errors.length} lỗi: {ingestResult.errors[0]}
                </div>
              )}
            </div>
            <button
              onClick={() => setIngestResult(null)}
              className="ml-auto text-foreground/30 hover:text-foreground/60 shrink-0"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Manual Ingestion Form */}
      {showManualForm && (
        <form onSubmit={handleManualSubmit} className="bg-background/50 border border-cyan-500/20 rounded-xl p-5 space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            Nạp Tri thức Thủ công
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-foreground/60 mb-1 font-medium">Tiêu đề nguồn *</label>
              <input
                type="text"
                required
                value={manualForm.sourceTitle}
                onChange={(e) => setManualForm({ ...manualForm, sourceTitle: e.target.value })}
                placeholder="VD: Hướng dẫn n8n Nâng cao"
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-cyan-400/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-foreground/60 mb-1 font-medium">Phân loại</label>
              <select
                value={manualForm.sourceType}
                onChange={(e) => setManualForm({ ...manualForm, sourceType: e.target.value })}
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-cyan-400/50 focus:outline-none"
              >
                <option value="MANUAL">Thủ công (Manual)</option>
                <option value="RESOURCE">Tài liệu (Resource)</option>
                <option value="VIDEO">Video</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-foreground/60 mb-1 font-medium">
              Nội dung tri thức * <span className="text-foreground/30">(tối đa 50,000 ký tự)</span>
            </label>
            <textarea
              required
              value={manualForm.content}
              onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })}
              placeholder="Paste nội dung ebook, slide, hoặc ghi chú tri thức tại đây..."
              className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm min-h-[150px] resize-y focus:border-cyan-400/50 focus:outline-none"
              maxLength={50000}
            />
            <div className="text-[10px] text-foreground/30 mt-1 text-right">
              {manualForm.content.length.toLocaleString()} / 50,000
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={manualSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 text-black font-bold text-xs rounded-lg hover:bg-cyan-400 transition-all disabled:opacity-50"
            >
              {manualSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {manualSubmitting ? "Đang xử lý..." : "Nạp tri thức"}
            </button>
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-4 py-2 bg-surface border border-border text-foreground/60 text-xs rounded-lg hover:text-foreground transition-all"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Knowledge Chunks List */}
      <div className="bg-background/30 border border-white/5 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground/70">
            Danh sách Tri thức đã nạp
          </h3>
          <span className="text-[10px] text-foreground/30 font-mono">
            {groups.length} nguồn
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Brain className="w-12 h-12 text-foreground/10 mx-auto mb-3" />
            <p className="text-sm text-foreground/40 font-medium">
              Knowledge Base trống
            </p>
            <p className="text-xs text-foreground/25 mt-1">
              Nhấn &quot;Nạp từ Thư viện&quot; để tự động nạp tri thức từ Tài liệu và Video
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {groups.map((group, i) => {
              const key = `${group.source_type}:${group.source_id || group.source_title}`;
              const isExpanded = expandedGroup === key;

              return (
                <div key={i} className="group hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => setExpandedGroup(isExpanded ? null : key)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      {getSourceIcon(group.source_type)}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {group.source_title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-${getSourceColor(group.source_type)}/10 text-${getSourceColor(group.source_type)} border border-${getSourceColor(group.source_type)}/20`}>
                            {group.source_type}
                          </span>
                          <span className="text-[10px] text-foreground/30">
                            {group.chunk_count} chunks
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-foreground/20 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    <button
                      onClick={() => handleDeleteSource(group.source_type, group.source_id)}
                      className="p-2 text-foreground/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0 ml-2"
                      title="Xóa tri thức này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
