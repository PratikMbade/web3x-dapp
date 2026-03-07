// app/api/auth/wallet/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyMessage } from "viem";

export async function POST(req: NextRequest) {
  try {
    const { address, signature, message } = await req.json();
    console.log('Received wallet auth request:', { address });

    // Verify the signature using viem
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    console.log('Signature valid:', isValid);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Find or create user by wallet_address
    let user = await prisma.user.findUnique({
      where: { wallet_address: address.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          wallet_address: address.toLowerCase(),
          isRegistered: false,
          directTeam: 0,
          totalTema: 0,
        },
      });
      console.log('New user created:', user.id);
    }

    // Update or create nonce
    const nonce = crypto.randomUUID();
    await prisma.cryptoLoginNonce.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        nonce,
        expires: new Date(Date.now() + 10 * 60 * 1000),
      },
      update: {
        nonce,
        expires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Create session manually (Better Auth compatible)
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000); // 30 days

    await prisma.session.create({
      data: {
     id: crypto.randomUUID(),
    token: sessionToken,        // ← was sessionToken key, column now named token
    userId: user.id,
    expiresAt: expiresAt,       // ← was expires
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: req.headers.get("x-forwarded-for") ?? "",
    userAgent: req.headers.get("user-agent") ?? "",
      },
    });

    console.log('Session created for user:', user.id);

    // Return response
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        wallet_address: user.wallet_address,
        isRegistered: user.isRegistered,
        directTeam: user.directTeam,
        totalTema: user.totalTema,
      }
    });

    // Set session cookie (Better Auth format)
    response.cookies.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Wallet auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}