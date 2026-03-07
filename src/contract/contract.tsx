import { redirect } from 'next/navigation';
import { Account } from 'thirdweb/wallets';
import { ethers5Adapter } from 'thirdweb/adapters/ethers5';
import { client, MainnetChain } from '@/lib/client';
import { ethers } from 'ethers';
import metaunityContractABI from './contract-abi.json'
import wbnbABI from './wbnb-abi.json';
import { toast } from 'sonner';

// 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c main wbnb

// export const metaunityAddress = '0x54a5eBc49f77e312ebB1a92B2068590d136acfb2';
export const metaunityAddress = '0x6eb46374b8EF7B538D17866AA7E82fcCbDa75945';
export const wbnbAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

export const metaunityContractABIExport = metaunityContractABI


export const contractInstance =  async (activeAccount:Account) => {
    try {

        if(!activeAccount) {
            console.log('No active account found');
            redirect('/');
        }


        const signerEthers = await ethers5Adapter.signer.toEthers({
          client: client,
            chain: MainnetChain,
          account: activeAccount,
        });

        const constractInst = new ethers.Contract(
          metaunityAddress,
          metaunityContractABI,
          signerEthers
        );


        return constractInst;


    } catch (error) {
        console.log('something went wrong in contractInstance', error);
        redirect('/')
    }
}
export const wbnbContractInstance = async (activeAccount:Account) => {
    try {

        if(!activeAccount) {
            console.log('No active account found');
            redirect('/');
        }

        const signerEthers = await ethers5Adapter.signer.toEthers({
            client: client,
            chain: MainnetChain,
            account: activeAccount,
        });

        const constractInst = new ethers.Contract(
          wbnbAddress,
          wbnbABI,
          signerEthers
        );

        return constractInst;


    } catch {
        toast.error('Something went wrong in usdtContractInstance');
        return null
    }
}