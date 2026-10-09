"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Volume2,
  Play,
  Pause,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Layers,
  ChevronDown
} from "lucide-react";

interface VoiceProfile {
  agent_id: string;
  display_name: string;
  job_title: string;
  department: string;
  voice_id: string;
  voice_version: string;
  gender: string;
  region: string;
  style: string;
  engine: string;
  base_voice: string;
  rate: string;
  pitch: string;
  sample_path: string;
  approval_status: string;
}

export default function VoiceLibraryPage() {
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<VoiceProfile[]>([]);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/src/data/voice_registry.json")
      .then((res) => res.json())
      .catch(() => fetch("/api/voice/registry").then((r) => r.json()))
      .then((data) => {
        if (data?.voices) {
          const list = Object.values(data.voices) as VoiceProfile[];
          setVoices(list);
          setFilteredVoices(list);
        }
      })
      .catch((err) => console.error("Error loading voice registry:", err));
  }, []);

  useEffect(() => {
    let result = voices;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.display_name.toLowerCase().includes(q) ||
          v.agent_id.toLowerCase().includes(q) ||
          v.department.toLowerCase().includes(q) ||
          v.job_title.toLowerCase().includes(q)
      );
    }
    if (regionFilter !== "ALL") {
      result = result.filter((v) => v.region.includes(regionFilter));
    }
    setFilteredVoices(result);
  }, [search, regionFilter, voices]);

  const handlePlayVoice = (v: VoiceProfile) => {
    if (playingId === v.agent_id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    // Try dynamic synth or sample audio
    const sampleUrl = `/voices/samples/${v.agent_id}_intro.mp3`;
    if (audioRef.current) {
      audioRef.current.src = sampleUrl;
      audioRef.current.play().catch(() => {
        // Fallback to dynamic synth API
        fetch("/api/voice/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `Xin chào, tôi là ${v.display_name}, ${v.job_title} tại Huy Technology AI Group. Giọng nói của tôi mang âm sắc ${v.region}.`,
            agent_id: v.agent_id
          })
        })
          .then((r) => r.blob())
          .then((blob) => {
            if (audioRef.current) {
              audioRef.current.src = URL.createObjectURL(blob);
              audioRef.current.play();
            }
          });
      });
      setPlayingId(v.agent_id);
      audioRef.current.onended = () => setPlayingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <audio ref={audioRef} className="hidden" />

      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admincenter"
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về AdminCenter
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Volume2 className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                Thư Viện 63 Giọng Đọc AI Tiếng Việt
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                  v2.0.0
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Phân bổ chuẩn mực 3 miền: 21 Bắc • 21 Trung • 21 Nam
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/admincenter/company-chat"
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          Sang Kênh Chat Công Ty →
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/50 border border-white/10">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên AI, mã nhân sự, phòng ban, chức danh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRegionFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                regionFilter === "ALL"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Tất cả (63)
            </button>
            <button
              onClick={() => setRegionFilter("Bắc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                regionFilter === "Bắc"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Vùng Bắc (21)
            </button>
            <button
              onClick={() => setRegionFilter("Trung")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                regionFilter === "Trung"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Vùng Trung (21)
            </button>
            <button
              onClick={() => setRegionFilter("Nam")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                regionFilter === "Nam"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Vùng Nam (21)
            </button>
          </div>
        </div>

        {/* Voice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVoices.map((v) => (
            <div
              key={v.agent_id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-slate-800 shrink-0">
                  <img
                    src={`/assets/workforce/${v.agent_id}.jpg`}
                    alt={v.display_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white truncate">{v.display_name}</h3>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {v.voice_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 truncate">{v.job_title}</p>
                  <p className="text-[10px] text-slate-400 truncate">{v.department}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Vùng giọng:</span>
                  <span className="font-semibold text-white">🎙️ {v.region}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Phong cách:</span>
                  <span className="text-slate-300">{v.style}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Tham số âm học:</span>
                  <span className="font-mono text-[10px] text-emerald-400">
                    Rate: {v.rate} • Pitch: {v.pitch}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  Đã Duyệt (APPROVED)
                </span>

                <button
                  onClick={() => handlePlayVoice(v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    playingId === v.agent_id
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-white/10 hover:bg-emerald-500/20 text-white hover:text-emerald-300 border border-white/10"
                  }`}
                >
                  {playingId === v.agent_id ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      Tạm Dừng
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Nghe Thử
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
