/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer'],
  },
  // Fallback for SWC binary issues on Windows
  swcMinify: false,
};

module.exports = nextConfig;
