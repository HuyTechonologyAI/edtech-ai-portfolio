import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // SEC-09 Fix: Re-enable TypeScript checking during build
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy",
            value: "upgrade-insecure-requests; frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
