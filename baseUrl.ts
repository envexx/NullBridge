// NullBridge MCP - Base URL configuration for deployment
export const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_ENV === "production"
        ? "https://null-bridge.vercel.app"
        : process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}`
          : "https://null-bridge.vercel.app");
