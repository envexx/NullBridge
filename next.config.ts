// NullBridge MCP - Next.js configuration for Cross-Chain Asset Bridge
import type { NextConfig } from "next";
import { baseURL } from "./baseUrl";

const nextConfig: NextConfig = {
  assetPrefix: baseURL, // Ensures assets load correctly in ChatGPT iframe
};

export default nextConfig;
