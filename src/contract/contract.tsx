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


export const contractInstance = async (activeAccount: Account) => {
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
export const wbnbContractInstance = async (activeAccount: Account) => {
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

// ── Add this helper near your other contract instances ──
// (same file where wbnbContractInstance lives)
const PANCAKE_ROUTER_V2 = "0x10ED43C718714eb63d5aA57B78B54704E256024E";


const PANCAKE_ROUTER_ABI_EXTENDED = [
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
];


export const pancakeRouterContractInstance = async (activeAccount: Account) => {
    try {
        if (!activeAccount) {
            console.log('No active account found');
            return null;
        }

        const signerEthers = await ethers5Adapter.signer.toEthers({
            client: client,
            chain: MainnetChain,
            account: activeAccount,
        });

        const contractInst = new ethers.Contract(
            PANCAKE_ROUTER_V2,
            PANCAKE_ROUTER_ABI_EXTENDED,
            signerEthers
        );

        return contractInst;
    } catch {
        toast.error('Something went wrong in pancakeRouterContractInstance');
        return null;
    }
};


const ERC20_APPROVE_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)"
];

export const usdtContractInstance = async (activeAccount: Account) => {
    try {
        if (!activeAccount) {
            console.log('No active account found');
            return null;
        }

        const signerEthers = await ethers5Adapter.signer.toEthers({
            client: client,
            chain: MainnetChain,
            account: activeAccount,
        });

        const contractInst = new ethers.Contract(
            '0x55d398326f99059fF775485246999027B3197955',
            ERC20_APPROVE_ABI,
            signerEthers
        );

        return contractInst;
    } catch {
        toast.error('Something went wrong in usdtContractInstance');
        return null;
    }
};

