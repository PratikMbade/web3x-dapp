/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/matrix-tree/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet_address = searchParams.get('wallet_address');
    const chainId = searchParams.get('chainId');
    const packageNumber = searchParams.get('packageNumber');

    // Validate required parameters
    if (!wallet_address || !chainId || !packageNumber) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters: wallet_address, chainId, and packageNumber are required' 
        },
        { status: 400 }
      );
    }

    const chainIdNum = parseInt(chainId, 10);
    const packageNum = parseInt(packageNumber, 10);

    if (isNaN(chainIdNum) || isNaN(packageNum)) {
      return NextResponse.json(
        { error: 'chainId and packageNumber must be valid numbers' },
        { status: 400 }
      );
    }

    // Find matrix trees for the given wallet address, chain, and package
    const matrixTrees = await prisma.matrixTree.findMany({
      where: {
        upline_address: wallet_address,
        chainId: chainIdNum,
        packageNumber: packageNum
      },
      orderBy: {
        position: 'asc' // This will help with consistent ordering
      }
    });
    console.log('matrixTrees', matrixTrees);

    let downlineTrees: any[] = [];

    // If matrix trees are found, fetch their downlines
    if (matrixTrees && matrixTrees.length > 0) {
      downlineTrees = await prisma.matrixTree.findMany({
        where: {
          upline_address: {
            in: matrixTrees.map(tree => tree.wallet_address)
          },
          chainId: chainIdNum,
          packageNumber: packageNum
        },
        orderBy: [
          { upline_address: 'asc' },
          { position: 'asc' }
        ]
      });
    }

    return NextResponse.json({
      matrixTrees,
      downlineTrees,
      metadata: {
        wallet_address,
        chainId: chainIdNum,
        packageNumber: packageNum,
        matrixCount: matrixTrees.length,
        downlineCount: downlineTrees.length
      }
    });

  } catch (error) {
    console.error('Error fetching matrix tree:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}