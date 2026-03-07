/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import z from 'zod';
import prisma from '@/lib/prisma'; // Adjust the import path as necessary
import { getUserByWalletAddress } from '@/helper/getUser';
import { User } from '@/generated/prisma/client';
export type SignInResponse = { success: boolean } | { error: string };
const addressSchema = z.string().min(1, 'Address cannot be empty');

async function isUserRegistered(
  userAddress: string
): Promise<boolean | undefined> {
  try {
    const isUserExist = await prisma.user.findFirst({
      where: {
        wallet_address: userAddress,
        isRegistered: true,
      },
    });

    if (isUserExist) {
      return true;
    }

    return false;
  } catch (error) {
    console.log('something went wrong in registerUser ', error);
  }
}
export async function verifyRegisteredUser(
  userAddress: string
): Promise<boolean> {
  try {
    const result = addressSchema.safeParse(userAddress);

    if (!result.success) {
      throw new Error(result.error.errors.map((e) => e.message).join(', '));
    }

    const isRegister = await isUserRegistered(userAddress);
    console.log('isRegister', isRegister);

    if (!isRegister) {
      return false;
    }

    return true;
  } catch (error) {
    console.log('something went wrong in verifyRegisteredUser', error);
    return false;
  }
}












 export interface VerifySponserRes {
  success: boolean;
  msg: string;
  newUser?:User;
  error?: any;
}

 export async function verifySponsor(
   sponser_address: string
 ): Promise<VerifySponserRes> {
   try {
     const user = await getUserByWalletAddress(sponser_address.toLowerCase());

     if (!user?.user) {
       return {
         success: false,
         msg: 'sponser not found!',
       };
     }

     return {
       success: true,
       msg: 'sponser found!',
       newUser: user.user,
     };
   } catch (error) {
    console.log('something went wrong in verifySponsor', error);
     return {
       success: false,
       msg: 'something went wrong , may be sponser not exist!',

     };
   }
 }