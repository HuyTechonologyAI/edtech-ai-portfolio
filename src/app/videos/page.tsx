import { PlayCircle } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";

export default function VideosPage() {
  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Video Bài Giảng & <span className="text-secondary">Case Study</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Các hướng dẫn thực hành từng bước, phân tích dự án thực tế và chia sẻ tư duy ứng dụng AI & Automation.
          </p>
        </div>

        {/* Featured Video */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-primary" />
            Video Nổi Bật
          </h2>
          <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-secondary/20">
            <div className="aspect-video w-full bg-surface relative">
              <VideoPlayer url="https://www.youtube.com/watch?v=D-NENB3Rikw" />
            </div>
            <div className="p-6 md:p-8">
              <div className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold mb-4 border border-secondary/30">
                MỚI NHẤT
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 hover:text-secondary transition-colors cursor-pointer">
                Toàn tập n8n: Xây dựng hệ thống tự động hóa Marketing từ A-Z
              </h3>
              <p className="text-foreground/70 mb-4 line-clamp-2 md:line-clamp-none">
                Trong video này, tôi sẽ hướng dẫn chi tiết cách sử dụng n8n để kết nối Facebook Lead Ads, Google Sheets, ChatGPT và Telegram. Tạo ra một luồng xử lý tự động phân loại khách hàng và gửi thông báo theo thời gian thực.
              </p>
              <div className="flex items-center gap-4 text-sm font-medium text-foreground/50">
                <span>45 phút</span>
                <span>•</span>
                <span>12N lượt xem</span>
                <span>•</span>
                <span>2 ngày trước</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Thực Hành AI</h2>
            <button className="text-sm font-medium text-primary hover:text-secondary transition-colors">
              Xem tất cả &rarr;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Video Item 1 */}
            <div className="group flex flex-col h-full">
              <div className="aspect-video rounded-xl overflow-hidden mb-4 relative bg-surface border border-border shadow-md">
                <VideoPlayer url="https://www.youtube.com/watch?v=jGwO_UgTS7I" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                Tạo Landing Page chuẩn SEO với ChatGPT và Claude 3.5 Sonnet
              </h3>
              <div className="flex items-center gap-3 text-xs text-foreground/50 mt-auto">
                <span>15 phút</span>
                <span>•</span>
                <span>8.5N lượt xem</span>
              </div>
            </div>

            {/* Video Item 2 */}
            <div className="group flex flex-col h-full">
              <div className="aspect-video rounded-xl overflow-hidden mb-4 relative bg-surface border border-border shadow-md">
                <VideoPlayer url="https://www.youtube.com/watch?v=1bvwM8oMofI" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                Make.com cơ bản: Tự động hóa quy trình CSKH trên Zalo
              </h3>
              <div className="flex items-center gap-3 text-xs text-foreground/50 mt-auto">
                <span>22 phút</span>
                <span>•</span>
                <span>15N lượt xem</span>
              </div>
            </div>

            {/* Video Item 3 */}
            <div className="group flex flex-col h-full">
              <div className="aspect-video rounded-xl overflow-hidden mb-4 relative bg-surface border border-border shadow-md">
                <VideoPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                Phân tích dữ liệu kinh doanh với ChatGPT Advanced Data Analysis
              </h3>
              <div className="flex items-center gap-3 text-xs text-foreground/50 mt-auto">
                <span>18 phút</span>
                <span>•</span>
                <span>5.2N lượt xem</span>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </main>
  );
}
