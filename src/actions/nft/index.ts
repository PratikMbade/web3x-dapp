/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import prisma from '@/lib/prisma'; // Adjust the import path as necessary
import { GetNFTSTypes, SetNFTBuyResponseTypes } from './types';
import { NFTClaimedHistory, UserNFTs } from '@/generated/prisma/client';

export const getUserNFTs = async (
  wallet_address: string
): Promise<GetNFTSTypes[] | undefined> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        wallet_address: wallet_address,
      },
      include: {
        currentNFTs: true,
      },
    });

    if (!user) {
      return;
    }

    return user.currentNFTs;
  } catch (error) {
    console.log('something went wrong in the getUserNFts action', error);
  }
};

export const setJustTokenNFTs = async (
  wallet_address: string,
  tokenType: number
): Promise<SetNFTBuyResponseTypes> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        wallet_address,
      },
      include: {
        currentNFTs: true,
      },
    });

    if (!user) {
      return { status: false, message: 'user not found' };
    }

    const isJustNFTBuy = user?.currentNFTs.find((nft) => nft.tokenType === 0);

    if (isJustNFTBuy) {
      return { status: false, message: 'user already have just tokne' };
    }

    const existingRoyaltyNFT = await prisma.royaltyNFTs.findFirst({
      where: { tokenType },
    });

    let royaltyNFTId;

    if (existingRoyaltyNFT) {
      royaltyNFTId = existingRoyaltyNFT.id;
    } else {
      const newRoyaltyNFT = await prisma.royaltyNFTs.create({
        data: {
          tokenId: 0,
          tokenType,
        },
      });
      royaltyNFTId = newRoyaltyNFT.id;
    }

    const createJustNFTToken = await prisma.userNFTs.create({
      data: {
        tokenType: 0,
        mintDate: new Date(),
        tokenId: 0,
        user: { connect: { id: user.id } },
        royaltNFTS: {
          connect: { id: royaltyNFTId },
        },
      },
    });

    return { status: true, message: 'Just NFT Minted' };
  } catch (error) {
    return { status: false, message: 'something went wrong', error: error };
  }
};

export const setNFTsToDB = async (
  wallet_address: string,
  tokenType: number,
  tokenId: number
): Promise<SetNFTBuyResponseTypes> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        wallet_address,
      },
      include: {
        currentNFTs: true,
      },
    });

    if (!user) {
      return { status: false, message: 'user not found' };
    }

    const isTokenIdExist = user.currentNFTs.find(
      (nft) => nft.tokenId === tokenId
    );

    if (isTokenIdExist) {
      return { status: false, message: `User already have ${tokenId}` };
    }

    const existingRoyaltyNFT = await prisma.royaltyNFTs.findFirst({
      where: { tokenType },
    });

    let royaltyNFTId;

    if (existingRoyaltyNFT) {
      royaltyNFTId = existingRoyaltyNFT.id;
    } else {
      const newRoyaltyNFT = await prisma.royaltyNFTs.create({
        data: {
          tokenId: tokenId,
          tokenType,
        },
      });
      royaltyNFTId = newRoyaltyNFT.id;
    }

    const createJustNFTToken = await prisma.userNFTs.create({
      data: {
        tokenType: tokenType,
        mintDate: new Date(),
        tokenId: tokenId,
        user: { connect: { id: user.id } },
        royaltNFTS: {
          connect: { id: royaltyNFTId },
        },
      },
    });

    return { status: true, message: 'Earth NFT mint successfully' };
  } catch (error) {
    return {
      status: false,
      message: 'something went wrong in the setEarthNFTS ',
      error: error,
    };
  }
};

export const setMergeNFTs = async (
  wallet_address: string,
  currenttokenType: number,
  tokenId1: number,
  tokenId2: number,
  tokenId3: number,
  newTokenId: number
): Promise<SetNFTBuyResponseTypes> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        wallet_address,
      },
      include: {
        currentNFTs: true,
      },
    });

    let newTokenType;

    if (currenttokenType === 5) {
      newTokenType = 5;
    } else {
      newTokenType = currenttokenType + 1;
    }

    if (!user) {
      return { status: false, message: 'user not found' };
    }

    const isNewTokendExist = user.currentNFTs.find(
      (nft) =>
        nft.tokenId === newTokenId && nft.tokenType === currenttokenType + 1
    );

    if (isNewTokendExist) {
      return { status: false, message: 'New token id already have it' };
    }

    const nfts = await prisma.userNFTs.findMany({
      where: {
        userId: user.id,
        tokenId: { in: [tokenId1, tokenId2, tokenId3] },
        tokenType: currenttokenType,
      },
    });

    if (nfts.length !== 3) {
      return { message: 'Invalid NFTs provided for merge', status: false };
    }

    const existingRoyaltyNFT = await prisma.royaltyNFTs.findFirst({
      where: { tokenType: newTokenId },
    });

    let royaltyNFTId;

    if (existingRoyaltyNFT) {
      royaltyNFTId = existingRoyaltyNFT.id;
    } else {
      const newRoyaltyNFT = await prisma.royaltyNFTs.create({
        data: {
          tokenId: newTokenId,
          tokenType: newTokenType,
        },
      });
      royaltyNFTId = newRoyaltyNFT.id;
    }

    const newNFT = await prisma.userNFTs.create({
      data: {
        user: { connect: { id: user.id } },
        tokenType: newTokenType,
        tokenId: newTokenId,
        mintDate: new Date(),
        royaltNFTS: {
          connect: { id: royaltyNFTId },
        },
      },
    });

    await prisma.userNFTs.deleteMany({
      where: {
        tokenType: currenttokenType,
        tokenId: { in: [tokenId1, tokenId2, tokenId3] },
        userId: user.id,
      },
    });

    return { status: true, message: ' NFT merge successfully' };
  } catch (error) {
    return {
      status: false,
      message: 'something went wrong in the setMergeNFTs ',
      error: error,
    };
  }
};

export const getUserNFTsByName = async (
  wallet_address: string,
  nftType: number
): Promise<UserNFTs[] | null> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        wallet_address: wallet_address,
      },
      include: {
        currentNFTs: true,
      },
    });

    if (!user) {
      return null;
    }

    const userNftTypeContainer = await prisma.userNFTs.findMany({
      where: {
        userId: user.id,
        tokenType: nftType,
      },
    });

    console.log('userNftTypeContainer ', userNftTypeContainer);

    if (!userNftTypeContainer) {
      return null;
    }

    if (userNftTypeContainer.length > 0) {
      return userNftTypeContainer;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const getUserAllNFTs = async (
  wallet_address: string
): Promise<UserNFTs[] | null> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        wallet_address: wallet_address,
      },
      include: {
        currentNFTs: true,
      },
    });

    if (!user) {
      return null;
    }

    //filter out the just token
    const userNftTypeContainer = await prisma.userNFTs.findMany({
      where: {
        userId: user.id,
        tokenType: { not: 0 },
      },
    });

    return userNftTypeContainer;
  } catch (error) {
        console.log('something went wrong in the getUserAllNFTs action', error);
    return null;
  }
};

export const storeUserNFTClaimedHistory = async (
  wallet_address: string,
  tokenId: number,
  tokenType: number,
  claimedAmount: string
) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        wallet_address: wallet_address,
      },
    });

    if (!user) {
      return;
    }

    const userNFTClaimedHistory = await prisma.nFTClaimedHistory.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        tokenId,
        tokenType,
        claimedAmount,
        claimedDate: new Date(),
      },
    });

    console.log('userNFTClaimedHistory ', userNFTClaimedHistory);

    return userNFTClaimedHistory;
  } catch (error) {
    console.log(
      'something went wrong in the storeUserNFTClaimedHistory action',
      error
    );
  }
};

export const getUserHighestNFT = async (
  wallet_address: string
): Promise<UserNFTs | null> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        wallet_address: wallet_address,
      },
      include: {
        currentNFTs: true,
      },
    });

    if (!user) {
      return null;
    }

    const userNftTypeContainer = await prisma.userNFTs.findFirst({
      where: {
        userId: user.id,
        tokenType: { not: 0 },
      },
      orderBy: {
        tokenType: 'desc',
      },
    });

    return userNftTypeContainer;
  } catch (error) {
    console.log('something went wrong in the getUserHighestNFT action', error);
    return null;
  }
};

export const getUserEachNFTCount = async (
  wallet_address: string
): Promise<number[]> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        wallet_address: wallet_address,
      },
      include: {
        currentNFTs: true,
      },
    });

    if (!user) {
      return [];
    }

    const userNftTypeContainer = await prisma.userNFTs.findMany({
      where: {
        userId: user.id,
        tokenType: { not: 0 },
      },
    });

    const nftTypeCount = [0, 0, 0, 0, 0, 0];

    //skip the just nft

    const nftData = userNftTypeContainer.filter((nft) => nft.tokenType !== 0);

    nftData.forEach((nft) => {
      nftTypeCount[nft.tokenType] = nftTypeCount[nft.tokenType] + 1;
    });

    return nftTypeCount;
  } catch (error) {
    return [];
  }
};

export const getUserNFTClaimedHistory = async (
  wallet_address: string
): Promise<NFTClaimedHistory[] | null> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        wallet_address: wallet_address,
      },
    });

    if (!user) {
      return null;
    }

    const userNFTClaimedHistory = await prisma.nFTClaimedHistory.findMany({
      where: {
        userId: user.id,
      },
    });

    if (userNFTClaimedHistory) {
      return userNFTClaimedHistory;
    }

    return null;
  } catch (error) {
    console.log('something went wrong in the getUserNFTClaimedHistory action', error);
    return null;
  }
};


export interface TransferResponse {
  status: boolean;
  message: string;
}
export const transferNFT = async (wallet_address:string,receiver_address: string,tokenType:string, tokenId: string):Promise<TransferResponse> => {
  try {

    const user = await prisma.user.findFirst({
      where: {
        wallet_address: wallet_address,
      },
      include: {
        currentNFTs: true,
      },
    });

    if (!user) {
      return { status: false, message: 'user not found' };
    }

    if(user.currentNFTs.length === 0){
      return { status: false, message: 'User dont have any NFT' };
    }

    //check receiver address
    const receiver = await prisma.user.findFirst({
      where: {
        wallet_address: receiver_address,
      },
    });

    if(!receiver){
      return { status: true, message: 'NFT Transfer but user not present in our ecosystem' };
    }

    const nft = await prisma.userNFTs.findFirst({
      where: {
        tokenId: parseInt(tokenId),
        tokenType: parseInt(tokenType),
        userId: user.id,
      },
    });

    if(!nft){
      return { status: false, message: 'NFT not found' };
    }


    const updateNFT = await prisma.userNFTs.update({
      where:{
        id:nft.id
      },
      data:{
        user:{
          connect:{
            id:receiver.id
          }
        }
      }
    })

    console.log('updateNFT ',updateNFT);



    return { status: true, message: 'NFT Transfered' };



  } catch (error) {
    console.log('something went wrong in the transferNFT action', error);
    return { status: false, message: 'something went wrong' };
  }
}

export const getJustNFTsCount = async ():Promise<number> => {
  try {
    const justNFTs = await prisma.userNFTs.findMany({
      where:{
        tokenType:0
      }
    });

    return justNFTs.length;
  } catch (error) {
    console.log('something went wrong in the getJustNFTsCount action', error);
    return 0;
  }
}

export const getEarthNFTsCount = async ():Promise<number> => {
  try {
    const earthNFTs = await prisma.userNFTs.findMany({
      where:{
        tokenType:1
      }
    });

    return earthNFTs.length;
  } catch (error) {
    console.log('something went wrong in the getEarthNFTsCount action', error);
    return 0;
  }
}