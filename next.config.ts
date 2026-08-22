import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "msedge-tts",
    "edge-tts-universal",
    "ws",
    "bufferutil",
    "utf-8-validate",
  ],
};

export default nextConfig;
