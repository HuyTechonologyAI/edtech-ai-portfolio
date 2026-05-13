"use client";

import { useState, useEffect } from "react";
import { PlayCircle, Loader2, Folder } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

interface FolderItem {
  id: number;
  name: string;
  type: string;
  parent_id: number | null;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        setVideos(data.videos || []);
      } catch (error) {
        console.error("Failed to load videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchVideoFolders = async () => {
      try {
        const res = await fetch("/api/admin/folders?type=VIDEO");
        const data = await res.json();
        if (data.success) setFolders(data.folders || []);
      } catch (err) {
        console.error("Failed to load video folders", err);
      }
    };

    fetchVideos();
    fetchVideoFolders();
  }, []);

  // Filter video elements reactive to selected category taxonomy
  const filteredVideos = videos.filter(v => 
    selectedFolderId === null || v.folderId === selectedFolderId || v.folder_id === selectedFolderId
  );

  const featuredVideo = filteredVideos.find(v => v.isFeatured) || filteredVideos[0];
  const regularVideos = filteredVideos.filter(v => v.id !== featuredVideo?.id);

  return (
    <main className="flex-1 py-12 md:py-20 animate-fade-in">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Video Bài Giảng &amp; <span className="text-secondary neon-glow-text">Case Study</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Các hướng dẫn thực hành từng bước, phân tích dự án thực tế và chia sẻ tư duy ứng dụng AI &amp; Automation.
          </p>
        </div>

        {/* Dynamic Folder Selection Taxonomy Strip */}
        {folders.length > 0 && (
          <div className="mb-10 bg-surface/30 border border-white/5 rounded-2xl p-4 animate-fade-in shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <Folder className="w-4 h-4" />
              <span>Duyệt Video Theo Chủ Đề:</span>
              <span className="text-[10px] text-foreground/40 italic font-normal lowercase">(Học tập có hệ thống)</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  selectedFolderId === null
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                    : "bg-background/60 hover:bg-surface text-foreground/70"
                }`}
              >
                📁 Tất cả chủ đề
              </button>

              {folders.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedFolderId === f.id
                      ? "bg-amber-500 text-black font-bold shadow-sm scale-105"
                      : "bg-background/60 hover:bg-surface text-foreground/80 border border-white/5"
                  }`}
                >
                  <span className="text-foreground/40">{f.parent_id ? "↳ " : ""}</span>
                  <span>📁 {f.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-20 text-foreground/50 border border-dashed border-border rounded-xl space-y-2">
            <p className="text-sm">Không tìm thấy Video bài giảng nào thuộc chuyên mục này.</p>
            {selectedFolderId !== null && (
              <button 
                onClick={() => setSelectedFolderId(null)}
                className="text-xs text-secondary font-bold hover:underline block mx-auto"
              >
                Xem tất cả Video
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Video */}
            {featuredVideo && selectedFolderId === null && (
              <div className="mb-16 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <PlayCircle className="h-6 w-6 text-secondary drop-shadow-[0_0_8px_rgba(0,255,133,0.5)]" />
                  Video Nổi Bật
                </h2>
                <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-secondary/20">
                  <div className="aspect-video w-full bg-surface relative">
                    <VideoPlayer url={featuredVideo.youtubeUrl} />
                  </div>
                  <div className="p-6 md:p-8 relative">
                    {featuredVideo.isFeatured && (
                      <div className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold mb-4 border border-secondary/30">
                        NỔI BẬT
                      </div>
                    )}

                    {/* Hiển thị thư mục nếu được gán */}
                    {(() => {
                      const fTag = folders.find(f => f.id === featuredVideo.folderId || f.id === featuredVideo.folder_id);
                      if (!fTag) return null;
                      return (
                        <div className="absolute top-6 right-6 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                          📁 {fTag.name}
                        </div>
                      );
                    })()}

                    <h3 className="text-2xl md:text-3xl font-bold mb-3 hover:text-secondary transition-colors cursor-pointer">
                      {featuredVideo.title}
                    </h3>
                    <p className="text-foreground/70 mb-4 line-clamp-2 md:line-clamp-none leading-relaxed">
                      {featuredVideo.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm font-medium text-foreground/50">
                      <span>{featuredVideo.duration || "Đang cập nhật"}</span>
                      <span>•</span>
                      <span>{new Date(featuredVideo.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Grid List */}
            {(regularVideos.length > 0 || selectedFolderId !== null) && (
              <div className="mb-10 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {selectedFolderId !== null 
                      ? `Danh sách Video: ${folders.find(f => f.id === selectedFolderId)?.name || ''}` 
                      : "Video Khác"
                    }
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {(selectedFolderId !== null ? filteredVideos : regularVideos).map((video) => {
                    const tagObj = folders.find(f => f.id === video.folderId || f.id === video.folder_id);
                    return (
                      <div key={video.id} className="group flex flex-col h-full glass-panel p-3 rounded-2xl border border-white/5 hover:border-secondary/30 transition-all">
                        <div className="aspect-video rounded-xl overflow-hidden mb-3 relative bg-surface border border-border shadow-md">
                          <VideoPlayer url={video.youtubeUrl} />
                          
                          {tagObj && (
                            <div className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-black/80 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded backdrop-blur-sm max-w-[120px] truncate">
                              📁 {tagObj.name}
                            </div>
                          )}
                        </div>

                        <div className="px-2 pb-1 flex flex-col flex-1 justify-between">
                          <h3 className="text-base font-bold mb-2 group-hover:text-secondary transition-colors line-clamp-2 leading-tight">
                            {video.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-foreground/50 pt-2 border-t border-white/5">
                            <span>{video.duration || "--:--"}</span>
                            <span>•</span>
                            <span>{new Date(video.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
        
      </div>
    </main>
  );
}
