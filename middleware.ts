import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nextUrl = request.nextUrl.clone();
  const pathname = nextUrl.pathname;

  // Static files check
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.indexOf('.') !== -1
  ) {
    return response;
  }

  const role = user?.app_metadata?.role || 'user';
  const status = user?.app_metadata?.status || 'active';

  // 1. Suspension guard
  if (user && status === 'suspended' && pathname !== '/suspended' && !pathname.startsWith('/auth/')) {
    nextUrl.pathname = '/suspended';
    return NextResponse.redirect(nextUrl);
  }

  // 2. Prevent suspended page access for active users
  if (user && status !== 'suspended' && pathname === '/suspended') {
    nextUrl.pathname = role === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(nextUrl);
  }

  // 3. Unauthenticated access control
  if (!user) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname === '/') {
      nextUrl.pathname = '/auth/login';
      return NextResponse.redirect(nextUrl);
    }
  } else {
    // 4. Authenticated redirects
    if (pathname.startsWith('/auth/login')) {
      nextUrl.pathname = role === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(nextUrl);
    }

    if (pathname.startsWith('/admin') && role !== 'admin') {
      nextUrl.pathname = '/dashboard';
      return NextResponse.redirect(nextUrl);
    }

    if (pathname.startsWith('/dashboard') && role === 'admin') {
      nextUrl.pathname = '/admin';
      return NextResponse.redirect(nextUrl);
    }

    if (pathname === '/') {
      nextUrl.pathname = role === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(nextUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
