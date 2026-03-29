import { Account } from 'thirdweb/wallets'
import ENERGY_TOKEN_ABI from './abi.json'
import { ethers5Adapter } from 'thirdweb/adapters/ethers5';
import { client, MainnetChain } from '@/lib/client';
import { ethers } from 'ethers';


export const  ENERGY_TOKEN_ADDRESS = "0x9eC40A3f1a91ad370d666d58EB557E0B2C60E591"

export async function energyTokenContractInstance (activeAccount: Account){
    try {
            const signerEthers = await ethers5Adapter.signer.toEthers({
            client: client,
            chain: MainnetChain,
            account: activeAccount,
        });

        const constractInst = new ethers.Contract(
            ENERGY_TOKEN_ADDRESS,
            ENERGY_TOKEN_ABI,
            signerEthers
        );


        return constractInst;


    } catch (error) {
        
    }
}