"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  AlertCircle,
  Sparkles,
  Bot
} from "lucide-react";

import voiceRegistryData from "@/data/voice_registry.json";

export interface VoiceCardProfile {
  agent_id: string;
  display_name: string;
  job_title?: string;
  department?: string;
  region?: string;
  style?: string;
  card_intro_text: string;
  sample_path: string;
}

interface AiVoiceCardPlayerProps {
  agentId: string;
  displayName?: string;
  region?: string;
  style?: string;
  introText?: string;
  samplePath?: string;
  fallbackSamplePath?: string;
  autoPlay?: boolean;
}

// Global active audio tracker to enforce strictly 1 voice playback across the entire page
let globalActiveAudio: HTMLAudioElement | null = null;
let globalActiveStopCallback: (() => void) | null = null;

export function stopAnyActiveVoice() {
  if (globalActiveAudio) {
    try {
      globalActiveAudio.pause();
      globalActiveAudio.currentTime = 0;
    } catch {
      // ignore
    }
    globalActiveAudio = null;
  }
  if (globalActiveStopCallback) {
    globalActiveStopCallback();
    globalActiveStopCallback = null;
  }
}

export function AiVoiceCardPlayer({
  agentId,
  displayName,
  region,
  style,
  introText,
  samplePath,
  fallbackSamplePath,
  autoPlay = true,
}: AiVoiceCardPlayerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registeredVoice = (voiceRegistryData as any)?.voices?.[agentId];
  const finalDisplayName = displayName || registeredVoice?.display_name || agentId;
  const finalRegion = region || registeredVoice?.region;
  const finalStyle = style || registeredVoice?.style;
  const finalIntroText = introText || registeredVoice?.card_intro?.intro_text || registeredVoice?.intro_text || `Xin chào, tôi là ${finalDisplayName}, nhân sự AI thuộc HUY TECHNOLOGY AI GROUP.`;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInputRef = useRef<HTMLInputElement | null>(null);

  // Candidate audio URLs: card intro first, fallback intro sample
  const primaryUrl = samplePath || registeredVoice?.card_intro?.sample_path || `/voices/cards/${agentId}_card.mp3`;
  const secondaryUrl = fallbackSamplePath || registeredVoice?.sample_path || `/voices/samples/${agentId}_intro.mp3`;

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      } catch {
        // ignore
      }
      audioRef.current = null;
    }
    if (globalActiveAudio === audioRef.current) {
      globalActiveAudio = null;
      globalActiveStopCallback = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const playAudio = useCallback((audio: HTMLAudioElement) => {
    stopAnyActiveVoice();
    globalActiveAudio = audio;
    globalActiveStopCallback = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    setIsLoading(true);
    setAutoplayBlocked(false);
    setHasError(false);

    audio.play()
      .then(() => {
        setIsLoading(false);
        setIsPlaying(true);
      })
      .catch((err) => {
        setIsLoading(false);
        setIsPlaying(false);
        if (err.name === "NotAllowedError" || err.name === "AbortError") {
          // Autoplay blocked by browser policy: show explicit Play button
          setAutoplayBlocked(true);
        } else {
          console.warn("Audio playback issue:", err);
          setHasError(true);
        }
      });
  }, []);

  const playFallbackRef = useRef<(() => void) | null>(null);

  const initAndPlayAudio = useCallback((urlToTry: string, allowFallback = true) => {
    cleanupAudio();

    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = urlToTry;
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (!isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    };

    audio.onerror = () => {
      if (allowFallback && urlToTry !== secondaryUrl && playFallbackRef.current) {
        // Try fallback general intro sample
        playFallbackRef.current();
      } else {
        setIsLoading(false);
        setIsPlaying(false);
        setHasError(true);
      }
    };

    playAudio(audio);
  }, [cleanupAudio, playAudio, secondaryUrl]);

  useEffect(() => {
    playFallbackRef.current = () => {
      initAndPlayAudio(secondaryUrl, false);
    };
  }, [initAndPlayAudio, secondaryUrl]);

  // Setup on mount and when agentId changes
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (autoPlay) {
      timer = setTimeout(() => {
        initAndPlayAudio(primaryUrl, true);
      }, 50);
    }

    return () => {
      if (timer) clearTimeout(timer);
      cleanupAudio();
    };
  }, [agentId, autoPlay, initAndPlayAudio, primaryUrl, cleanupAudio]);

  const handleTogglePlay = () => {
    if (!audioRef.current) {
      initAndPlayAudio(primaryUrl, true);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAudio(audioRef.current);
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      playAudio(audioRef.current);
    } else {
      initAndPlayAudio(primaryUrl, true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !audioRef.current.muted;
      audioRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#131F37] to-[#0A101D] border border-cyan-500/30 p-4 sm:p-5 shadow-xl shadow-cyan-950/20 my-3">
      {/* Top Header: Title, AI Badge, Regional Accent */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isPlaying
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.3)] animate-pulse"
                : "bg-white/5 text-slate-400 border border-white/10"
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Giọng giới thiệu của {finalDisplayName}
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                <Bot className="w-3 h-3" /> Nhân sự AI
              </span>
            </div>
            {(finalRegion || finalStyle) && (
              <p className="text-[11px] text-slate-400 font-medium">
                {finalRegion && <span>Âm sắc: <strong className="text-slate-300">{finalRegion}</strong></span>}
                {finalRegion && finalStyle && <span> • </span>}
                {finalStyle && <span>Phong cách: <strong className="text-slate-300">{finalStyle}</strong></span>}
              </p>
            )}
          </div>
        </div>

        {isPlaying && (
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ĐANG PHÁT GIỌNG THỰC
          </span>
        )}
      </div>

      {/* Main Interactive Audio Player Controls */}
      <div className="pt-3 pb-2 space-y-3">
        {/* Progress bar & Time display */}
        <div className="space-y-1">
          <div className="relative flex items-center">
            <input
              ref={progressInputRef}
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              disabled={duration === 0 || hasError}
              aria-label={`Tiến trình phát giọng của ${finalDisplayName}`}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00E5FF] focus:outline-none"
              style={{
                background: `linear-gradient(to right, #00E5FF ${progressPercent}%, #1E293B ${progressPercent}%)`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : "0:15"}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={isLoading || hasError}
              aria-label={isPlaying ? "Tạm dừng giọng giới thiệu" : "Phát giọng giới thiệu"}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 ${
                isPlaying
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20"
                  : "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-cyan-500/20"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Tạm dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{currentTime > 0 ? "Tiếp tục" : "Nghe giọng"}</span>
                </>
              )}
            </button>

            {/* Replay Button */}
            <button
              type="button"
              onClick={handleReplay}
              disabled={isLoading || hasError}
              aria-label="Nghe lại từ đầu"
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              title="Nghe lại từ đầu"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Nghe lại</span>
            </button>

            {/* Stop Button */}
            <button
              type="button"
              onClick={handleStop}
              disabled={currentTime === 0 && !isPlaying}
              aria-label="Dừng phát giọng"
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Dừng phát"
            >
              <Square className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">Dừng</span>
            </button>
          </div>

          {/* Mute / Unmute Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={isMuted ? "Bật âm lượng" : "Tắt tiếng"}
              className={`p-2 rounded-xl text-xs border transition-all cursor-pointer ${
                isMuted
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : "bg-white/5 text-slate-400 hover:text-white border-white/10"
              }`}
              title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Autoplay blocked banner (browser privacy safeguard) */}
        {autoplayBlocked && !isPlaying && (
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center justify-between gap-2 animate-fade-in">
            <span>Trình duyệt yêu cầu xác nhận để phát âm thanh.</span>
            <button
              type="button"
              onClick={handleTogglePlay}
              className="px-2.5 py-1 rounded-lg bg-cyan-400 text-slate-950 font-bold text-[11px] hover:bg-cyan-300 transition-colors"
            >
              Nhấn để nghe
            </button>
          </div>
        )}

        {/* Error notification */}
        {hasError && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Không thể phát lúc này. Lời giới thiệu đang được tải lại.</span>
            </div>
            <button
              type="button"
              onClick={() => initAndPlayAudio(primaryUrl, true)}
              className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 text-[11px] font-bold hover:bg-rose-500/30"
            >
              Thử lại
            </button>
          </div>
        )}
      </div>

      {/* Transcript Text Box (Spoken Introduction to read alongside) */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Văn bản lời giới thiệu công khai:</span>
        </div>
        <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-200 leading-relaxed font-sans italic selection:bg-cyan-500/30">
          &quot;{finalIntroText}&quot;
        </div>
      </div>
    </div>
  );
}
