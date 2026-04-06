import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  turbopack: {
    root: process.cwd(),
  },
} as any;

export default nextConfig;
