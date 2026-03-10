/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
'use server'
import { ethers } from "ethers";
import MetaUnityCoreABI from '@/contract/contract-abi.json'
import prisma from "@/lib/prisma";
import { metaunityAddress } from "@/contract/contract";
import axios from 'axios'


export interface MatrixNode {
    chainId: number;
    amount: string;
    wallet_address:string;
    packageNumber:number;
}

interface ContractDataParams {
    userAddress: string;
    chainId:number;
    packageNumber:number;
}
async function rpcCall(rpcUrl: string, method: string, params: any[]) {
  const response = await axios.post(rpcUrl, {
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 1000),
    method,
    params,
  }, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.data.error) throw new Error(response.data.error.message);
  return response.data.result;
}

export async function getContractDataForMatrixTree(params: ContractDataParams) {
  try {
    const rpcUrl = process.env.ALCHEMY_HTTPS!;
    const iface = new ethers.utils.Interface(MetaUnityCoreABI);

    // helper to call contract read functions via raw RPC
    async function contractCall(fnName: string, args: any[]) {
      const data = iface.encodeFunctionData(fnName, args);
      const result = await rpcCall(rpcUrl, 'eth_call', [
        { to: metaunityAddress, data },
        'latest',
      ]);
      return iface.decodeFunctionResult(fnName, result);
    }

    // get user ID
    const userIdRes = await contractCall('UserIds', [params.userAddress]);
    const userIds = ethers.BigNumber.from(userIdRes[0]).toNumber();
    console.log('User ID in contract:', userIds);

    // get initial parent
    const userDetails = await contractCall('Walletdetails', [params.packageNumber, userIds, 1]);
    const initialParentId = ethers.BigNumber.from(userDetails.upline).toNumber();
    console.log('initalParentId:', initialParentId);

    let idToSearch = initialParentId;
    let walletDetails: any;
    let chainToSearch = 1;

    for (let i = 0; i < 10; i++) {
      walletDetails = await contractCall('Walletdetails', [params.packageNumber, idToSearch, chainToSearch]);

      if (walletDetails.user === '0x0000000000000000000000000000000000000000') {
        chainToSearch++;
        console.log('Changed chain ID to:', chainToSearch);
      } else {
        break;
      }
    }

    console.log('result', {
      user: walletDetails.user,
      upline: ethers.BigNumber.from(walletDetails.upline).toNumber(),
      left: ethers.BigNumber.from(walletDetails.left).toNumber(),
      middle: ethers.BigNumber.from(walletDetails.middle).toNumber(),
      right: ethers.BigNumber.from(walletDetails.right).toNumber(),
      leftadd: walletDetails.leftadd,
      middleadd: walletDetails.middleadd,
      rightadd: walletDetails.rightadd,
    });

    let position = '';
    const userAddrLower = params.userAddress.toLowerCase();
    if (walletDetails.leftadd.toLowerCase() === userAddrLower) position = 'left';
    else if (walletDetails.middleadd.toLowerCase() === userAddrLower) position = 'middle';
    else if (walletDetails.rightadd.toLowerCase() === userAddrLower) position = 'right';

    return {
      position,
      upline_address: walletDetails.user,
      chainId: chainToSearch,
    };

  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function createMatrixTree(data:MatrixNode): Promise<{success: boolean}> {
    try {

       

        // now call getContractDataFromMatrix
        const contractData = await getContractDataForMatrixTree(
        {
              userAddress: data.wallet_address,
              chainId: data.chainId,
              packageNumber: data.packageNumber
        }
        );

        if(!contractData) {
            console.log('contract data not found');
            return { success: false };
        }
        console.log('contract data found:', contractData);

         //find user
        const user = await prisma.user.findUnique({
            where: {
                wallet_address: contractData?.upline_address.toLowerCase(),
            },
        });
        if (!user) {
            console.log('user not found');
            return { success: false };
        }
        const matrixTree = await prisma.matrixTree.create({
            data: {
                chainId: data.chainId,
                amount: data.amount,
                position: contractData.position,
                wallet_address: data.wallet_address.toLowerCase(),
                upline_address: contractData?.upline_address!.toLowerCase(),
                userId: user.id,
                packageNumber:data.packageNumber
            },
        });

        if(matrixTree) {
            console.log('🚀 Matrix tree created successfully',matrixTree);
            return { success: true };
        }

        return { success: false };

    } catch (error) {
        console.error(error);
        return { success: false };
    }
}


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