/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', 'sql.js'],
  },
  // Fallback for SWC binary issues on Windows
  swcMinify: false,
  webpack: (config, { isServer }) => {
    // Handle sql.js WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Exclude sql.js from client bundle (server-only)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
