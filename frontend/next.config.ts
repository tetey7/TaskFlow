import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    // Use BACKEND_URL from env if set (Docker), otherwise localhost (CI/local dev)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
