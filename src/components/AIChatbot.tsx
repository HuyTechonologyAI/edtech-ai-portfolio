"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, CheckCircle2 } from "lucide-react";
import { submitContact } from "@/actions/contact";

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
      const history = messages.map(m => ({ role: m.role, content: m.content }));
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
        className={`fixed bottom-6 right-6 w-14 h-14 bg-secondary text-surface rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,229,122,0.4)] hover:scale-110 transition-transform z-50 ${isOpen ? "hidden" : "flex"}`}
        aria-label="Open AI Chatbot"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] sm:w-[380px] h-[600px] max-h-[85vh] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AutoBot AI</h3>
                <div className="text-xs text-white/70 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse"></span>
                  Online
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user" ? "bg-primary text-white rounded-br-sm" : "bg-surface border border-border text-foreground rounded-bl-sm shadow-sm"}`}>
                  {msg.role === "assistant" && <Bot className="w-4 h-4 mb-1 text-secondary inline-block mr-1" />}
                  {msg.content}
                </div>
              </div>
            ))}
            
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
                    <button type="submit" disabled={formState.pending} className="w-full bg-secondary text-surface font-bold py-2 rounded-lg text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50">
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
              <button onClick={() => setShowLeadForm(true)} className="whitespace-nowrap text-xs bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5 rounded-full hover:bg-secondary hover:text-surface transition-colors font-medium">
                🎯 Nhận tư vấn sâu
              </button>
              <button onClick={() => setInput("Giải pháp tự động hóa Zalo?")} className="whitespace-nowrap text-xs bg-surface border border-border px-3 py-1.5 rounded-full hover:bg-border/50 transition-colors">
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
              className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50"
              disabled={isLoading || showLeadForm}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || showLeadForm}
              className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
