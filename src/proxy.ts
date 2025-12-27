import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from './lib/server-auth';

export async function proxy(request: NextRequest) {
  const privyUserId = request.cookies.get('privy-id-token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/dashboard');
  const  user = await getServerUser()
  // Redirect to home if trying to access dashboard without auth
  if (isAuthPage && !privyUserId) {
    // we have to check user registered or not
    if(user?.registered){
        // process to dashboard
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};