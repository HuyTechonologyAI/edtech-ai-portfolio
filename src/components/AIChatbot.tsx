"use client";

import Image from "next/image";
import type { BrowserSpeechRecognition } from "@/types/browser-speech";
import { useHydrated } from "@/hooks/use-browser-state";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Bot,
  CheckCircle2,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  Headphones,
  TrendingUp,
  FileText,
  PhoneCall,
  Loader2,
  ShieldCheck,
  Play,
  Pause
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
type RoleMode = "cskh" | "marketing";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agent_id?: string;
  agent_name?: string;
  timestamp: string;
  audio_url?: string;
};

// ═══════════════════════════════════════════
// AMBASSADOR PROFILES
// ═══════════════════════════════════════════
const AMBASSADORS = {
  cskh: {
    agent_id: "emp_43",
    name: "Trọng Nghĩa",
    role_title: "Hỗ trợ Khách hàng 24/7",
    department: "Khối Tiếp thị & CRM",
    region: "Bắc / Bắc Bộ",
    style: "dịu, nhịp nói vừa",
    avatar: "/assets/workforce/emp_43.jpg",
    welcome_text:
      "Dạ xin chào quý khách! Tôi là **Trọng Nghĩa** (AI Hỗ trợ Khách hàng 24/7) của **HUY TECHNOLOGY AI GROUP**.\n\nTôi sẵn sàng giải đáp thắc mắc về các hệ sinh thái:\n- 🎓 **EduViet AI** (Trợ lý Giáo viên)\n- 💰 **SmartTax AI** (Kế toán & Kê khai thuế)\n- ⚙️ **ZentraTech AI Hub** & Nền tảng Đào tạo\n\nQuý khách cần hỗ trợ nội dung nào hoặc cần tạo Ticket kỹ thuật ạ?",
  },
  marketing: {
    agent_id: "emp_41",
    name: "Phương Thảo",
    role_title: "Tư vấn Dịch vụ & Marketing",
    department: "Khối Tiếp thị & CRM",
    region: "Trung / Huế",
    style: "chững chạc, dễ hiểu",
    avatar: "/assets/workforce/emp_41.jpg",
    welcome_text:
      "Kính chào quý khách! Tôi là **Phương Thảo** (Chuyên viên Tư vấn Giải pháp & Marketing) của **HUY TECHNOLOGY AI GROUP**.\n\nTôi có thể giúp quý khách tìm hiểu:\n- 🤖 Triển khai **Đội ngũ 63 Nhân sự AI** cho doanh nghiệp\n- ⚡ Tự động hóa quy trình với **n8n & Make.com**\n- 📊 Giải pháp Chuyển đổi số toàn diện & Đo lường ROI\n\nQuý khách đang quan tâm đến giải pháp hoặc khóa đào tạo nào để Thảo tư vấn chi tiết ạ?",
  },
};

// ═══════════════════════════════════════════
// SPEECH RECOGNITION HOOK
// ═══════════════════════════════════════════
function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const hydrated = useHydrated();
  const isSupported = hydrated && typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "vi-VN";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          onTranscript(transcript);
        }
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;

      return () => {
        recognition.abort();
        recognitionRef.current = null;
      };
    }
  }, [onTranscript]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Speech start err:", err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, isSupported, startListening, stopListening };
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<RoleMode>("cskh");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  // Form modal state (Ticket / Lead)
  const [activeModal, setActiveModal] = useState<"ticket" | "lead" | null>(null);
  const [modalForm, setModalForm] = useState({
    name: "",
    contact: "",
    detail: "",
    consent: true,
  });
  const [modalResult, setModalResult] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { isListening, isSupported, startListening, stopListening } =
    useSpeechRecognition((text) => setInput(text));

  // Initialize mode welcome message
  useEffect(() => {
    const currentAmbassador = AMBASSADORS[mode];
    setMessages([
      {
        id: `welcome_${mode}`,
        role: "assistant",
        agent_id: currentAmbassador.agent_id,
        agent_name: currentAmbassador.name,
        content: currentAmbassador.welcome_text,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Voice Playback for AI answers
  const handlePlayVoice = async (text: string, agent_id: string, msgId: string) => {
    if (playingMsgId === msgId) {
      audioRef.current?.pause();
      setPlayingMsgId(null);
      return;
    }

    try {
      // First try pre-rendered demo audio if intro
      const staticSample = `/voices/samples/${agent_id}_intro.mp3`;
      if (audioRef.current) {
        audioRef.current.src = staticSample;
        try {
          await audioRef.current.play();
          setPlayingMsgId(msgId);
          audioRef.current.onended = () => setPlayingMsgId(null);
          return;
        } catch {
          // Fallback to dynamic synth API
        }
      }

      const res = await fetch("/api/voice/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, agent_id }),
      });

      if (!res.ok) throw new Error("Voice synth failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        setPlayingMsgId(msgId);
        audioRef.current.onended = () => setPlayingMsgId(null);
      }
    } catch (err) {
      console.warn("Audio playback fallback:", err);
      // Fallback to browser SpeechSynthesis
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*#`_]/g, "").slice(0, 200);
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "vi-VN";
        utterance.onend = () => setPlayingMsgId(null);
        window.speechSynthesis.speak(utterance);
        setPlayingMsgId(msgId);
      }
    }
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const currentAmbassador = AMBASSADORS[mode];

    try {
      const res = await fetch("/api/public-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          agent_id: currentAmbassador.agent_id,
        }),
      });

      if (!res.ok) throw new Error("Chat response error");
      const data = await res.json();

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        agent_id: currentAmbassador.agent_id,
        agent_name: currentAmbassador.name,
        content: data.reply || "Dạ, em đã nhận thông tin và sẽ phản hồi sớm nhất!",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Public chat error:", err);
      const fallbackMsg: Message = {
        id: `err_${Date.now()}`,
        role: "assistant",
        agent_id: currentAmbassador.agent_id,
        agent_name: currentAmbassador.name,
        content: `Dạ, hiện hệ thống đang có lượng truy vấn cao. Quý khách vui lòng gọi Hotline kỹ thuật **0961 364 600** hoặc bấm nút "Gửi Yêu Cầu" để ${currentAmbassador.name} hỗ trợ ngay nhé!`,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Ticket or Lead
  const handleModalSubmit = async () => {
    if (!modalForm.name || !modalForm.contact) return;

    setIsLoading(true);
    try {
      const actionType = activeModal === "ticket" ? "create_ticket" : "capture_lead";
      const payload = {
        action: actionType,
        agent_id: mode === "cskh" ? "emp_43" : "emp_41",
        contactData: {
          name: modalForm.name,
          contact: modalForm.contact,
          phone: modalForm.contact,
          issue: modalForm.detail,
          demand: modalForm.detail,
        },
      };

      const res = await fetch("/api/public-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setModalResult(data.message || "Đã gửi thông tin thành công!");

      setTimeout(() => {
        setActiveModal(null);
        setModalResult(null);
        setModalForm({ name: "", contact: "", detail: "", consent: true });
      }, 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const ambassador = AMBASSADORS[mode];

  return (
    <>
      <audio ref={audioRef} className="hidden" />

      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-2xl hover:scale-105 transition-all shadow-emerald-500/30 flex items-center gap-2"
          aria-label="Mở Trợ lý AI Huy Technology AI"
        >
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-900 bg-slate-900">
            <img
              src={ambassador.avatar}
              alt={ambassador.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xs font-black tracking-wide hidden sm:inline">
            Trợ Lý AI {ambassador.name}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping absolute -top-1 -right-1" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-1 -right-1" />
        </button>
      </div>

      {/* Main Chat Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[600px] max-h-[85vh] bg-slate-950 border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans"
          >
            {/* Header: Mode Switcher */}
            <div className="p-3 bg-slate-900/90 border-b border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      HUY TECHNOLOGY AI GROUP
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/30">
                        AI Verified
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Đội ngũ 63 Nhân Sự AI • Trực Tuyến 24/7
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Ambassador Switch Buttons */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setMode("cskh")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    mode === "cskh"
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  CSKH (Trọng Nghĩa)
                </button>

                <button
                  onClick={() => setMode("marketing")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    mode === "marketing"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Tư Vấn (Phương Thảo)
                </button>
              </div>

              {/* Ambassador Identity Banner */}
              <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-400/50">
                    <img src={ambassador.avatar} alt={ambassador.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-bold text-white">{ambassador.name}</span>
                    <span className="text-slate-400 text-[10px] ml-1.5">({ambassador.region})</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(mode === "cskh" ? "ticket" : "lead")}
                  className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  {mode === "cskh" ? "+ Tạo Ticket" : "+ Đăng Ký Tư Vấn"}
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 max-w-[85%] ${
                    m.role === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] ${
                      m.role === "user"
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 border border-white/20 overflow-hidden"
                    }`}
                  >
                    {m.role === "user" ? (
                      "Tôi"
                    ) : (
                      <img src={ambassador.avatar} alt={m.agent_name || "AI"} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs space-y-1 leading-relaxed ${
                      m.role === "user"
                        ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 rounded-tr-none"
                        : "bg-slate-900 text-slate-200 border border-white/10 rounded-tl-none shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400">
                      <span className="font-semibold">{m.role === "user" ? "Quý khách" : m.agent_name}</span>
                      <span>{m.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {m.role === "assistant" && (
                      <div className="pt-1.5 flex items-center gap-2 border-t border-white/5">
                        <button
                          onClick={() => handlePlayVoice(m.content, m.agent_id || ambassador.agent_id, m.id)}
                          className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          <Volume2 className="w-3 h-3 text-emerald-400" />
                          {playingMsgId === m.id ? "Đang phát..." : "Nghe giọng"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 items-center text-xs text-slate-400 italic pl-9">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  {ambassador.name} đang suy nghĩ câu trả lời...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900/80 border-t border-white/10">
              <div className="flex items-center gap-2">
                {isSupported && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-2 rounded-xl border transition-all ${
                      isListening
                        ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                    }`}
                    title={isListening ? "Dừng ghi âm" : "Nói bằng tiếng Việt"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}

                <input
                  type="text"
                  placeholder={`Nhắn tin với ${ambassador.name}...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket / Lead Capture Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/20 rounded-2xl p-5 shadow-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                {activeModal === "ticket" ? (
                  <>
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Tạo Ticket Hỗ Trợ Kỹ Thuật
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Đăng Ký Tư Vấn Giải Pháp AI 1-1
                  </>
                )}
              </h4>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalResult ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                <p className="font-bold text-sm">Gửi Thành Công!</p>
                <p className="text-[11px]">{modalResult}</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-slate-400 mb-1">Họ & Tên của bạn *</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={modalForm.name}
                    onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Số điện thoại / Email liên hệ *</label>
                  <input
                    type="text"
                    placeholder="0912 345 678 hoặc email@domain.com"
                    value={modalForm.contact}
                    onChange={(e) => setModalForm({ ...modalForm, contact: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    {activeModal === "ticket" ? "Mô tả vấn đề cần hỗ trợ" : "Nhu cầu tự động hóa / khóa học quan tâm"}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Nhập chi tiết yêu cầu..."
                    value={modalForm.detail}
                    onChange={(e) => setModalForm({ ...modalForm, detail: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={modalForm.consent}
                    onChange={(e) => setModalForm({ ...modalForm, consent: e.target.checked })}
                    className="rounded accent-emerald-500"
                  />
                  <label htmlFor="consent" className="cursor-pointer">
                    Tôi đồng ý để Huy Technology AI liên hệ tư vấn.
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={handleModalSubmit}
                    disabled={!modalForm.name || !modalForm.contact || !modalForm.consent || isLoading}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                  >
                    {isLoading ? "Đang gửi..." : "Xác Nhận & Gửi"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
