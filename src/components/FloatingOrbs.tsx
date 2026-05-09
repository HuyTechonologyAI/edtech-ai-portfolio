"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function FloatingOrbs() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Render 3 glowing orbs that float randomly across the screen
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20">
      <motion.div
        className="absolute w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]"
        animate={{
          x: ["-10vw", "110vw", "50vw", "-10vw"],
          y: ["-10vh", "50vh", "110vh", "-10vh"],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px]"
        animate={{
          x: ["110vw", "-10vw", "50vw", "110vw"],
          y: ["50vh", "110vh", "-10vh", "50vh"],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]"
        animate={{
          x: ["50vw", "110vw", "-10vw", "50vw"],
          y: ["110vh", "-10vh", "50vh", "110vh"],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
