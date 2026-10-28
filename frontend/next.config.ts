import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Pin workspace root to this directory so Next.js reads the correct
  // .env.local and doesn't get confused by the root package-lock.json
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
