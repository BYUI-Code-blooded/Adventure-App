import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  experimental: { agentUpgrade: "security" },
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
