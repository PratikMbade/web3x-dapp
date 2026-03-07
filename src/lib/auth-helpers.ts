// lib/auth-helpers.ts
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function getServerSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token:sessionToken },
    include: {
      user: {
        select: {
          id: true,
          wallet_address: true,
          isRegistered: true,
          directTeam: true,
          totalTema: true,
          regId: true,
          metaunityId: true,
          sponsor_address: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return {
    user: session.user,
    session: {
      expires: session.expiresAt,
    },
  };
}