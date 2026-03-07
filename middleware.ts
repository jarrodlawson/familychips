import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect everything under /admin except the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const valid = token ? await verifySessionToken(token) : false;
    if (!valid) {
      const loginUrl = new URL('/admin', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
