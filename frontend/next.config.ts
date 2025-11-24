import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Match with trailing slash first (higher priority)
      {
        source: '/api/:path*/',
        destination: 'http://backend:8000/api/:path*/',
      },
      // Match without trailing slash and add it
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*/',
      },
    ];
  },
};

export default nextConfig;
