import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function getServerUser() {
  try {
    const cookieStore = await cookies();
    const privyToken = cookieStore.get('privy-token');

    // we have to decode the privyToken to get user id
    if (!privyToken?.value) {
      return null;
    }
    const tokenPayload = privyToken.value.split('.')[1];
    let decodedToken: { sub?: string } | undefined;
    try {
      decodedToken = tokenPayload ? JSON.parse(atob(tokenPayload)) : undefined;
    } catch (err) {
      console.error('Failed to decode privy token:', err);
      return null;
    }
    const userId = decodedToken?.sub;


    // Decode the Privy user ID from the cookie
    // Note: This is a simplified version. In production, verify the JWT
    console.log('Privy User ID from cookie:', userId);
    const user = await prisma.user.findUnique({
      where: {
        privyUserId: userId,
      },
      include: {
        accounts: true,
        sessions: {
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
          take: 1,
        },
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getServerUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

export async function requireRegisteredUser() {
  const user = await requireAuth();
  
  if (!user.registered) {
    throw new Error('User not registered');
  }
  
  return user;
}