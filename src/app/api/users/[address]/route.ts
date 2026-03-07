import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ address: string }> }
) {
  // ✅ await params
  const { address } = await context.params;

  console.log("address", address);

  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

  if (!ethAddressRegex.test(address)) {
    return NextResponse.json(
      { error: "Invalid Ethereum address format" },
      { status: 400 }
    );
  }

  try {
    const userData = {
      ethAddress: address,
      activePlan: "BUILDER",
      activeNFT: "JUST CREATOR",
      nftLevel: 0,
      horseTokens: 13,
      incomeChange: 12.5,
      bonusChange: -20,
      liquidityChange: 4.5,

      nftBonus: [
        { month: "February", desktop: 186 },
        { month: "March", desktop: 305 },
        { month: "April", desktop: 237 },
        { month: "May", desktop: 73 },
        { month: "June", desktop: 209 },
        { month: "July", desktop: 214 },
      ],

      nftCounts: [
        { name: "Explorer", count: 186 },
        { name: "Builder", count: 305 },
        { name: "Innovator", count: 237 },
        { name: "Achiever", count: 73 },
        { name: "Leader", count: 209 },
        { name: "Sage", count: 214 },
      ],

      categoryIncome: [
        { name: "Matrix Income", value: 3 },
        { name: "Level Income", value: 1 },
        { name: "NFT Income", value: 1 },
      ],
    };

    await new Promise((r) => setTimeout(r, 300));

    return NextResponse.json(userData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
