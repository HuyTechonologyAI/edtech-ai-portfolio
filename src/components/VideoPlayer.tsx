"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Play } from "lucide-react";

// Use dynamic import to prevent server-side rendering issues with ReactPlayer
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export function VideoPlayer({ url, playing = false, controls = true }: { url: string, playing?: boolean, controls?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-surface flex flex-col items-center justify-center animate-pulse">
        <Play className="h-12 w-12 text-primary/50 mb-4" />
        <div className="text-foreground/50 font-medium">Đang tải video...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        controls={controls}
        light={true} // Shows thumbnail first, then loads player on click (better performance)
      />
    </div>
  );
}
