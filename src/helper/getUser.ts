import prisma from "@/lib/prisma";


export const getUserByWalletAddress = async (wallet_address: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        wallet_address: wallet_address,
      },
      include: {
        directTeamTable:true,
        totalTeamTable:true,

      },
    });

    if (!user) {
      return { user: null, lastestPlanetName: 0 };
    }


    return { user };
  } catch (error) {
    console.log(
        'Error fetching user by wallet address:',
        error
    )
    return null;
  }
};
