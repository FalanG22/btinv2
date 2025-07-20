import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './lib/session';

// Rutas que son accesibles públicamente
const publicRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = await getSession(request);

  const isPublicRoute = publicRoutes.includes(path);
  
  // Si el usuario está autenticado
  if (session) {
    // Si intenta acceder a una ruta pública (como /login), redirigir al dashboard
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
    }
  } 
  // Si el usuario NO está autenticado
  else {
    // Si intenta acceder a cualquier ruta que no sea pública, redirigir al login
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.nextUrl));
    }
  }

  // Si no se cumple ninguna condición de redirección, continuar con la solicitud
  const headers = new Headers(request.headers);
  headers.set('x-pathname', path);
  return NextResponse.next({
    request: {
      headers,
    },
  });
}

// El matcher se asegura de que el middleware se ejecute en todas las rutas
// excepto en los archivos estáticos y rutas de la API de Next.js.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
