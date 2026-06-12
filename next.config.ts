import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Allow mobile device to receive Hot Module Reload (HMR) updates
  serverExternalPackages: [],
  // @ts-ignore - allowedDevOrigins is valid in Turbopack but NextConfig types might lag behind
  allowedDevOrigins: ['100.110.125.64', 'localhost'],
};

export default withPWA(nextConfig);
