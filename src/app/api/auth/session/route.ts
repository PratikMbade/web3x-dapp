// app/api/auth/session/route.ts
import { NextRequest,NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false });
    }


    // Get session from database
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
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
          }
        }
      },
    });

    // Check if session exists and is not expired
    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({
          where: { token: session.token }
        });
      }
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
      session: {
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ authenticated: false });
  }
}