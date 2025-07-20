import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './lib/session';

const publicRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = await getSession(request);

  const isPublicRoute = publicRoutes.includes(path);
  
  // If the user is logged in
  if (session) {
    // And tries to access a public route like /login, redirect to dashboard
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
    }
  } 
  // If the user is not logged in
  else {
    // And tries to access a protected route, redirect to login
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.nextUrl));
    }
  }

  // If no redirection is needed, continue with the request
  return NextResponse.next();
}

// The matcher ensures the middleware runs on all routes
// except for static files and Next.js internal API routes.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
