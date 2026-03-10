'use server';

import prisma from '@/lib/prisma'; // Adjust the import path as necessary
import { getPackageAmountByPackageId, getPackageNumberByLevelAmount } from '@/helper';
import { createMatrixTree } from '../matrix/matrix-tree';






export async function getMatrixTreeByAddress(wallet_address:string,chainId:number) {
    try {

        /// first we have to find wallet_address in the database and then we have to find all the downlines of that wallet_address
        const matrixTrees = await prisma.matrixTree.findMany({
            where: {
                upline_address: wallet_address,
                chainId:chainId
            },
        });

        // if matrixTrees is found now we have to fetch his dowline tree
        if(matrixTrees && matrixTrees.length > 0) {
                  const downlineTrees = await prisma.matrixTree.findMany({
            where: {
                upline_address: {
                    in: matrixTrees.map(tree => tree.wallet_address)
                },
                chainId: chainId
            },
        });
        return {matrixTrees, downlineTrees};
        }


        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
                }


export async function isPackageBuyStored(tranxHash:string,wallet_address:string){
    try {
        const tranxUnique = `${tranxHash}_${wallet_address.toLowerCase()}`

        const tranx = await prisma.package.findUnique({
            where:{
                packageBuyTranxHash:tranxUnique
            }
        })

        if(tranx){
            return true
        }

        return false

    } catch {
        return false
    }

}


export async function packageBuy(
  user: string,
  packageId: number,
  time: number,
  chainid: number,
  tranxHash: string
) {
  try {

  console.log('called package buy', user, packageId, time, chainid, tranxHash);

    //check event is present or not

    const tranxUnique = `${tranxHash}_${user.toLowerCase()}`
    const tranxExists = await prisma.package.findUnique({
      where: {
        packageBuyTranxHash: tranxUnique,
      },
    });

    if(tranxExists){
        return {
            success:true,
            message:'Package buy successfully',
            statusCode:201,
        }
    }


    //check if user exists
    const userExists = await prisma.user.findUnique({
      where: {
        wallet_address: user.toLowerCase(),
      },
    });

    if (!userExists) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }

    const createdAt = new Date(time * 1000);
    const createBuy = await prisma.package.create({
      data: {
        userId: userExists.id,
        chainid: chainid,
        amount: getPackageAmountByPackageId(packageId),
        packageNumber: packageId,
        createdAt: createdAt,
        packageBuyTranxHash: tranxHash,
      },
    });

    if (createBuy) {
      console.log('🚀 Package bought successfully');
      return {
        success: true,
        message: 'Package bought successfully',
        statusCode: 200,
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
      statusCode: 500,
    };
  } catch  {
    return {
      success: false,
      message: 'Something went wrong',
      statusCode: 500,
    };
  }
}




export async function setMatrixIncome(
  toUserWalletAddress: string,
  amountInEther: string,
  chainId: number,
  time: number,
  packageNumber:number,
  tranxHash: string,
  isRecycle:boolean
) {
  try {
    // find from user by tranx hash in package table
    const fromUser = await prisma.package.findUnique({
      where: {
        packageBuyTranxHash: tranxHash,
      },
      include: {
        user: true,
      },
    });

    if (!fromUser) {
      return {
        success: false,
        message: 'Package with this transaction hash not found',
      };
    }

    const toUserExists = await prisma.user.findUnique({
      where: {
        wallet_address: toUserWalletAddress.toLowerCase(),
      },
    });

    if (!toUserExists) {
      return {
        success: false,
        message: 'To user not found',
      };
    }

    const createMatrixIncome = await prisma.matrixIncome.create({
      data: {
        fromUserWalletAddress: fromUser.user.wallet_address.toLowerCase(),
        toUserWalletAddress: toUserWalletAddress.toLowerCase(),
        userId: toUserExists.id,
        amount: amountInEther,
        chainid: chainId,
        createdAt: new Date(time * 1000),
        packageNumber: packageNumber,
      },
    });

    if (createMatrixIncome ) {
      console.log('♻️ Matrix income created successfully', createMatrixIncome);
      // go to the tree
      // make sure this not recycle true . if its true then don't create tree
      if(!isRecycle){

        //let's do api call for create matrix tree

  const payload = {
    wallet_address: fromUser.user.wallet_address.toLowerCase(),
    chainId: chainId,
    amount: parseFloat(amountInEther),
    packageNumber: packageNumber
  };
  
   const response = createMatrixTree(
      {
            chainId: payload.chainId,
    amount: String(payload.amount),
    wallet_address:payload.wallet_address.toLowerCase(),
    packageNumber:payload.packageNumber,
      }
    )


    if((await response).success){
   return {
        success: true,
        message: 'Matrix income created successfully',
      };
    }

 

   
    }
  }
  } catch (error) {
    console.log('error', error);
    return {
      success: false,
      message: 'Something went wrong',
    };
  }
}