import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'campus-lecture-website.vercel.app' }],
        destination: 'https://pm.cjlead.com.tw/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
