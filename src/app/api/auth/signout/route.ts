// app/api/auth/signout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (sessionToken) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: { token:sessionToken },
      });
    }

    const response = NextResponse.json({ success: true });
    
    // Clear session cookie
    response.cookies.delete("better-auth.session_token");

    return response;
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: "Signout failed" },
      { status: 500 }
    );
  }
}