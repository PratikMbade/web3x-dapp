'use server';
import prisma from '@/lib/prisma'; // Adjust the import path as necessary
import { LevelIncomeTableType, MatrixIncomeTableType } from '@/types';


export async function getLevelIncomeTable(
  wallet_address: string
): Promise<LevelIncomeTableType[] | []> {
  try {
    console.log('called getLevelIncomeTable');

    const user = await prisma.user.findUnique({
      where: { wallet_address },
      include: {
        levelIncome: true,
        totalTeamTable: true,
      },
    });

    if (!user) return [];

    const levelIncomeTable = await prisma.levelIncome.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!levelIncomeTable || levelIncomeTable.length === 0) return [];

    /// map level income table to LevelIncomeTableType
    const levelIncomeData: LevelIncomeTableType[] = levelIncomeTable.map(
      (income) => ({
        level: income.level,
        fromAddress: income.fromUserWalletAddress,
        pacakgeNumber: income.packageNumber,
        amount: parseFloat(income.amount || '0'),
        createdAt: income.createdAt.toLocaleString(),
      })
    );

    return levelIncomeData;
  } catch (error) {
    console.error('❌ Failed to get level income table:', error);
    return [];
  }
}

export async function getMatrixIncomeTableForAdmin(
  wallet_address: string
): Promise<MatrixIncomeTableType[] | []> {
  try {
    console.log('matrix',wallet_address);
    const user = await prisma.user.findUnique({
      where: { wallet_address },
      include: {
        matrixIncome: true,
        totalTeamTable: true,
      },
    });

    if (!user) return [];


    const matrixIncomeTable = await prisma.matrixIncome.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    if (!matrixIncomeTable || matrixIncomeTable.length === 0) return [];

    /// map matrix income table to MatrixIncomeTableType
    const matrixIncomeData: MatrixIncomeTableType[] = matrixIncomeTable.map(
      (income) => ({
        fromAddress: income.fromUserWalletAddress,
        packageNumber: income.packageNumber,
        chainNumber: income.chainid,
        amount: parseFloat(income.amount || '0'),
        createdAt: income.createdAt.toLocaleString(),
      })
    );

    return matrixIncomeData;


  } catch (error) {
    console.error('❌ Failed to get matrix income table:', error);
    return [];
  }
}
