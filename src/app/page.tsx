"use client";

import Link from "next/link";
import { ArrowRight, Bot, Zap, BookOpen } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { TiltCard } from "@/components/TiltCard";

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <main className="flex-1 overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 flex items-center justify-center min-h-[80vh]">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-background -z-10"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-40 -right-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -z-10"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10"
        />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container px-4 md:px-6 max-w-6xl mx-auto flex flex-col items-center text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary mb-6">
            <span className="flex h-2 w-2 rounded-full bg-secondary mr-2 animate-pulse"></span>
            Chuyên gia Đào tạo AI & Automation
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-balance">
            Làm Chủ <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-blue-400">Trí Tuệ Nhân Tạo</span> & Tự Động Hóa
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl">
            Tối ưu hóa quy trình, x10 hiệu suất làm việc và bứt phá doanh thu với các giải pháp ứng dụng AI & Automation thực chiến.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/roadmap" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 hover-glow transition-all"
            >
              Xem Lộ Trình Học
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-border bg-surface text-foreground font-medium hover:bg-surface/80 transition-all"
            >
              Nhận Tư Vấn Doanh Nghiệp
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature/Highlights Section */}
      <section className="w-full py-16 bg-surface border-y border-border">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="container px-4 md:px-6 max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="h-full">
              <TiltCard>
                <div className="glass-panel h-full p-8 rounded-2xl flex flex-col items-start text-left shadow-lg">
                  <div className="p-4 rounded-xl bg-primary/10 text-primary mb-5">
                    <Bot className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">AI Mastery</h3>
                  <p className="text-foreground/70">Ứng dụng ChatGPT, Claude, Midjourney và các công cụ AI tạo sinh vào công việc hàng ngày một cách hiệu quả.</p>
                </div>
              </TiltCard>
            </motion.div>
            
            <motion.div variants={itemVariants} className="h-full">
              <TiltCard>
                <div className="glass-panel h-full p-8 rounded-2xl flex flex-col items-start text-left shadow-lg">
                  <div className="p-4 rounded-xl bg-secondary/10 text-secondary mb-5">
                    <Zap className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Business Automation</h3>
                  <p className="text-foreground/70">Xây dựng hệ thống tự động hóa Marketing, Sales, CSKH với các nền tảng Make, Zapier, n8n.</p>
                </div>
              </TiltCard>
            </motion.div>
            
            <motion.div variants={itemVariants} className="h-full">
              <TiltCard>
                <div className="glass-panel h-full p-8 rounded-2xl flex flex-col items-start text-left shadow-lg">
                  <div className="p-4 rounded-xl bg-blue-500/10 text-blue-500 mb-5">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Thực Chiến & Ứng Dụng</h3>
                  <p className="text-foreground/70">Không lý thuyết suông. Mọi kiến thức và tài liệu đều được đúc kết từ các dự án tư vấn thực tế.</p>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* About Me Section */}
      <section className="w-full py-24 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-5/12 relative"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-border shadow-2xl relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop" 
                  alt="Ngô Quốc Huy" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <h3 className="text-3xl font-bold text-white mb-1">Ngô Quốc Huy</h3>
                  <p className="text-secondary font-medium text-lg">CEO Vạn Hoả Long Technology</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-10" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary/20 rounded-full blur-2xl -z-10" />
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="w-full lg:w-7/12 space-y-6"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Về Chuyên Gia</h2>
                <div className="w-20 h-1.5 bg-secondary rounded-full mb-8 shadow-[0_0_10px_rgba(0,229,122,0.5)]"></div>
              </motion.div>

              <motion.p variants={itemVariants} className="text-foreground/80 leading-relaxed text-lg text-justify">
                Là Kỹ sư Cơ khí Chế tạo (ĐH Sư Phạm Kỹ Thuật TP.HCM) và nhà giáo dục, tôi kết hợp giữa chuyên môn kỹ thuật sâu rộng và niềm đam mê truyền đạt kiến thức. Chuyển mình từ giảng viên sang vai trò người sáng lập kiêm CEO của <strong className="text-foreground">Công ty TNHH Giải Pháp Công Nghệ Vạn Hoả Long</strong>, tôi luôn khát khao nâng tầm ngành công nghiệp Việt Nam bằng những giải pháp công nghệ và tự động hóa tiên tiến nhất.
              </motion.p>
              
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">🏆</div>
                  <h4 className="font-bold text-lg mb-3">Thành Tựu Nổi Bật</h4>
                  <ul className="text-sm text-foreground/70 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> 
                      <span>Danh hiệu <strong>"Người thợ trẻ giỏi toàn quốc" (2020)</strong> do TW Đoàn TNCS Hồ Chí Minh trao tặng.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> 
                      <span>Giải Nhất <strong>"Khởi nghiệp ĐMST OCOP"</strong> tỉnh Đồng Nai (2020).</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">🚀</div>
                  <h4 className="font-bold text-lg mb-3">Tầm Nhìn & Sứ Mệnh</h4>
                  <ul className="text-sm text-foreground/70 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-0.5">•</span> 
                      <span>Phát triển bản thân không ngừng và tạo ra giá trị bền vững cho xã hội.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-0.5">•</span> 
                      <span>Nâng tầm con người Việt Nam thông qua tư duy làm chủ và ứng dụng công nghệ hiện đại.</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
