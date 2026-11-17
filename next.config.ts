import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep repository guidance deliberate rather than generating it on startup.
  agentRules: false,
};

export default nextConfig;
