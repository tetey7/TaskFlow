import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    // In Docker: use service name 'backend'
    // In CI/Local: use localhost
    // Check if we're in Docker by looking for HOSTNAME env var (Docker sets this)
    const isDocker = !!process.env.HOSTNAME;
    const backendUrl = isDocker ? 'http://backend:8000' : 'http://localhost:8000';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
