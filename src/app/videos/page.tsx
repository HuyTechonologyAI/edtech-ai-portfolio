"use client";

import { useState, useEffect } from "react";
import { PlayCircle, Loader2 } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    fetchVideos();
  }, []);

  const featuredVideo = videos.find(v => v.isFeatured) || videos[0];
  const regularVideos = videos.filter(v => v.id !== featuredVideo?.id);
  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Video Bài Giảng & <span className="text-secondary neon-glow-text">Case Study</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Các hướng dẫn thực hành từng bước, phân tích dự án thực tế và chia sẻ tư duy ứng dụng AI & Automation.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20 text-foreground/50 border border-dashed border-border rounded-xl">
            Chưa có video nào. Admin hãy đăng nhập để thêm video nhé!
          </div>
        ) : (
          <>
            {/* Featured Video */}
            {featuredVideo && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <PlayCircle className="h-6 w-6 text-secondary drop-shadow-[0_0_8px_rgba(0,255,133,0.5)]" />
                  Video Nổi Bật
                </h2>
                <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-secondary/20">
                  <div className="aspect-video w-full bg-surface relative">
                    <VideoPlayer url={featuredVideo.youtubeUrl} />
                  </div>
                  <div className="p-6 md:p-8">
                    {featuredVideo.isFeatured && (
                      <div className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold mb-4 border border-secondary/30">
                        NỔI BẬT
                      </div>
                    )}
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 hover:text-secondary transition-colors cursor-pointer">
                      {featuredVideo.title}
                    </h3>
                    <p className="text-foreground/70 mb-4 line-clamp-2 md:line-clamp-none">
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

            {/* Video Grid */}
            {regularVideos.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Video Khác</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {regularVideos.map((video) => (
                    <div key={video.id} className="group flex flex-col h-full">
                      <div className="aspect-video rounded-xl overflow-hidden mb-4 relative bg-surface border border-border shadow-md">
                        <VideoPlayer url={video.youtubeUrl} />
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-foreground/50 mt-auto">
                        <span>{video.duration || "--:--"}</span>
                        <span>•</span>
                        <span>{new Date(video.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        
      </div>
    </main>
  );
}
