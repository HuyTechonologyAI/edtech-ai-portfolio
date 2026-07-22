"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Zap, BookOpen, Brain, Users, Star, FileText, Workflow } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { TiltCard } from "@/components/TiltCard";

// === Animated Counter Component ===
function AnimatedCounter({ target, suffix = "", prefix = "", duration = 2000 }: { target: number; suffix?: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString("vi-VN")}{suffix}
    </span>
  );
}

// === Typewriter Text Component ===
function TypewriterText({ phrases, delay = 2500 }: { phrases: string[]; delay?: number }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === phrases[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), delay);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % phrases.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 40 : 80);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, phrases, delay]);

  return (
    <span className="text-secondary neon-glow-text inline-block min-w-[280px] text-left">
      {phrases[index].substring(0, subIndex)}
      <span className="typewriter-cursor" />
    </span>
  );
}

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
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background -z-10"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-secondary/30 rounded-full blur-[120px] -z-10"
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
          
          <motion.h1 
            variants={itemVariants} 
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-balance"
            style={{ perspective: 1000 }}
          >
            <motion.span
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              className="inline-block"
            >
              Làm Chủ <TypewriterText phrases={["Trí Tuệ Nhân Tạo", "Tự Động Hóa n8n", "Quy Trình Doanh Nghiệp", "Trợ Lý AI Agent"]} /> & Tự Động Hóa
            </motion.span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants} 
            className="text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl"
          >
            Tối ưu hóa quy trình, x10 hiệu suất làm việc và bứt phá doanh thu với các giải pháp ứng dụng AI & Automation thực chiến.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto mt-4">
            <Link 
              href="/roadmap" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-secondary text-black font-bold hover:bg-secondary/90 hover-glow transition-all"
            >
              Xem Lộ Trình Học
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-secondary/30 bg-transparent text-secondary font-bold hover:border-secondary hover:shadow-[0_0_15px_rgba(0,255,133,0.2)] transition-all"
            >
              Nhận Tư Vấn Doanh Nghiệp
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature/Highlights Section */}
      <section className="w-full py-16 bg-transparent relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent -z-10"></div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="container px-4 md:px-6 max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="h-full">
              <TiltCard>
                <div className="glass-panel gradient-border-card h-full p-8 rounded-3xl flex flex-col items-start text-left shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -z-10 group-hover:bg-secondary/20 transition-all"></div>
                  <div 
                    className="p-4 rounded-2xl bg-secondary/10 text-secondary mb-6 border border-secondary/20 shadow-[0_0_15px_rgba(0,255,133,0.3)] transition-transform duration-300"
                    style={{ transform: "translateZ(60px)" }}
                  >
                    <Bot className="h-8 w-8 drop-shadow-[0_0_8px_rgba(0,255,133,0.8)]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ transform: "translateZ(40px)" }}>AI Mastery</h3>
                  <p className="text-foreground/70" style={{ transform: "translateZ(20px)" }}>Ứng dụng ChatGPT, Claude, Midjourney và các công cụ AI tạo sinh vào công việc hàng ngày một cách hiệu quả.</p>
                </div>
              </TiltCard>
            </motion.div>
            
            <motion.div variants={itemVariants} className="h-full">
              <TiltCard>
                <div className="glass-panel gradient-border-card h-full p-8 rounded-3xl flex flex-col items-start text-left shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -z-10 group-hover:bg-secondary/20 transition-all"></div>
                  <div 
                    className="p-4 rounded-2xl bg-secondary/10 text-secondary mb-6 border border-secondary/20 shadow-[0_0_15px_rgba(0,255,133,0.3)] transition-transform duration-300"
                    style={{ transform: "translateZ(60px)" }}
                  >
                    <Zap className="h-8 w-8 drop-shadow-[0_0_8px_rgba(0,255,133,0.8)]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ transform: "translateZ(40px)" }}>Business Automation</h3>
                  <p className="text-foreground/70" style={{ transform: "translateZ(20px)" }}>Xây dựng hệ thống tự động hóa Marketing, Sales, CSKH với các nền tảng Make, Zapier, n8n.</p>
                </div>
              </TiltCard>
            </motion.div>
            
            <motion.div variants={itemVariants} className="h-full">
              <TiltCard>
                <div className="glass-panel h-full p-8 rounded-3xl flex flex-col items-start text-left shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -z-10 group-hover:bg-secondary/20 transition-all"></div>
                  <div 
                    className="p-4 rounded-2xl bg-secondary/10 text-secondary mb-6 border border-secondary/20 shadow-[0_0_15px_rgba(0,255,133,0.3)] transition-transform duration-300"
                    style={{ transform: "translateZ(60px)" }}
                  >
                    <BookOpen className="h-8 w-8 drop-shadow-[0_0_8px_rgba(0,255,133,0.8)]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ transform: "translateZ(40px)" }}>Thực Chiến & Ứng Dụng</h3>
                  <p className="text-foreground/70" style={{ transform: "translateZ(20px)" }}>Không lý thuyết suông. Mọi kiến thức và tài liệu đều được đúc kết từ các dự án tư vấn thực tế.</p>
                </div>
              </TiltCard>
            </motion.div>

            <motion.div variants={itemVariants} className="h-full cursor-pointer">
              <Link href="/quiz" className="block h-full">
                <TiltCard>
                  <div className="glass-panel h-full p-8 rounded-3xl flex flex-col items-start text-left shadow-2xl relative overflow-hidden group border-secondary/30 hover:border-secondary transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -z-10 group-hover:bg-secondary/40 transition-all"></div>
                    <div 
                      className="p-4 rounded-2xl bg-secondary/20 text-secondary mb-6 border border-secondary/40 shadow-[0_0_20px_rgba(0,255,133,0.5)] transition-transform duration-300"
                      style={{ transform: "translateZ(60px)" }}
                    >
                      <Brain className="h-8 w-8 drop-shadow-[0_0_12px_rgba(0,255,133,1)] animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 neon-glow-text" style={{ transform: "translateZ(40px)" }}>AI Dynamic Quiz</h3>
                    <p className="text-foreground/70" style={{ transform: "translateZ(20px)" }}>Kiểm tra ngay trình độ của bạn với hệ thống trắc nghiệm thông minh sinh tự động bởi Google Gemini AI.</p>
                  </div>
                </TiltCard>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof — Stats Counter Section */}
      <section className="w-full py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-secondary/5 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          className="container px-4 md:px-6 max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-4">
              <Star className="w-3.5 h-3.5 fill-secondary" /> Con số biết nói
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Cộng đồng <span className="text-secondary neon-glow-text">ZentraTech</span> đang lớn mạnh
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: <Users className="w-6 h-6" />, target: 1200, suffix: "+", label: "Học viên", sublabel: "Đang học tập", color: "text-secondary", glow: "shadow-[0_0_20px_rgba(0,255,133,0.1)]", displayValue: null },
              { icon: <FileText className="w-6 h-6" />, target: 150, suffix: "+", label: "Tài liệu Premium", sublabel: "Ebook & Slide", color: "text-blue-400", glow: "shadow-[0_0_20px_rgba(96,165,250,0.1)]", displayValue: null },
              { icon: <Star className="w-6 h-6 fill-amber-400" />, target: 0, suffix: "", label: "Đánh giá trung bình", sublabel: "Từ học viên", color: "text-amber-400", glow: "shadow-[0_0_20px_rgba(251,191,36,0.1)]", displayValue: "4.9★" },
              { icon: <Workflow className="w-6 h-6" />, target: 50, suffix: "+", label: "Kịch bản n8n / Make", sublabel: "Tự động hóa thực chiến", color: "text-purple-400", glow: "shadow-[0_0_20px_rgba(192,132,252,0.1)]", displayValue: null },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`relative rounded-2xl bg-surface/50 border border-white/5 p-6 text-center group hover:border-white/10 transition-all ${stat.glow} hover:scale-105`}
              >
                <div className={`flex justify-center mb-3 ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                  {stat.icon}
                </div>
                <div className={`text-3xl md:text-4xl font-black tracking-tight mb-1 ${stat.color}`}>
                  {stat.displayValue ? (
                    <span>{stat.displayValue}</span>
                  ) : (
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} duration={2000 + idx * 200} />
                  )}
                </div>
                <p className="text-sm font-bold text-foreground/80">{stat.label}</p>
                <p className="text-[11px] text-foreground/40 mt-0.5">{stat.sublabel}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* About Me Section */}
      <section className="w-full py-24 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10" />
        
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-5/12 relative"
            >
              <TiltCard className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" style={{ transform: "translateZ(30px)" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/profile.jpg" 
                  alt="Ngô Quốc Huy" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-8 left-6 right-6 z-20" style={{ transform: "translateZ(80px)" }}>
                  <h3 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Ngô Quốc Huy</h3>
                  <p className="text-secondary font-medium text-xl neon-glow-text">CEO Vạn Hoả Long Technology</p>
                </div>
              </TiltCard>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary/20 rounded-full blur-2xl -z-10" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -z-10" />
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
                      <span className="text-secondary mt-0.5">•</span> 
                      <span>Danh hiệu <strong>"Người thợ trẻ giỏi toàn quốc" (2020)</strong> do TW Đoàn TNCS Hồ Chí Minh trao tặng.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-secondary mt-0.5">•</span> 
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
