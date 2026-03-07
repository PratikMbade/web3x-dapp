/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function shortenAddress(
  address: string,
  startChars: number = 8,
  endChars: number = 6
): string {
  if (!address) {
    return '';
  }
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}


import { ethers } from "ethers";

const BSC_RPC = process.env.ALCHEMY_HTTP || "https://bsc-dataseed.binance.org";
const provider = new ethers.providers.JsonRpcProvider(BSC_RPC);

// PancakeSwap V2 Router
const ROUTER_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
];

// Correct token addresses for BSC
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const USDT = "0x55d398326f99059fF775485246999027B3197955";

// Minimal ERC20 ABI to fetch decimals
const ERC20_ABI = ["function decimals() view returns (uint8)"];

/**
 * Helper: get decimals for a token (cached per runtime)
 */
const decimalsCache: Record<string, number> = {};
async function getTokenDecimals(tokenAddress: string): Promise<number> {
  const key = tokenAddress.toLowerCase();
  if (decimalsCache[key] !== undefined) return decimalsCache[key];

  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const d: number = await token.decimals();
  decimalsCache[key] = d;
  return d;
}

/**
 * Estimate WBNB received for a given USDT amount (string human-readable).
 * Returns numeric string of WBNB (formatted using WBNB decimals).
 */
export async function usdtToWbnb(amountUsdt: string): Promise<string> {
  const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);

  // get decimals dynamically (USDT on BSC commonly 18, but safer to read)
  const usdtDecimals = await getTokenDecimals(USDT);
  const wbnbDecimals = await getTokenDecimals(WBNB);

  const amountIn = ethers.utils.parseUnits(amountUsdt, usdtDecimals);

  const path = [USDT, WBNB];

  const amountsOut = await router.getAmountsOut(amountIn, path);
  const wbnbOut = ethers.utils.formatUnits(amountsOut[1], wbnbDecimals);

  console.log(`${amountUsdt} USDT ≈ ${wbnbOut} WBNB`);
  return wbnbOut;
}

/**
 * Same but with validation, helpful error messages and structured return.
 */
export async function usdtToWbnbWithValidation(amountUsdt: string) {
  try {
    if (!amountUsdt || isNaN(parseFloat(amountUsdt))) {
      throw new Error("Invalid amount provided");
    }

    const usdtDecimals = await getTokenDecimals(USDT);
    const wbnbDecimals = await getTokenDecimals(WBNB);

    const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, provider);
    const amountIn = ethers.utils.parseUnits(amountUsdt, usdtDecimals);

    if (amountIn.isZero()) {
      throw new Error("Amount must be greater than 0");
    }

    const path = [USDT, WBNB];

    console.log(`Fetching price for ${amountUsdt} USDT...`);
    console.log(`Path: USDT (${USDT}) -> WBNB (${WBNB})`);

    const amountsOut = await router.getAmountsOut(amountIn, path);
    const wbnbOut = ethers.utils.formatUnits(amountsOut[1], wbnbDecimals);

    console.log(`${amountUsdt} USDT ≈ ${wbnbOut} WBNB`);
    return {
      success: true,
      amountIn: amountUsdt,
      amountOut: wbnbOut,
      path: ['USDT', 'WBNB'],
      raw: {
        amountsOut
      }
    };
  } catch (error: any) {
    console.error("Error fetching USDT -> WBNB:", error.message || error);

    // specific common cases
    if (error.reason === "PancakeLibrary: INSUFFICIENT_LIQUIDITY") {
      console.error("Insufficient liquidity for this trading pair or amount");
    } else if (error.code === "CALL_EXCEPTION") {
      console.error("Smart contract call failed - check token addresses and network");
    }

    return {
      success: false,
      error: (error && error.message) || String(error),
      amountIn: amountUsdt
    };
  }
}

/**
 * Keep your existing helper
 */
export function fromWeiToWbnb(value: string | number | bigint): string {
  return ethers.utils.formatUnits(value.toString(), 18);
}
