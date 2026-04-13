import { client, MainnetChain } from "@/lib/client";
import { ethers } from "ethers";
import { redirect } from "next/navigation";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { Account } from "thirdweb/wallets";
import p2pContractABI from "./p2p-abi.json"

export const p2pContractAddress ='0xfcd977981E7486dA45F6927AAE8ea45250851696'


export const p2pContractInstance = async (activeAccount: Account) => {
    try {

        if (!activeAccount) {
            console.log('No active account found');
        }


        const signerEthers = await ethers5Adapter.signer.toEthers({
            client: client,
            chain: MainnetChain,
            account: activeAccount,
        });

        const p2pContractInst = new ethers.Contract(
            p2pContractAddress,
            p2pContractABI,
            signerEthers
        );


        return p2pContractInst;


    } catch (error) {
        console.log('something went wrong in p2p contract instance', error);
        redirect('/')
    }
}