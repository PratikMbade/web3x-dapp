// nftContract.ts
'use client';

import nft_abi from '@/contract/royaltynfts/nft-contract-abi.json';

import { ethers5Adapter } from 'thirdweb/adapters/ethers5';
import { chainId, client } from '@/lib/client';
import { ethers } from 'ethers';
import { redirect } from 'next/navigation';
import { Account } from 'thirdweb/wallets';


export const nft_contract_abi = nft_abi;
// export const nft_contract_address = '0x59dc9cA2F50C8b0D0557694ECeaEE838adbf7F41';
// export const nft_contract_address = '0x3a2172004eDBEEe0B278d1EB5A6BADB1d070Fcba';
export const nft_contract_address = '0xa95cd15C98b288d97978B9D1c011a006c4e2Ae21';


export const getNftContractInstance = async (
  activeAccount: Account
) => {
  try {
    


    const signer = await ethers5Adapter.signer.toEthers({
      client,
      chain: chainId,
      account: activeAccount,
    });




    const nftContractInstance = new ethers.Contract(
      nft_contract_address,
      nft_contract_abi,
      signer
    ) 




    return nftContractInstance!
  } catch (error) {
    console.error('Failed to initialize the contract instance:', error);
    redirect('/')

  }
};
