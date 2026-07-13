import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile device to receive Hot Module Reload (HMR) updates
  serverExternalPackages: [],
  // @ts-ignore - allowedDevOrigins is valid in Turbopack but NextConfig types might lag behind
  allowedDevOrigins: ['100.110.125.64', 'localhost'],
  // Optimize heavy barrel imports (icons, charts, dates) to avoid compiling thousands of modules
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
  },
  // Use Turbopack (default in Next.js 16); no custom webpack plugins needed
  turbopack: {},
};

export default nextConfig;
