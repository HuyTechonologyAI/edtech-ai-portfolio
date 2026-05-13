"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, CheckCircle2 } from "lucide-react";
import { submitContact } from "@/actions/contact";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Chào bạn! Tôi là trợ lý AI của Chuyên gia. Bạn cần tôi hỗ trợ gì về AI hoặc Tự động hóa hôm nay?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [formState, setFormState] = useState({ pending: false, success: false, error: "" });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, showLeadForm]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== "1")
        .map(m => ({ role: m.role, content: m.content }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, history })
      });
      
      const data = await response.json();
      
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "Đã có lỗi kết nối. Xin vui lòng thử lại sau." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState({ pending: true, success: false, error: "" });
    const formData = new FormData(e.currentTarget);
    formData.append("message", "ĐĂNG KÝ TƯ VẤN TỪ CHATBOT: Khách hàng muốn liên hệ chuyên sâu.");
    
    const result = await submitContact(formData);
    
    if (result.success) {
      setFormState({ pending: false, success: true, error: "" });
      setTimeout(() => setShowLeadForm(false), 3000);
    } else {
      setFormState({ pending: false, success: false, error: result.error || "Có lỗi xảy ra" });
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 md:bottom-6 right-4 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-secondary text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,133,0.4)] hover:scale-110 hover:shadow-[0_0_30px_rgba(0,255,133,0.6)] transition-all z-50 ${isOpen ? "hidden" : "flex"}`}
        aria-label="Open AI Chatbot"
      >
        <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50, rotateX: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{ transformOrigin: "bottom right" }}
          className="fixed bottom-6 right-6 w-[90vw] sm:w-[380px] h-[600px] max-h-[85vh] bg-surface/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-background/80 backdrop-blur-md px-4 py-4 flex items-center justify-between text-foreground border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -z-10"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 text-secondary border border-secondary/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 drop-shadow-[0_0_5px_rgba(0,255,133,0.5)]" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AutoBot AI</h3>
                <div className="text-xs text-foreground/70 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse shadow-[0_0_5px_rgba(0,255,133,0.8)]"></span>
                  Online
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-foreground/50 hover:text-secondary transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "bg-secondary text-black font-medium rounded-br-sm shadow-[0_0_10px_rgba(0,255,133,0.2)]" : "bg-surface border border-white/5 text-foreground rounded-bl-sm shadow-sm"}`}>
                  {msg.role === "assistant" && <Bot className="w-4 h-4 mb-1 text-secondary inline-block mr-1" />}
                  {msg.content}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}

            {/* Lead Form Inline */}
            {showLeadForm && (
              <div className="bg-surface border border-secondary/30 rounded-xl p-4 shadow-md animate-in fade-in">
                {formState.success ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-10 h-10 text-secondary mx-auto mb-2" />
                    <p className="text-sm font-bold text-secondary">Đã nhận thông tin!</p>
                    <p className="text-xs text-foreground/70">Chuyên gia sẽ liên hệ bạn sớm.</p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    <h4 className="font-bold text-sm text-center">Đăng ký Tư Vấn 1-1</h4>
                    {formState.error && <p className="text-xs text-red-500">{formState.error}</p>}
                    <input type="text" name="name" required placeholder="Họ và Tên *" className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-secondary/50 outline-none" />
                    <input type="email" name="email" required placeholder="Email liên hệ *" className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-secondary/50 outline-none" />
                    <input type="text" name="company" placeholder="Tên Công ty" className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-secondary/50 outline-none" />
                    <button type="submit" disabled={formState.pending} className="w-full bg-secondary text-black font-bold py-2 rounded-lg text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50 shadow-[0_0_10px_rgba(0,255,133,0.2)]">
                      {formState.pending ? "Đang gửi..." : "Gửi yêu cầu"}
                    </button>
                    <button type="button" onClick={() => setShowLeadForm(false)} className="w-full text-xs text-foreground/50 hover:text-foreground">Hủy bỏ</button>
                  </form>
                )}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {!showLeadForm && (
            <div className="px-4 py-2 bg-background/50 border-t border-border flex gap-2 overflow-x-auto scrollbar-hide">
              <button onClick={() => setShowLeadForm(true)} className="whitespace-nowrap text-xs bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2 rounded-full hover:bg-secondary hover:text-black transition-colors font-bold shadow-[0_0_10px_rgba(0,255,133,0.1)]">
                🎯 Nhận tư vấn sâu
              </button>
              <button onClick={() => setInput("Giải pháp tự động hóa Zalo?")} className="whitespace-nowrap text-xs bg-surface border border-white/10 px-4 py-2 rounded-full hover:border-secondary/50 hover:text-secondary transition-colors font-medium">
                Tự động hóa Zalo
              </button>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-surface border-t border-border flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi AI bất kỳ điều gì..."
              className="flex-1 px-4 py-2.5 bg-background/50 border border-white/10 rounded-full text-sm focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50"
              disabled={isLoading || showLeadForm}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || showLeadForm}
              className="w-10 h-10 bg-secondary text-black rounded-full flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-[0_0_10px_rgba(0,255,133,0.2)]"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
