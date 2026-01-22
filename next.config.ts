import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['esbuild-wasm'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10gb'
    },
    proxyClientMaxBodySize: '10gb'
  }
};

export default nextConfig;
