import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Vercel server might run out of memory running TS, we verify it locally instead
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors during Vercel build
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
