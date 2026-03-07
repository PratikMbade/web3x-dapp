import { redirect } from "next/navigation";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { Account } from "thirdweb/wallets";
import { client, MainnetChain } from '@/lib/client';
import { ethers } from "ethers";
import icoContractABI from './ico-contract-abi.json'
// export const icoContractAddress = "0x30D2b2F7fF50F700936117D6302F6044758b5D4d";
export const icoContractAddress ='0xa0F3a0128563a187499e335B7fB3E7f79c25CeC5'


export const icoContractInstance = async (activeAccount: Account) => {
    try {

        if (!activeAccount) {
            console.log('No active account found');
            redirect('/');
        }


        const signerEthers = await ethers5Adapter.signer.toEthers({
            client: client,
            chain: MainnetChain,
            account: activeAccount,
        });

        const icoContractInst = new ethers.Contract(
            icoContractAddress,
            icoContractABI,
            signerEthers
        );


        return icoContractInst;


    } catch (error) {
        console.log('something went wrong in ico contract instance', error);
        redirect('/')
    }
}