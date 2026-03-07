
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from './lib/prisma';

export async function proxy(request: NextRequest) {
 const isAuthPage = request.nextUrl.pathname.startsWith('/dashboard');

  if (!isAuthPage) return NextResponse.next();

  const sessionToken = request.cookies.get('better-auth.session_token')?.value;

  if (!sessionToken) {
    console.log('No session token, redirecting to home');
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          select: {
            isRegistered: true,
          },
        },
      },
    });

    // Invalid or expired session
    if (!session || session.expiresAt < new Date()) {
      console.log('Invalid or expired session, redirecting');
      const res = NextResponse.redirect(new URL('/', request.url));
      res.cookies.delete('better-auth.session_token');
      return res;
    }

    // Not registered
    if (!session.user?.isRegistered) {
      console.log('User not registered, redirecting');
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log('User authenticated and registered, allowing access');
    return NextResponse.next();

  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};