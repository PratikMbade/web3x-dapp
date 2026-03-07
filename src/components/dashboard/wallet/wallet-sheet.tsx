/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, ArrowUpDown, RefreshCw } from "lucide-react";
import Image from "next/image";
import { HorseTokenDetail } from "./horse-token-details";
import { ethers } from "ethers";
import { useActiveWallet, useDisconnect } from "thirdweb/react";
import WalletDisconnect from "@/components/web3-wallet/wallet-disconnect";


interface TokenBalance {
    symbol: string;
    name: string;
    balance: string;
    usdValue: string;
    icon: string;
    available?: boolean;
    isHorseToken?: boolean;
}

interface ClaimHistory {
    type: "ico" | "gift";
    amount: string;
    date: string;
    txHash?: string;
    usdValue: string;
}

interface WalletSheetProps {
    walletAddress: string;
    totalBalance: string;
    innerBalances: TokenBalance[];
    walletBalances: TokenBalance[];
    onDisconnect?: () => void;
    onIcoVestingClaim?: () => void;
    onGiftVestingClaim?: () => void;
    icoClaimHistory?: ClaimHistory[];
    giftClaimHistory?: ClaimHistory[];
    icoVestingAvailable?: string;
    giftVestingAvailable?: string;
    rpcUrl?: string; // Add RPC URL prop
}

// ERC20 ABI for balanceOf and symbol
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

// Token addresses on BSC Mainnet
const TOKEN_ADDRESSES = {
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    // BNB is native token, no contract address needed
};

export function WalletSheet({
    walletAddress,
    totalBalance,
    innerBalances,
    walletBalances,
    onDisconnect,
    rpcUrl = "https://bsc-dataseed1.binance.org/", // Default BSC RPC
}: WalletSheetProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [showHorseTokenDetail, setShowHorseTokenDetail] = useState(false);
    const [selectedHorseToken, setSelectedHorseToken] = useState<TokenBalance | null>(null);
    const [fetchedWalletBalances, setFetchedWalletBalances] = useState<TokenBalance[]>([]);
    const [isLoadingBalances, setIsLoadingBalances] = useState(false);
    const [calculatedTotalBalance, setCalculatedTotalBalance] = useState("0.00");


    const handleCopyAddress = () => {
        navigator.clipboard.writeText(walletAddress);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleTokenClick = (token: TokenBalance) => {
        if (token.isHorseToken) {
            setSelectedHorseToken(token);
            setShowHorseTokenDetail(true);
        }
    };

    const handleBackToWallet = () => {
        setShowHorseTokenDetail(false);
        setSelectedHorseToken(null);
    };

    // Fetch token prices from CoinGecko or similar API
    const fetchTokenPrices = async () => {
        try {
            const response = await fetch(
                'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,tether,wbnb&vs_currencies=usd'
            );
            const data = await response.json();
            return {
                BNB: data.binancecoin?.usd || 0,
                USDT: data.tether?.usd || 0,
                WBNB: data.wbnb?.usd || data.binancecoin?.usd || 0,
            };
        } catch (error) {
            console.error("Error fetching token prices:", error);
            return { BNB: 0, USDT: 0, WBNB: 0 };
        }
    };

    const fetchBalances = async () => {
        if (!walletAddress || !ethers.utils.isAddress(walletAddress)) {
            console.error("Invalid wallet address");
            return;
        }

        setIsLoadingBalances(true);
        try {
            const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
            const prices = await fetchTokenPrices();
            const balances: TokenBalance[] = [];
            let total = 0;

            // Fetch BNB balance (native token)
            const bnbBalance = await provider.getBalance(walletAddress);
            const bnbFormatted = ethers.utils.formatUnits(bnbBalance);
            const bnbValue = parseFloat(bnbFormatted) * prices.BNB;
            total += bnbValue;

            balances.push({
                symbol: "BNB",
                name: "Binance Coin",
                balance: parseFloat(bnbFormatted).toFixed(4),
                usdValue: `$${bnbValue.toFixed(2)}`,
                icon: "🟡",
            });

            // Fetch WBNB balance
            const wbnbContract = new ethers.Contract(
                TOKEN_ADDRESSES.WBNB,
                ERC20_ABI,
                provider
            );
            const wbnbBalance = await wbnbContract.balanceOf(walletAddress);
            const wbnbDecimals = await wbnbContract.decimals();
            const wbnbSymbol = await wbnbContract.symbol();
            const wbnbFormatted = ethers.utils.formatUnits(wbnbBalance, wbnbDecimals);
            const wbnbValue = parseFloat(wbnbFormatted) * prices.WBNB;
            total += wbnbValue;

            balances.push({
                symbol: wbnbSymbol,
                name: "Wrapped BNB",
                balance: parseFloat(wbnbFormatted).toFixed(4),
                usdValue: `$${wbnbValue.toFixed(2)}`,
                icon: "🟠",
            });

            // Fetch USDT balance
            const usdtContract = new ethers.Contract(
                TOKEN_ADDRESSES.USDT,
                ERC20_ABI,
                provider
            );
            const usdtBalance = await usdtContract.balanceOf(walletAddress);
            const usdtDecimals = await usdtContract.decimals();
            const usdtSymbol = await usdtContract.symbol();
            const usdtFormatted = ethers.utils.formatUnits(usdtBalance, usdtDecimals);
            const usdtValue = parseFloat(usdtFormatted) * prices.USDT;
            total += usdtValue;

            balances.push({
                symbol: usdtSymbol,
                name: "Tether USD",
                balance: parseFloat(usdtFormatted).toFixed(4),
                usdValue: `$${usdtValue.toFixed(2)}`,
                icon: "💵",
            });

            setFetchedWalletBalances(balances);
            setCalculatedTotalBalance(total.toFixed(2));
        } catch (error) {
            console.error("Error fetching balances:", error);
        } finally {
            setIsLoadingBalances(false);
        }
    };


    // Fetch balances on mount and when wallet address changes
    useEffect(() => {
        if (walletAddress) {
            fetchBalances();
        }
    }, [walletAddress]);


    // Use fetched balances if available, otherwise fall back to provided walletBalances
    const displayWalletBalances = fetchedWalletBalances.length > 0 
        ? fetchedWalletBalances 
        : walletBalances;

    // Use calculated total if available, otherwise fall back to provided totalBalance
    const displayTotalBalance = fetchedWalletBalances.length > 0 
        ? calculatedTotalBalance 
        : totalBalance;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Wallet className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-zinc-950 border-zinc-800 text-white overflow-y-auto p-2">
                {!showHorseTokenDetail ? (
                    <>
                        <SheetHeader className="space-y-4">
                            <div className="flex items-center justify-between">
                                <SheetTitle className="text-white text-lg">Wallet</SheetTitle>
                                <div className="flex items-center gap-2 mt-5">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-zinc-800"
                                        onClick={fetchBalances}
                                        disabled={isLoadingBalances}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isLoadingBalances ? 'animate-spin' : ''}`} />
                                    </Button>
                                    <WalletDisconnect/>
                                    <SheetClose asChild></SheetClose>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span>{formatAddress(walletAddress)}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 p-0 hover:bg-zinc-800"
                                    onClick={handleCopyAddress}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                                {isCopied && <span className="text-xs text-green-500">Copied!</span>}
                            </div>

                            <div className="py-6">
                                <p className="text-sm text-zinc-400 mb-2">Total Balance</p>
                                <div className="flex gap-x-6 items-center justify-center">
                                    <div className="my-auto">
                                        <h2 className="text-5xl font-bold">
                                            ${displayTotalBalance}
                                            {isLoadingBalances && (
                                                <span className="text-sm text-zinc-500 ml-2">Loading...</span>
                                            )}
                                        </h2>
                                    </div>
                                    {/* <div className="grid grid-cols-4 gap-4">
                                        <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-zinc-900 transition-colors">
                                            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
                                                <ArrowUpDown className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs text-zinc-400">Transfer</span>
                                        </button>
                                    </div> */}
                                </div>
                            </div>
                        </SheetHeader>

                        <SheetDescription className="sr-only">
                            View your wallet balance and manage your tokens
                        </SheetDescription>

                        {/* Inner Balance Section */}
                        <div className="space-y-3">
                            <div className="bg-gradient-to-r from-amber-900/30 to-amber-700/30 rounded-lg px-4 py-2">
                                <h3 className="text-sm font-medium text-amber-500">INNER BALANCE</h3>
                            </div>

                            <div className="space-y-2">
                                {innerBalances.map((token, index) => (
                                    <div
                                        key={`inner-${index}`}
                                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                            token.isHorseToken
                                                ? "hover:bg-amber-900/20 cursor-pointer border border-amber-700/30"
                                                : "hover:bg-zinc-900"
                                        }`}
                                        onClick={() => handleTokenClick(token)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full flex items-center justify-center">
                                                <Image
                                                    src={`/horse-token-img.png`}
                                                    alt={"horse-token"}
                                                    width={40}
                                                    height={40}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium">{token.symbol}</p>
                                                <p className="text-xs text-zinc-400">{token.name}</p>
                                                {token.available && (
                                                    <p className="text-xs text-zinc-500 mt-0.5">
                                                        available for withdrawal
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            click to see details
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Wallet Balance Section */}
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between px-4 py-2">
                                <h3 className="text-sm font-medium text-zinc-400">WALLET BALANCE</h3>
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <span>{formatAddress(walletAddress)}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 p-0 hover:bg-zinc-800"
                                        onClick={handleCopyAddress}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {isLoadingBalances ? (
                                    <div className="text-center py-8 text-zinc-500">
                                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        <p className="text-sm">Loading balances...</p>
                                    </div>
                                ) : (
                                    displayWalletBalances.map((token, index) => (
                                        <div
                                            key={`wallet-${index}`}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-900 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                                    <span className="text-lg">{token.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{token.symbol}</p>
                                                    <p className="text-xs text-zinc-400">{token.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{token.balance}</p>
                                                <p className="text-xs text-zinc-400">{token.usdValue}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <HorseTokenDetail
                        onBack={handleBackToWallet}

                    />
                )}
            </SheetContent>
        </Sheet>
    );
}