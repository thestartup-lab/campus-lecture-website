import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // 禁用 hostname 檢測以避免 macOS 系統錯誤
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
