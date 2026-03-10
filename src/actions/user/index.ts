'use server';
import prisma from '@/lib/prisma';
import { DirectTeamTableType } from '@/types/team';

export async function getUserHighestPackage(wallet_address: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { wallet_address },
    });
    if (!user) return null;

    const highestPackage = await prisma.package.findFirst({
      where: { userId: user.id },
      orderBy: { packageNumber: 'desc' },
    });


    console.log('highestPackage',highestPackage);
    return highestPackage ;
  } catch (error) {
    console.error('Error fetching user highest package:', error);
    return null;
  }
}

export async function getDirectTeamMembers(
  wallet_address: string
): Promise<DirectTeamTableType[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { wallet_address },
      select: { directTeamTable: true },
    });

    if (!user) return [];

    const directTeam = await prisma.user.findMany({
      where: { sponsor_address: wallet_address },
      include: {
        levelIncome: true,
        matrixIncome: true,
      },
    });

    const directTeamMembers: DirectTeamTableType[] = [];

    for (const member of directTeam) {
      let memberLevelIncome = 0;
      let memberMatrixIncome = 0;

      member.levelIncome.forEach((entry) => {
        memberLevelIncome += parseFloat(entry.amount || '0');
      });

      member.matrixIncome.forEach((entry) => {
        memberMatrixIncome += parseFloat(entry.amount || '0');
      });

      const totalIncome = memberLevelIncome + memberMatrixIncome;
      const currentPackage = await getUserHighestPackage(member.wallet_address);

      directTeamMembers.push({
        id: member.id,
        wallet_address: member.wallet_address,
        joined_at: member.createdAt.toLocaleString(),
        current_package: currentPackage?.packageNumber || 0,
        direct_team_members: member.directTeam,
        total_team_members: member.totalTema,
        total_income: parseFloat(totalIncome.toFixed(2)),
      });
    }

    return directTeamMembers;
  } catch (error) {
    console.error('Error fetching direct team members:', error);
    return [];
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

export async function seedAdmin(adminWallet: string) {
  const admin = await prisma.user.findUnique({
    where: { wallet_address: adminWallet },
  });

  if (admin) {
    console.log('Admin already exists');
    return;
  }

  const metaunityId = 'MU' + adminWallet.slice(-8).toUpperCase();

  const createdAdmin = await prisma.user.create({
    data: {
      metaunityId,
      wallet_address: adminWallet,
      sponsor_address: '',
    },
  });

  console.log('Admin created:', createdAdmin);
}

export type RegisterUserByAddType = {
  regId: number;
  user: string;
  upline: string;
  uplineId: string;
  teamCount: string;
};

export async function saveUserInDB(data: RegisterUserByAddType) {
  console.log(`ID: ${data.regId}`);
  console.log(`🧑 User:     ${data.user}`);
  console.log(`🧑 Upline:   ${data.upline}`);
  console.log(`🔗 Upline ID: ${data.uplineId}`);
  console.log(`👥 Team Count: ${data.teamCount}`);
  console.log('--------------------------');

  const wallet_address = data.user.toLowerCase();
  const sponsor_address = data.upline.toLowerCase();
  const regId = Number(data.regId);

  try {
    // Handle admin user
    if (wallet_address === '0xA30224CA6A6004369114F6A027e8A829EDcDa501'.toLowerCase()) {
      await seedAdmin(data.user);
      return { msg: 'Admin user created successfully', status: 200 };
    }

    // Validate input
    if (!wallet_address || !sponsor_address) {
      return { msg: 'Invalid input data', status: 400 };
    }

    // Check if already fully registered — skip if so
    const existingUser = await prisma.user.findUnique({
      where: { wallet_address },
    });

    if (existingUser?.isRegistered === true) {
      console.log('User already registered, skipping:', wallet_address);
      return { msg: 'User is already registered', status: 200 };
    }

    // Ensure sponsor exists — seed admin if needed
    let sponsor = await prisma.user.findUnique({
      where: { wallet_address: sponsor_address },
    });

    if (!sponsor) {
      if (sponsor_address === '0xA30224CA6A6004369114F6A027e8A829EDcDa501'.toLowerCase()) {
        await seedAdmin(data.upline);
        sponsor = await prisma.user.findUnique({
          where: { wallet_address: sponsor_address },
        });
      }

      if (!sponsor) {
        return { msg: 'Sponsor does not exist', status: 400 };
      }
    }

    // Create metaunity ID
    const metaunityId = 'WX' + data.user.slice(-8).toUpperCase();

    // Upsert user — handles both new users and pre-created wallet-auth users
    const user = await prisma.user.upsert({
      where: { wallet_address },
      update: {
        regId,
        isRegistered: true,
        metaunityId,
        sponsor_address, // ← critical: update sponsor on existing record
      },
      create: {
        regId,
        isRegistered: true,
        metaunityId,
        wallet_address,
        sponsor_address,
      },
    });

    console.log('User upserted:', user);

    // 1. Direct Team — upsert to prevent duplicates
    const existingDirect = await prisma.directTeam.findUnique({
      where: {
        userId_wallet_address: {
          userId: sponsor.id,
          wallet_address: user.wallet_address,
        },
      },
    });

    if (!existingDirect) {
      await prisma.directTeam.create({
        data: {
          userId: sponsor.id,
          wallet_address: user.wallet_address,
        },
      });

      await prisma.user.update({
        where: { id: sponsor.id },
        data: { directTeam: { increment: 1 } },
      });
    }

    // 2. Total Team — up to 12 generations, skip duplicates
    let currentSponsor = sponsor;
    let level = 1;

    while (currentSponsor && level <= 12) {
      const existingTotal = await prisma.totalTeam.findUnique({
        where: {
          userId_wallet_address: {
            userId: currentSponsor.id,
            wallet_address: user.wallet_address,
          },
        },
      });

      if (!existingTotal) {
        await prisma.totalTeam.create({
          data: {
            userId: currentSponsor.id,
            wallet_address: user.wallet_address,
            generational_level: level,
          },
        });

        await prisma.user.update({
          where: { id: currentSponsor.id },
          data: { totalTema: { increment: 1 } },
        });
      }

      if (!currentSponsor.sponsor_address) break;

      const nextSponsor = await prisma.user.findUnique({
        where: { wallet_address: currentSponsor.sponsor_address },
      });

      if (!nextSponsor) break;

      currentSponsor = nextSponsor;
      level++;
    }

    return {
      msg: 'User registered successfully',
      status: 200,
      user,
    };
  } catch (error) {
    console.error('something went wrong in saveUserInDB', error);
    return { msg: 'Error saving user in database', status: 500 };
  }
}

export async function getUserByWalletAddressForSearch(wallet_address: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { wallet_address },
    });

    if (!user) return null;
    return user;
  } catch (error) {
    console.error('Error fetching user by wallet address:', error);
    return null;
  }
}

export async function getUserPackage(wallet_address: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { wallet_address },
      include: { packages: true },
    });

    if (!user) return null;

    const uniquePackagesMap = new Map<number, (typeof user.packages)[0]>();

    for (const pkg of user.packages) {
      if (!uniquePackagesMap.has(pkg.packageNumber)) {
        uniquePackagesMap.set(pkg.packageNumber, pkg);
      }
    }

    const uniquePackages = Array.from(uniquePackagesMap.values());
    const ascendingOrderPackage = uniquePackages.sort(
      (a, b) => a.packageNumber - b.packageNumber
    );

    return ascendingOrderPackage;
  } catch (error) {
    console.error('Error fetching user packages:', error);
    return null;
  }
}

export async function getUserTotalIncome(
  wallet_address: string
): Promise<{ levelIncome: number; matrixIncome: number }> {
  try {
    const user = await prisma.user.findUnique({
      where: { wallet_address },
      select: { id: true },
    });

    if (!user) return { levelIncome: 0, matrixIncome: 0 };

    const [levelIncomeRecords, matrixIncomeRecords] = await Promise.all([
      prisma.levelIncome.findMany({
        where: { userId: user.id },
        select: { amount: true },
      }),
      prisma.matrixIncome.findMany({
        where: { userId: user.id },
        select: { amount: true },
      }),
    ]);

    const levelIncome = levelIncomeRecords.reduce(
      (sum, entry) => sum + parseFloat(entry.amount || '0'),
      0
    );
    const matrixIncome = matrixIncomeRecords.reduce(
      (sum, entry) => sum + parseFloat(entry.amount || '0'),
      0
    );

    return {
      levelIncome: parseFloat(levelIncome.toFixed(2)),
      matrixIncome: parseFloat(matrixIncome.toFixed(2)),
    };
  } catch (error) {
    console.error('❌ Error calculating total income:', error);
    return { levelIncome: 0, matrixIncome: 0 };
  }
}

export async function getTeamIncomeAggregation(
  wallet_address: string
): Promise<{ levelIncomeAggregate: number; matrixIncomeAggregate: number }> {
  try {
    const user = await prisma.user.findUnique({
      where: { wallet_address },
      include: {
        levelIncome: true,
        matrixIncome: true,
      },
    });

    if (!user) return { levelIncomeAggregate: 0, matrixIncomeAggregate: 0 };

    const levelIncomeAggregate = user.levelIncome.reduce(
      (sum, entry) => sum + parseFloat(entry.amount || '0'),
      0
    );

    const matrixIncomeAggregate = user.matrixIncome.reduce(
      (sum, entry) => sum + parseFloat(entry.amount || '0'),
      0
    );

    return {
      levelIncomeAggregate: parseFloat(levelIncomeAggregate.toFixed(2)),
      matrixIncomeAggregate: parseFloat(matrixIncomeAggregate.toFixed(2)),
    };
  } catch (error) {
    console.error('❌ Error aggregating team income:', error);
    return { levelIncomeAggregate: 0, matrixIncomeAggregate: 0 };
  }
}

export async function getUserTeamStats(wallet_address: string) {
  try {

    const userStats = await prisma.user.findUnique({
      where: { wallet_address:wallet_address.toLowerCase() },
      select: {
        packages:true,
        directTeam: true,
        totalTema: true,
      },
    });



    if (!userStats) return null;

    return userStats;

  } catch (error) {
    console.error('Error fetching user team stats:', error);
    return null;
  }
}