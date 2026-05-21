"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare, X, Send, Bot, CheckCircle2, Mic, MicOff,
  ImagePlus, FileText, Sparkles, BookOpen, Wrench, Target,
  ChevronDown, Loader2, ExternalLink
} from "lucide-react";
import { submitContact } from "@/actions/contact";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
type Source = {
  title: string;
  type: string;
  sourceId: number | null;
  similarity: number;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;      // Base64 thumbnail for user-uploaded images
  sources?: Source[];          // RAG citations from AI response
};

// ═══════════════════════════════════════════
// SIMPLE MARKDOWN RENDERER
// ═══════════════════════════════════════════
function renderMarkdown(text: string): string {
  let html = text
    // Code blocks (```)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Unordered lists
    .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Line breaks → paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/(<li>.*?<\/li>(\s*<br\/>)?)+/g, (match) => {
    const cleaned = match.replace(/<br\/>/g, '');
    return `<ul>${cleaned}</ul>`;
  });

  return `<p>${html}</p>`;
}

// ═══════════════════════════════════════════
// SPEECH RECOGNITION HOOK
// ═══════════════════════════════════════════
function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      // Multilingual: Tự động phát hiện ngôn ngữ
      recognition.lang = "";

      recognition.onresult = (event: any) => {
        const current = event.results[event.results.length - 1];
        setTranscript(current[0].transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, transcript, isSupported, startListening, stopListening };
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Chào bạn! Tôi là **AI Tutor** 🧠 — Trợ lý Học tập Thông minh của ZentraTech Academy.\n\nTôi có thể giúp bạn:\n- 📄 Giải đáp từ nội dung **Ebook & Slide bài giảng**\n- 🔧 Phân tích lỗi **workflow Make/n8n** từ ảnh chụp\n- 🎤 Nhận câu hỏi bằng **giọng nói**\n\nHãy hỏi tôi bất cứ điều gì!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [formState, setFormState] = useState({
    pending: false,
    success: false,
    error: "",
  });
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isListening, transcript, isSupported, startListening, stopListening } =
    useSpeechRecognition();

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!isScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, showLeadForm, isScrolledUp]);

  // Fill transcript into input when voice recognition captures text
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setIsScrolledUp(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsScrolledUp(false);
  };

  // ═══════════════════════════════════════════
  // MESSAGE SENDING (Text + Image + Voice)
  // ═══════════════════════════════════════════
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !pendingImage) || isLoading) return;

    // Stop voice if still listening
    if (isListening) stopListening();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || "(Ảnh đính kèm)",
      imagePreview: pendingImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    const currentImage = pendingImage;
    setInput("");
    setPendingImage(null);
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const payload: any = {
        message: currentInput || "Hãy phân tích ảnh đính kèm này.",
        history,
      };

      if (currentImage) {
        payload.imageBase64 = currentImage;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "⚠️ Đã có lỗi kết nối. Xin vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════
  // IMAGE UPLOAD HANDLER
  // ═══════════════════════════════════════════
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 4MB
    if (file.size > 4 * 1024 * 1024) {
      alert("Ảnh quá lớn (tối đa 4MB). Vui lòng chọn ảnh nhỏ hơn.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be uploaded again
    e.target.value = "";
  };

  // ═══════════════════════════════════════════
  // LEAD FORM
  // ═══════════════════════════════════════════
  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState({ pending: true, success: false, error: "" });
    const formData = new FormData(e.currentTarget);
    formData.append(
      "message",
      "ĐĂNG KÝ TƯ VẤN TỪ AI TUTOR: Khách hàng muốn liên hệ chuyên sâu."
    );

    const result = await submitContact(formData);

    if (result.success) {
      setFormState({ pending: false, success: true, error: "" });
      setTimeout(() => setShowLeadForm(false), 3000);
    } else {
      setFormState({
        pending: false,
        success: false,
        error: result.error || "Có lỗi xảy ra",
      });
    }
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <>
      {/* ─── Floating Trigger Button ─── */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 md:bottom-6 right-4 md:right-6 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,255,133,0.4)] hover:scale-110 hover:shadow-[0_0_35px_rgba(0,255,133,0.6)] transition-all z-50 ${isOpen ? "hidden" : "flex"} bg-gradient-to-br from-secondary to-emerald-400 text-black`}
        aria-label="Open AI Tutor"
      >
        <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* ─── Chat Window ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[92vw] sm:w-[420px] h-[650px] max-h-[88vh] bg-surface/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_80px_rgba(0,255,133,0.05)] flex flex-col z-50 overflow-hidden"
          >
            {/* ─── Header ─── */}
            <div className="bg-gradient-to-r from-background/95 to-background/80 backdrop-blur-md px-4 py-3.5 flex items-center justify-between text-foreground border-b border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/5 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl -z-10" />

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary/20 to-emerald-500/10 text-secondary border border-secondary/20 rounded-2xl flex items-center justify-center">
                    <Bot className="w-5 h-5 drop-shadow-[0_0_6px_rgba(0,255,133,0.6)]" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-secondary border-2 border-background shadow-[0_0_6px_rgba(0,255,133,0.8)]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-1.5">
                    AI Tutor
                    <span className="text-[10px] font-medium bg-gradient-to-r from-secondary/20 to-cyan-500/20 text-secondary border border-secondary/20 px-1.5 py-0.5 rounded-md">
                      RAG
                    </span>
                  </h3>
                  <div className="text-[11px] text-foreground/50 flex items-center gap-1.5 mt-0.5">
                    <Sparkles className="w-3 h-3 text-secondary" />
                    Trợ lý Học tập Đa phương thức
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-foreground/40 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ─── Messages Area ─── */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background/60 to-background/40 min-h-0"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-msg-slide-up`}
                  >
                    <div className="max-w-[85%] flex flex-col gap-1.5">
                      {/* Image preview (user messages) */}
                      {msg.imagePreview && (
                        <div className="flex justify-end">
                          <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-lg max-w-[200px]">
                            <img
                              src={msg.imagePreview}
                              alt="Uploaded"
                              className="w-full h-auto max-h-[160px] object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-[10px] text-foreground/70 px-2 py-1 text-center">
                              📸 Ảnh đính kèm
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-secondary to-emerald-400 text-black font-medium rounded-br-md shadow-[0_2px_15px_rgba(0,255,133,0.15)]"
                            : "bg-surface/80 border border-white/5 text-foreground rounded-bl-md shadow-sm"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-white/5">
                            <Bot className="w-3.5 h-3.5 text-secondary" />
                            <span className="text-[10px] font-bold text-secondary/80">
                              AI Tutor
                            </span>
                          </div>
                        )}
                        {msg.role === "assistant" ? (
                          <div
                            className="chat-markdown"
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdown(msg.content),
                            }}
                          />
                        ) : (
                          msg.content
                        )}
                      </div>

                      {/* RAG Source Citations */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {msg.sources.slice(0, 3).map((src, i) => (
                            <a
                              key={i}
                              href={
                                src.type === "RESOURCE"
                                  ? "/resources"
                                  : "/videos"
                              }
                              className="flex items-center gap-1 text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded-lg hover:bg-cyan-500/20 transition-all group"
                            >
                              {src.type === "RESOURCE" ? (
                                <FileText className="w-3 h-3" />
                              ) : (
                                <BookOpen className="w-3 h-3" />
                              )}
                              <span className="max-w-[120px] truncate">
                                {src.title}
                              </span>
                              <span className="text-cyan-500/50 font-mono">
                                {src.similarity}%
                              </span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface/80 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-[10px] text-foreground/30 ml-1">
                        AI Tutor đang phân tích...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Lead Form */}
              {showLeadForm && (
                <div className="bg-surface border border-secondary/30 rounded-xl p-4 shadow-md animate-msg-slide-up">
                  {formState.success ? (
                    <div className="text-center py-4">
                      <CheckCircle2 className="w-10 h-10 text-secondary mx-auto mb-2" />
                      <p className="text-sm font-bold text-secondary">
                        Đã nhận thông tin!
                      </p>
                      <p className="text-xs text-foreground/70">
                        Chuyên gia sẽ liên hệ bạn sớm.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleLeadSubmit} className="space-y-3">
                      <h4 className="font-bold text-sm text-center">
                        Đăng ký Tư Vấn 1-1
                      </h4>
                      {formState.error && (
                        <p className="text-xs text-red-500">
                          {formState.error}
                        </p>
                      )}
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Họ và Tên *"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-secondary/50 outline-none"
                      />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="Email liên hệ *"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-secondary/50 outline-none"
                      />
                      <input
                        type="text"
                        name="company"
                        placeholder="Tên Công ty"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-secondary/50 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={formState.pending}
                        className="w-full bg-secondary text-black font-bold py-2 rounded-lg text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50 shadow-[0_0_10px_rgba(0,255,133,0.2)]"
                      >
                        {formState.pending ? "Đang gửi..." : "Gửi yêu cầu"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLeadForm(false)}
                        className="w-full text-xs text-foreground/50 hover:text-foreground"
                      >
                        Hủy bỏ
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom FAB */}
            {isScrolledUp && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-[140px] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center shadow-lg hover:bg-white/10 transition-all z-10"
              >
                <ChevronDown className="w-4 h-4 text-foreground/60" />
              </button>
            )}

            {/* ─── Quick Action Chips ─── */}
            {!showLeadForm && messages.length <= 2 && (
              <div className="px-3 py-2 bg-background/60 border-t border-white/5 flex gap-1.5 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() =>
                    setInput("Giải thích về Retrieval-Augmented Generation?")
                  }
                  className="whitespace-nowrap text-[11px] bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5 rounded-full hover:bg-secondary hover:text-black transition-all font-bold shadow-[0_0_8px_rgba(0,255,133,0.08)]"
                >
                  <span className="mr-1">🧠</span> Giải thích RAG
                </button>
                <button
                  onClick={() =>
                    setInput("Cách debug lỗi connection trên n8n workflow?")
                  }
                  className="whitespace-nowrap text-[11px] bg-surface border border-white/10 px-3 py-1.5 rounded-full hover:border-secondary/50 hover:text-secondary transition-all font-medium"
                >
                  <span className="mr-1">🔧</span> Debug n8n
                </button>
                <button
                  onClick={() =>
                    setInput("Tóm tắt nội dung tài liệu mới nhất?")
                  }
                  className="whitespace-nowrap text-[11px] bg-surface border border-white/10 px-3 py-1.5 rounded-full hover:border-secondary/50 hover:text-secondary transition-all font-medium"
                >
                  <span className="mr-1">📄</span> Tóm tắt tài liệu
                </button>
                <button
                  onClick={() => setShowLeadForm(true)}
                  className="whitespace-nowrap text-[11px] bg-surface border border-white/10 px-3 py-1.5 rounded-full hover:border-secondary/50 hover:text-secondary transition-all font-medium"
                >
                  <span className="mr-1">🎯</span> Tư vấn sâu
                </button>
              </div>
            )}

            {/* ─── Image Preview Bar ─── */}
            {pendingImage && (
              <div className="px-3 py-2 bg-background/80 border-t border-white/5 flex items-center gap-2">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-secondary/30 shrink-0">
                  <img
                    src={pendingImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-foreground/80 truncate">
                    📸 Ảnh đã đính kèm
                  </p>
                  <p className="text-[10px] text-foreground/40">
                    Nhấn gửi để AI phân tích
                  </p>
                </div>
                <button
                  onClick={() => setPendingImage(null)}
                  className="p-1.5 text-foreground/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ─── Input Area ─── */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-surface/90 border-t border-white/5 flex items-center gap-2"
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Image upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || showLeadForm}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/40 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all disabled:opacity-30 shrink-0"
                title="Đính kèm ảnh chụp workflow"
              >
                <ImagePlus className="w-4.5 h-4.5" />
              </button>

              {/* Voice input button */}
              {isSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading || showLeadForm}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 shrink-0 ${
                    isListening
                      ? "bg-red-500/20 text-red-400 voice-pulse-ring border border-red-500/30"
                      : "text-foreground/40 hover:text-amber-400 hover:bg-amber-500/10"
                  }`}
                  title={
                    isListening
                      ? "Dừng ghi âm"
                      : "Hỏi bằng giọng nói"
                  }
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Text input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening
                    ? "🎤 Đang lắng nghe..."
                    : "Hỏi AI Tutor bất kỳ điều gì..."
                }
                className={`flex-1 px-4 py-2.5 bg-background/60 border rounded-xl text-sm focus:outline-none transition-all min-w-0 ${
                  isListening
                    ? "border-red-500/30 ring-1 ring-red-500/20 text-red-300 placeholder:text-red-400/50"
                    : "border-white/10 focus:border-secondary/50 focus:ring-1 focus:ring-secondary/30"
                }`}
                disabled={isLoading || showLeadForm}
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={
                  (!input.trim() && !pendingImage) ||
                  isLoading ||
                  showLeadForm
                }
                className="w-9 h-9 bg-gradient-to-br from-secondary to-emerald-400 text-black rounded-xl flex items-center justify-center hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-[0_0_12px_rgba(0,255,133,0.2)]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 ml-0.5" />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
