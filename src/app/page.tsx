"use client";

import Link from "next/link";
import { ArrowRight, Bot, Zap, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/TiltCard";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
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
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-40 -right-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -z-10"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
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
    </main>
  );
}
