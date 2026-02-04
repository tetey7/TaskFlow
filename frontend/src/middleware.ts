import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only handle /api/* requests
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Use backend hostname for Docker, fallback to localhost for local dev
    const backendUrl = 'http://backend:8000';

    // Preserve the full path including trailing slash
    const apiPath = request.nextUrl.pathname + request.nextUrl.search;
    const backendApiUrl = `${backendUrl}${apiPath}`;

    console.log('[Middleware] Original path:', request.nextUrl.pathname);
    console.log('[Middleware] Rewriting to:', backendApiUrl);

    // Return a rewrite to the backend, preserving the exact URL structure
    return NextResponse.rewrite(new URL(backendApiUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
