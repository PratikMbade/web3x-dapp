/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { ethers } from 'ethers'
import metaunityContractABI from './contract-abi.json'
import { metaunityAddress } from './contract'
import { packageBuy, setLevelIncome, setMatrixIncome } from '@/actions/metaunity-system'
import { PackageBuyResponse } from '@/types'



export async function waitForPackageBuyEvent(
    txHash: string,
    userAddress: string
): Promise<PackageBuyResponse[]> {
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_HTTPS);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt || !receipt.logs) {
        throw new Error('❌ No logs found in transaction receipt');
    }

    const responses: PackageBuyResponse[] = [];

    for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== metaunityAddress.toLowerCase()) continue;

        try {
            const parsed = iface.parseLog(log);

            if (parsed.name === 'PackageBuy') {
                const { _user, _package, _time, chainid } = parsed.args;

                // If userAddress is passed, ensure only their events are included
                if (_user.toLowerCase() !== userAddress.toLowerCase()) continue;

                const key = `${txHash}_${_user.toLowerCase()}`;
                const response = await packageBuy(
                    _user,
                    _package.toNumber(),
                    _time.toNumber(),
                    chainid.toNumber(),
                    key
                );

                console.log(`✅ PackageBuy parsed and stored for ${_user} with package ${_package}`);
                responses.push(response);
            }

        } catch (err) {
            console.warn(`❌ Could not parse log with this ABI: ${log.topics?.[0]}`, err);
        }
    }

    if (responses.length === 0) {
        console.log('❌ No matching PackageBuy events found in logs');

    }

    return responses;
}




const iface = new ethers.utils.Interface(metaunityContractABI);

export async function extractEventsFromReceipt(
    txHash: string,
    userAddress: string
): Promise<{
    levelIncomeResponse: any[];
    matrixIncomeResponse: any[];
}> {
    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_HTTPS);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt || !receipt.logs) {
        throw new Error('❌ No logs found in receipt');
    }

    const responses = {
        levelIncomeResponse: [] as any[],
        matrixIncomeResponse: [] as any[]
    };

    console.log(`📦 Transaction Receipt for ${txHash}`);
    console.log(receipt.logs);

    for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== metaunityAddress.toLowerCase()) {

            continue;
        }

        try {
            const parsed = iface.parseLog(log);
            console.log(`🪵 Parsed Event: ${parsed.name}`, parsed.args);


            if (parsed.name === 'Threeby3Transfer') {
  const { to, amount, timestamp, tochain, package: pkg } = parsed.args;
                console.log(`📦 Threeby3Transfer detected: ${to} sent ${amount} to ${tochain} at ${timestamp} package ${pkg}`);

                                const weiValue = amount.toString();

                       const wbnb = fromWeiToWbnb(weiValue);
                const actuallyAmount = await  wbnbToUsdt(wbnb);
                const key = `${txHash}_${userAddress.toLowerCase()}`;
                const result = await setMatrixIncome(
                    to,
                    actuallyAmount,
                    tochain.toNumber(),
                    timestamp.toNumber(),
                    pkg.toNumber(),
                    key,
                    false
                );


            }

            if (parsed.name === 'Threeby3TransferRecycle') {
  const { to, amount, timestamp, tochain, package: pkg } = parsed.args;

                console.log(`📦 Threeby3TransferRecycle detected: ${to} sent ${amount} to ${tochain} at ${timestamp} package ${pkg}`);


                                const weiValue = amount.toString();

                       const wbnb = fromWeiToWbnb(weiValue);
                const actuallyAmount = await  wbnbToUsdt(wbnb);
                const key = `${txHash}_${userAddress.toLowerCase()}`;
                  const result = await setMatrixIncome(
                    to,
                    actuallyAmount,
                    tochain.toNumber(),
                    timestamp.toNumber(),
                    pkg.toNumber(),
                    key,
                    true
                );
            }

        } catch (err) {
            console.warn(`❌ Could not parse log with this ABI: ${log.topics?.[0]}`, err);
        }
    }

    return responses;
}



const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_HTTPS);

// PancakeSwap V2 Router
const ROUTER_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E";  
const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
];

// Correct token addresses for BSC
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";  // Wrapped BNB
const USDT = "0x55d398326f99059fF775485246999027B3197955";  // Tether USD (BSC-Pegged)

export async function wbnbToUsdt(amount: string) {
  try {
    const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);

    // Parse amount (in wei, assuming amount = human readable string like "0.000000583294489125")
    const amountIn = ethers.utils.parseUnits(amount, 18);  

    const path = [WBNB, USDT];

    const amountsOut = await router.getAmountsOut(amountIn, path);

    // amountsOut[1] = expected USDT output (USDT has 18 decimals on BSC)
    const usdtOut = ethers.utils.formatUnits(amountsOut[1], 18);

    console.log(`${amount} WBNB ≈ ${usdtOut} USDT`);
    return usdtOut;
  } catch (error) {
    console.error("Error fetching WBNB to USDT:", error);
    throw error;
  }
}

// Alternative function with better error handling and validation
export async function wbnbToUsdtWithValidation(amount: string) {
  try {
    // Validate input
    if (!amount || isNaN(parseFloat(amount))) {
      throw new Error("Invalid amount provided");
    }

    const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);
    const amountIn = ethers.utils.parseUnits(amount, 18);  

    // Check if amount is greater than 0
    if (amountIn.isZero()) {
      throw new Error("Amount must be greater than 0");
    }

    const path = [WBNB, USDT];

    console.log(`Fetching price for ${amount} WBNB...`);
    console.log(`Path: WBNB (${WBNB}) -> USDT (${USDT})`);

    const amountsOut = await router.getAmountsOut(amountIn, path);
    const usdtOut = ethers.utils.formatUnits(amountsOut[1], 18);

    console.log(`${amount} WBNB ≈ ${usdtOut} USDT`);
    return {
      success: true,
      amountIn: amount,
      amountOut: usdtOut,
      path: ['WBNB', 'USDT']
    };
  } catch (error: any) {
    console.error("Error fetching WBNB to USDT:", error.message);
    
    // Handle specific error cases
    if (error.reason === "PancakeLibrary: INSUFFICIENT_LIQUIDITY") {
      console.error("Insufficient liquidity for this trading pair or amount");
    } else if (error.code === "CALL_EXCEPTION") {
      console.error("Smart contract call failed - check token addresses and network");
    }
    
    return {
      success: false,
      error: error.message,
      amountIn: amount
    };
  }
}


export function fromWeiToWbnb(value: string | number | bigint): string {
  // Convert to string with 18 decimals
  return ethers.utils.formatUnits(value.toString(), 18);
}
