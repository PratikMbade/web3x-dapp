import { redirect } from "next/navigation";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { Account } from "thirdweb/wallets";
import { client, MainnetChain } from '@/lib/client';
import { ethers } from "ethers";
import icoContractABI from './horse-token-contract-abi.json'
export const HorseTokenContractAddress = "0x6c8986fD92227765A8a54A85DC7E168Fb530FA38";

export const getHorsePrice = async (): Promise<number> => {
    try {
        const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
        const contract = new ethers.Contract(HorseTokenContractAddress, icoContractABI, provider);
        const price: ethers.BigNumber = await contract.horsePrice();
        return Number.parseFloat(ethers.utils.formatUnits(price, 18));
    } catch (error) {
        console.error('Failed to fetch horse price', error);
        return 0.1902;
    }
}


export const horseTokenContractInstance = async (activeAccount: Account) => {
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
            HorseTokenContractAddress,
            icoContractABI,
            signerEthers
        );


        return icoContractInst;


    } catch (error) {
        console.log('something went wrong in ico contract instance', error);
        redirect('/')
    }
}
