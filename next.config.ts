import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Vercel server might run out of memory running TS, we verify it locally instead
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
