"use client";

import Tilt from 'react-parallax-tilt';

export function TiltCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      perspective={1000}
      transitionSpeed={1500}
      scale={1.03}
      gyroscope={true}
      glareEnable={true}
      glareMaxOpacity={0.15}
      glareColor="#00FF85"
      glarePosition="all"
      glareBorderRadius="1.5rem"
      className={`h-full ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="w-full h-full" style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </Tilt>
  );
}
