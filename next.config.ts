import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for production builds to avoid workspace root issues
  experimental: {
    turbo: {
      root: ".",
    },
  },
};

export default nextConfig;
