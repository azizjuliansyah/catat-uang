import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // If "next" is in searchParams, use it as the redirect path, otherwise default to "/"
  const next = searchParams.get('next') ?? '/';

  const supabase = await createClient();

  // If there's already a valid session in the request cookies, redirect immediately
  const { data: { session: existingSession } } = await supabase.auth.getSession();
  if (existingSession) {
    return NextResponse.redirect(getRedirectUrl(request, origin, next));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(getRedirectUrl(request, origin, next));
    }

    // Fallback: If code exchange failed (e.g. already consumed by a double-request/prefetch),
    // check if a session was successfully established in this browser context.
    const { data: { session: fallbackSession } } = await supabase.auth.getSession();
    if (fallbackSession) {
      return NextResponse.redirect(getRedirectUrl(request, origin, next));
    }
  }

  // If code exchange fails and no session exists, redirect to a login page with an error
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}

function getRedirectUrl(request: Request, origin: string, next: string): string {
  const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
  const isLocalEnv = process.env.NODE_ENV === 'development';
  if (isLocalEnv) {
    return `${origin}${next}`;
  } else if (forwardedHost) {
    return `https://${forwardedHost}${next}`;
  } else {
    return `${origin}${next}`;
  }
}
