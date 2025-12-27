import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privyUserId, walletAddress, chainId, name } = body;

    if (!privyUserId || !walletAddress) {
      return NextResponse.json(
        { error: 'Privy user ID and wallet address are required' },
        { status: 400 }
      );
    }

    // Check if user exists by privyUserId
    let user = await prisma.user.findUnique({
      where: { privyUserId },
      include: {
        accounts: true,
      },
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { privyUserId },
        data: {
          walletAddress,
          chainId: chainId || 56, // Default to BSC
          name: name || user.name,
          updatedAt: new Date(),
        },
        include: {
          accounts: true,
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          privyUserId,
          walletAddress,
          chainId: chainId || 56,
          name,
          accounts: {
            create: {
              type: 'wallet',
              provider: 'privy',
              providerAccountId: walletAddress,
            },
          },
        },
        include: {
          accounts: true,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      user 
    }, { status: 200 });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}