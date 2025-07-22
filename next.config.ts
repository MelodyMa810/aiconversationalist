import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // More conservative development settings to prevent cache corruption
  experimental: {
    // Disable package import optimization that can cause issues
    // optimizePackageImports: ['@radix-ui/react-avatar', '@radix-ui/react-label', '@radix-ui/react-radio-group'],
  },
  
  // Configure Turbopack (new stable way)
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },
  
  // More conservative webpack config
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable aggressive caching that causes corruption
      config.cache = false;
      
      // Better file watching
      config.watchOptions = {
        poll: 2000, // Slower polling to prevent corruption
        aggregateTimeout: 500,
        ignored: /node_modules/,
      }
    }
    return config
  },
  
  // More stable builds
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Longer timeout
    pagesBufferLength: 2,
  },
};

export default nextConfig;
