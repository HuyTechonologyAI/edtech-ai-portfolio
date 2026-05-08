"use client";

import Tilt from 'react-parallax-tilt';

export function TiltCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <Tilt
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
      perspective={1000}
      transitionSpeed={1500}
      scale={1.02}
      gyroscope={true}
      glareEnable={true}
      glareMaxOpacity={0.15}
      glareColor="#00e57a"
      glarePosition="bottom"
      glareBorderRadius="1rem"
      className={`h-full ${className}`}
    >
      {children}
    </Tilt>
  );
}
