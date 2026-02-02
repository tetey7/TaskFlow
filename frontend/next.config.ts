import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:8000';

    return [
      // Match with trailing slash first (higher priority)
      {
        source: '/api/:path*/',
        destination: `${backendUrl}/api/:path*/`,
      },
      // Match without trailing slash and add it
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
