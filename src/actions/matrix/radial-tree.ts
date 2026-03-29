'use server'
import prisma from "@/lib/prisma";

// Add nodeColor to TreeNode
interface TreeNode {
  id: string;
  regId: number;
  directSponsor: string;
  nodeColor: 'blue' | 'green' | 'pink'; // 👈 new
  chainId: number;
  wallet_address: string;
  upline_address: string;
  amount: string;
  position: string;
  userId: string;
  packageNumber?: number;
  label?: string;
  children?: TreeNode[];
}

interface ApiResponse {
  matrixTrees: TreeNode[];
  downlineTrees: TreeNode[];
  metadata: {
    wallet_address: string;
    chainId: number;
    packageNumber: number;
    matrixCount: number;
    downlineCount: number;
    yourRegId: number; // 👈 pass to frontend for legend reference
  };
}

const userSelect = {
  id: true,
  wallet_address: true,
  regId: true,
  sponsor_address: true,
} as const;

export async function getRadialTreeData(
  wallet_address: string,
  packageNumber: number,
  chainId: number
): Promise<{ success: true; data: ApiResponse } | { success: false; error: string }> {
  try {
    const normalizedAddress = wallet_address.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { wallet_address: normalizedAddress },
      select: { id: true, regId: true },
    });

    if (!user) return { success: false, error: "User not found" };

    const yourRegId = user.regId ?? 0;

    // Level 1 matrix rows
    const level1Rows = await prisma.matrixTree.findMany({
      where: { upline_address: normalizedAddress, packageNumber, chainId },
    });

    const level1Addresses = level1Rows.map((r) => r.wallet_address.toLowerCase());

    // Level 2 matrix rows
    const level2Rows = level1Addresses.length > 0
      ? await prisma.matrixTree.findMany({
          where: {
            upline_address: { in: level1Addresses },
            packageNumber,
            chainId,
          },
        })
      : [];

    const level2Addresses = level2Rows.map((r) => r.wallet_address.toLowerCase());
    const allAddresses = [...new Set([...level1Addresses, ...level2Addresses])];

    const childUsers = await prisma.user.findMany({
      where: { wallet_address: { in: allAddresses } },
      select: userSelect,
    });

    // We also need regId of each node's sponsor to determine color
    // Collect all sponsor addresses from child users
    const sponsorAddresses = childUsers
      .map((u) => u.sponsor_address?.toLowerCase())
      .filter((a): a is string => !!a && a !== normalizedAddress); // exclude "you" — already known

    // Fetch sponsor users (only the ones that are NOT "you")
    const sponsorUsers = sponsorAddresses.length > 0
      ? await prisma.user.findMany({
          where: { wallet_address: { in: sponsorAddresses } },
          select: { wallet_address: true, regId: true },
        })
      : [];

    // Build lookup maps
    const userMap = new Map(childUsers.map((u) => [u.wallet_address.toLowerCase(), u]));
    
    // Sponsor regId map: sponsor_wallet → regId
    // Include "you" in it too
    const sponsorRegIdMap = new Map(sponsorUsers.map((u) => [u.wallet_address.toLowerCase(), u.regId ?? 0]));
    sponsorRegIdMap.set(normalizedAddress, yourRegId); // add yourself

    // Color logic
    const resolveColor = (sponsorAddress: string): 'blue' | 'green' | 'pink' => {
      const sponsor = sponsorAddress.toLowerCase();
      if (sponsor === normalizedAddress) return 'blue';           // you are the sponsor
      const sponsorRegId = sponsorRegIdMap.get(sponsor) ?? 0;
      return sponsorRegId > yourRegId ? 'green' : 'pink';         // spilled from below or above
    };

    const toTreeNode = (row: {
      id: string;
      chainId: number;
      wallet_address: string;
      upline_address: string;
      amount: string;
      position: string;
      userId: string;
      packageNumber: number | null;
    }): TreeNode => {
      const childUser = userMap.get(row.wallet_address.toLowerCase());
      const sponsorAddress = childUser?.sponsor_address ?? '';
      return {
        id: row.id,
        regId: childUser?.regId ?? 0,
        directSponsor: sponsorAddress,
        nodeColor: resolveColor(sponsorAddress),  // 👈 computed here
        chainId: row.chainId,
        wallet_address: row.wallet_address,
        upline_address: row.upline_address,
        amount: row.amount,
        position: row.position,
        userId: childUser?.id ?? row.userId,
        packageNumber: row.packageNumber ?? undefined,
      };
    };

    const matrixTrees: TreeNode[] = level1Rows.map(toTreeNode);
    const downlineTrees: TreeNode[] = level2Rows.map(toTreeNode);

    return {
      success: true,
      data: {
        matrixTrees,
        downlineTrees,
        metadata: {
          wallet_address: normalizedAddress,
          chainId,
          packageNumber,
          matrixCount: matrixTrees.length,
          downlineCount: downlineTrees.length,
          yourRegId,
        },
      },
    };
  } catch (error) {
    console.error("[getRadialTreeData] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}