import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './lib/session';

const protectedRoutes = [
    '/dashboard',
    '/ean',
    '/serials',
    '/zones',
    '/articles',
    '/report',
    '/sku-summary',
    '/zone-summary',
    '/users'
];
const publicRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(prefix => path.startsWith(prefix));

  const headers = new Headers(request.headers);
  headers.set('x-pathname', path);

  if (isProtectedRoute) {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.nextUrl));
    }
  }

  // Redirect authenticated users from login page to dashboard
  if (publicRoutes.includes(path)) {
     const session = await getSession(request);
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
      }
  }

  return NextResponse.next({
    request: {
      headers,
    },
  });
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}