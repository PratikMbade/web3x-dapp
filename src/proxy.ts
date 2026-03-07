
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const isAuthPage = request.nextUrl.pathname.startsWith('/dashboard');
  
  // Get session token from cookies
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;

  // If trying to access dashboard without session
  if (isAuthPage && !sessionToken) {
    console.log('No session token, redirecting to home');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If we have a session token, verify it's valid
  if (isAuthPage && sessionToken) {
    try {
      // Check session validity by calling your session API
      const response = await fetch(new URL('/api/auth/session', request.url), {
        headers: {
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
      });

      const data = await response.json();

      // If session is invalid or user not registered, redirect
      if (!data.authenticated) {
        console.log('Invalid session, redirecting to home');
        const redirectResponse = NextResponse.redirect(new URL('/', request.url));
        // Clear the invalid session cookie
        redirectResponse.cookies.delete('better-auth.session_token');
        return redirectResponse;
      }

      // If user is not registered, redirect to home
      if (!data.user?.isRegistered) {
        console.log('data.user.isRegistered:', data.user);
        console.log('User not registered, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url));
      }

      // User is authenticated and registered, allow access
      console.log('User authenticated and registered, allowing access');
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};