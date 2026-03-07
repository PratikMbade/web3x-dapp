// lib/get-session.ts
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function getSession() {
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie') ?? '';
  
  const tokenMatch = cookieHeader
    .split(';')
    .find(c => c.trim().startsWith('better-auth.session_token='));
  
  const token = tokenMatch?.split('=')[1]?.trim();

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return session;
}