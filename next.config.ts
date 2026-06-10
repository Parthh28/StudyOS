import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile device to receive Hot Module Reload (HMR) updates
  serverExternalPackages: [],
  // @ts-ignore - allowedDevOrigins is valid in Turbopack but NextConfig types might lag behind
  allowedDevOrigins: ['100.110.125.64', 'localhost'],
};

export default nextConfig;
