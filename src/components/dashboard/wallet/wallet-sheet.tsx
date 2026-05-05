/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Wallet,
    Copy,
    RefreshCw,
    ArrowLeft,
    CheckCircle2,
    X,
    ArrowUpDown,
    AlertCircle,
    ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { HorseTokenDetail } from "./horse-token-details";
import { ethers } from "ethers";
import WalletConnect from "@/components/web3-wallet/wallet-connect";
import {
    pancakeRouterContractInstance,
    usdtContractInstance,
    wbnbContractInstance,
} from "@/contract/contract";
import { energyTokenContractInstance } from "@/contract/energy-token-contract/energy-token-contract";
import { horseTokenContractInstance, HorseTokenContractAddress } from "@/contract/horse-token-contract/contract-instance";
import { useActiveAccount } from "thirdweb/react";

// ─── Types ───────────────────────────────────────────────────────────────────

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
    rpcUrl?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
];

const TOKEN_ADDRESSES = {
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    USDT: "0x55d398326f99059fF775485246999027B3197955",
};

const PANCAKE_ROUTER_V2 = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

const PANCAKE_ROUTER_ABI_EXTENDED = [
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
];

const WBNB_EXTENDED_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function withdraw(uint wad) external",
    "function deposit() external payable",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
];

const ERC20_APPROVE_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
];

const SLIPPAGE_BPS = 100; // 1%

// ─── Token metadata ───────────────────────────────────────────────────────────

const TOKEN_META: Record<string, { label: string; name: string; img: string; decimals: number }> = {
    BNB: {
        label: "BNB",
        name: "BNB",
        img: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
        decimals: 18,
    },
    WBNB: {
        label: "WBNB",
        name: "Wrapped BNB",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPVQl3k2_pnTREpCeAXPyB5wxktuUPXjmBoQ&s",
        decimals: 18,
    },
    USDT: {
        label: "USDT",
        name: "Tether USD",
        img: "https://upload.wikimedia.org/wikipedia/commons/0/01/USDT_Logo.png",
        decimals: 18,
    },
};

// Swap pair definition
type SwapDirection = {
    from: keyof typeof TOKEN_META;
    to: keyof typeof TOKEN_META;
};

const ALL_PAIRS: SwapDirection[] = [
    { from: "USDT", to: "BNB" },
    { from: "BNB", to: "USDT" },
    { from: "WBNB", to: "BNB" },
    { from: "BNB", to: "WBNB" },
];

type ActiveTab = "portfolio" | "swap";
type SwapMode = "free" | "hrs_usdt"; // free = BNB/USDT/WBNB picker, hrs_usdt = HRS→USDT via horse contract

// Tab config for the two swap modes
const SWAP_TABS: { id: SwapMode; label: string }[] = [
    { id: "free",     label: "Swap" },
    { id: "hrs_usdt", label: "HRS → USDT" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function friendlyError(err: unknown): string {
    if (!(err instanceof Error)) return "Swap failed. Please try again.";
    const m = err.message;
    if (m.includes("user rejected") || m.includes("ACTION_REJECTED") || m.includes("User denied"))
        return "Transaction rejected by wallet.";
    if (m.includes("INSUFFICIENT_OUTPUT_AMOUNT"))
        return "Price moved too fast. Try again or increase slippage.";
    if (m.includes("INSUFFICIENT_LIQUIDITY") || m.includes("LIQUIDITY"))
        return "Insufficient liquidity for this pair.";
    if (m.includes("insufficient funds") || m.includes("insufficient balance"))
        return "Not enough BNB to cover gas fees.";
    if (m.includes("execution reverted"))
        return "Transaction reverted on-chain. Check your balance and try again.";
    if (m.includes("nonce"))
        return "Nonce error. Please reset your wallet pending transactions.";
    if (m.includes("network") || m.includes("timeout"))
        return "Network error. Check your connection and retry.";
    return m.slice(0, 100);
}

// ─── TokenImage component ─────────────────────────────────────────────────────

function TokenImg({ symbol, size = 28 }: { symbol: string; size?: number }) {
    const meta = TOKEN_META[symbol];
    if (!meta) return <span className="text-base">●</span>;
    return (
        <img
            src={meta.img}
            alt={symbol}
            width={size}
            height={size}
            style={{ borderRadius: "50%", objectFit: "cover", width: size, height: size }}
            onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
            }}
        />
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WalletSheet({
    walletAddress,
    totalBalance,
    innerBalances,
    walletBalances,
    onDisconnect,
    rpcUrl = "https://bsc-dataseed1.binance.org/",
}: WalletSheetProps) {
    const activeAccount = useActiveAccount();

    const [isCopied, setIsCopied] = useState(false);
    const [showHorseTokenDetail, setShowHorseTokenDetail] = useState(false);
    const [selectedHorseToken, setSelectedHorseToken] = useState<TokenBalance | null>(null);
    const [fetchedWalletBalances, setFetchedWalletBalances] = useState<TokenBalance[]>([]);
    const [isLoadingBalances, setIsLoadingBalances] = useState(false);
    const [calculatedTotalBalance, setCalculatedTotalBalance] = useState("0.00");
    const [activeTab, setActiveTab] = useState<ActiveTab>("portfolio");

    // Swap state
    const [swapDir, setSwapDir] = useState<SwapDirection>(ALL_PAIRS[0]);
    const [swapAmount, setSwapAmount] = useState("");
    const [swapEstimate, setSwapEstimate] = useState("");
    const [isSwapping, setIsSwapping] = useState(false);
    const [swapSuccess, setSwapSuccess] = useState(false);
    const [swapError, setSwapError] = useState("");
    const [swapStep, setSwapStep] = useState<string>(""); // step feedback during swap
    const [tokenPrices, setTokenPrices] = useState({ BNB: 0, USDT: 1, WBNB: 0 });
    const [swapMode, setSwapMode] = useState<SwapMode>("free");
    // Token picker dropdowns
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    // Live inner balances (fetched on-chain)
    const [liveInnerBalances, setLiveInnerBalances] = useState<TokenBalance[]>(innerBalances);
    const [isLoadingInner, setIsLoadingInner] = useState(false);

    // ── Utilities ──────────────────────────────────────────────────────────────

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(walletAddress);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const formatAddress = (address: string) =>
        `${address.slice(0, 6)}...${address.slice(-4)}`;

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

    // Close token pickers on outside click
    useEffect(() => {
        if (!showFromPicker && !showToPicker) return;
        const handler = () => {
            setShowFromPicker(false);
            setShowToPicker(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showFromPicker, showToPicker]);

    // ── Prices ──────────────────────────────────────────────────────────────────

    const fetchTokenPrices = async () => {
        try {
            const response = await fetch(
                "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,tether,wbnb&vs_currencies=usd"
            );
            const data = await response.json();
            const prices = {
                BNB: data.binancecoin?.usd || 0,
                USDT: data.tether?.usd || 1,
                WBNB: data.wbnb?.usd || data.binancecoin?.usd || 0,
            };
            setTokenPrices(prices);
            return prices;
        } catch {
            return { BNB: 0, USDT: 1, WBNB: 0 };
        }
    };

    // ── Balances ───────────────────────────────────────────────────────────────

    const fetchBalances = useCallback(async () => {
        if (!walletAddress || !ethers.utils.isAddress(walletAddress)) return;
        setIsLoadingBalances(true);
        try {
            const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
            const prices = await fetchTokenPrices();
            const balances: TokenBalance[] = [];
            let total = 0;

            const bnbBalance = await provider.getBalance(walletAddress);
            const bnbFormatted = ethers.utils.formatUnits(bnbBalance);
            const bnbValue = parseFloat(bnbFormatted) * prices.BNB;
            total += bnbValue;
            balances.push({ symbol: "BNB", name: "Binance Coin", balance: parseFloat(bnbFormatted).toFixed(4), usdValue: `$${bnbValue.toFixed(2)}`, icon: "🟡" });

            const wbnbContract = new ethers.Contract(TOKEN_ADDRESSES.WBNB, ERC20_ABI, provider);
            const wbnbBalance = await wbnbContract.balanceOf(walletAddress);
            const wbnbDecimals = await wbnbContract.decimals();
            const wbnbFormatted = ethers.utils.formatUnits(wbnbBalance, wbnbDecimals);
            const wbnbValue = parseFloat(wbnbFormatted) * prices.WBNB;
            total += wbnbValue;
            balances.push({ symbol: "WBNB", name: "Wrapped BNB", balance: parseFloat(wbnbFormatted).toFixed(4), usdValue: `$${wbnbValue.toFixed(2)}`, icon: "🟠" });

            const usdtContract = new ethers.Contract(TOKEN_ADDRESSES.USDT, ERC20_ABI, provider);
            const usdtBalance = await usdtContract.balanceOf(walletAddress);
            const usdtDecimals = await usdtContract.decimals();
            const usdtFormatted = ethers.utils.formatUnits(usdtBalance, usdtDecimals);
            const usdtValue = parseFloat(usdtFormatted) * prices.USDT;
            total += usdtValue;
            balances.push({ symbol: "USDT", name: "Tether USD", balance: parseFloat(usdtFormatted).toFixed(4), usdValue: `$${usdtValue.toFixed(2)}`, icon: "💵" });

            setFetchedWalletBalances(balances);
            setCalculatedTotalBalance(total.toFixed(2));
        } catch (e) {
            console.error("Error fetching balances:", e);
        } finally {
            setIsLoadingBalances(false);
        }
    }, [walletAddress, rpcUrl]);

    // ── Estimate ───────────────────────────────────────────────────────────────

    useEffect(() => {
        const amount = parseFloat(swapAmount);
        if (!swapAmount || isNaN(amount) || amount <= 0) { setSwapEstimate(""); return; }
        const { from, to } = swapDir;
        const pFrom = tokenPrices[from as keyof typeof tokenPrices] || 1;
        const pTo = tokenPrices[to as keyof typeof tokenPrices] || 1;
        if (pTo > 0) setSwapEstimate(((amount * pFrom) / pTo).toFixed(6));
    }, [swapAmount, swapDir, tokenPrices]);

    // ── Fetch live Energy token balance ────────────────────────────────────────

    const fetchInnerBalances = useCallback(async () => {
        if (!activeAccount) return;
        setIsLoadingInner(true);
        try {
            const userAddress = activeAccount.address;
            const energyContract = await energyTokenContractInstance(activeAccount);
            const horseContract = await horseTokenContractInstance(activeAccount);

            // Build updated inner balances — start from the prop list
            const updated = await Promise.all(
                innerBalances.map(async (token) => {
                    // ENR = Energy token — fetch live balance
                    if (token.symbol === "ENR" && energyContract) {
                        try {
                            const raw = await energyContract.balanceOf(userAddress);
                            let decimals = 18;
                            try { decimals = await energyContract.decimals(); } catch { /* use 18 */ }
                            const formatted = parseFloat(ethers.utils.formatUnits(raw, decimals));
                            return {
                                ...token,
                                balance: formatted.toFixed(4),
                                usdValue: token.usdValue,
                            };
                        } catch (e) {
                            console.error("Failed to fetch ENR balance:", e);
                            return token;
                        }
                    }
                    // HRS = Horse token — fetch live balance + compute USD value from horsePrice()
                    if (token.symbol === "HRS" && horseContract) {
                        try {
                            const [raw, rawPrice] = await Promise.all([
                                horseContract.balanceOf(userAddress),
                                horseContract.horsePrice().catch(() => null),
                            ]);
                            const formatted = parseFloat(ethers.utils.formatUnits(raw, 18));
                            let usdValue = token.usdValue;
                            if (rawPrice) {
                                const price = parseFloat(ethers.utils.formatUnits(rawPrice, 18));
                                usdValue = `$${(formatted * price).toFixed(2)}`;
                            }
                            return {
                                ...token,
                                balance: formatted.toFixed(4),
                                usdValue,
                            };
                        } catch (e) {
                            console.error("Failed to fetch HRS balance:", e);
                            return token;
                        }
                    }
                    return token;
                })
            );

            setLiveInnerBalances(updated);
        } catch (e) {
            console.error("fetchInnerBalances error:", e);
            setLiveInnerBalances(innerBalances); // fallback
        } finally {
            setIsLoadingInner(false);
        }
    }, [activeAccount, innerBalances]);

    useEffect(() => { if (walletAddress) fetchBalances(); }, [walletAddress, fetchBalances]);

    // Fetch inner (ENR) balance whenever activeAccount changes
    useEffect(() => { fetchInnerBalances(); }, [activeAccount, fetchInnerBalances]);

    const displayWalletBalances = fetchedWalletBalances.length > 0 ? fetchedWalletBalances : walletBalances;

    const displayTotalBalance = (() => {
        const walletTotal = parseFloat(fetchedWalletBalances.length > 0 ? calculatedTotalBalance : totalBalance) || 0;
        const hrsToken = liveInnerBalances.find((t) => t.symbol === "HRS");
        const hrsUsd = hrsToken ? parseFloat(hrsToken.usdValue.replace("$", "")) || 0 : 0;
        return (walletTotal + hrsUsd).toFixed(2);
    })();

    const getTokenBalance = (symbol: string) => {
        const t = displayWalletBalances.find((b) => b.symbol === symbol);
        return t ? t.balance : "0.0000";
    };

    // ── Flip direction ──────────────────────────────────────────────────────────

    const flipSwapDir = () => {
        setSwapDir((prev) => ({ from: prev.to, to: prev.from }));
        setSwapAmount("");
        setSwapEstimate("");
        setSwapError("");
        setSwapStep("");
    };

    // ── HRS → USDT swap state ──────────────────────────────────────────────────

    const [hrsAmount, setHrsAmount]           = useState("");
    const [hrsEstimate, setHrsEstimate]       = useState("");   // live USDT estimate
    const [hrsPrice, setHrsPrice]             = useState<string>(""); // 1 HRS = X USDT
    const [hrsPriceLoading, setHrsPriceLoading] = useState(false);
    const [hrsSwapping, setHrsSwapping]       = useState(false);
    const [hrsSwapSuccess, setHrsSwapSuccess] = useState(false);
    const [hrsSwapError, setHrsSwapError]     = useState("");
    const [hrsSwapStep, setHrsSwapStep]       = useState("");

    // Get HRS balance from liveInnerBalances (on-chain fetched)
    const getHrsBalance = () => {
        const t = liveInnerBalances.find((b) => b.symbol === "HRS");
        return t ? t.balance : "0.0000";
    };

    // ── Fetch horsePrice() from contract ─────────────────────────────────────
    // horsePrice() returns price of 1 HRS in USDT (18 decimals)

    const fetchHorsePrice = useCallback(async () => {
        if (!activeAccount) return;
        setHrsPriceLoading(true);
        try {
            const horseContract = await horseTokenContractInstance(activeAccount);
            if (!horseContract) return;
            const rawPrice = await horseContract.horsePrice(); // uint256, 18 decimals
            const priceFormatted = ethers.utils.formatUnits(rawPrice, 18);
            setHrsPrice(priceFormatted);
        } catch (e) {
            console.error("Failed to fetch horse price:", e);
        } finally {
            setHrsPriceLoading(false);
        }
    }, [activeAccount]);

    // Fetch price when HRS tab is opened
    useEffect(() => {
        if (swapMode === "hrs_usdt" && activeAccount) {
            fetchHorsePrice();
        }
    }, [swapMode, activeAccount, fetchHorsePrice]);

    // ── Compute USDT estimate from horsePrice whenever amount changes ─────────

    useEffect(() => {
        const amt = parseFloat(hrsAmount);
        if (!hrsAmount || isNaN(amt) || amt <= 0 || !hrsPrice) {
            setHrsEstimate("");
            return;
        }
        const price = parseFloat(hrsPrice);
        if (price > 0) {
            // USDT out = HRS amount × price per HRS
            setHrsEstimate((amt * price).toFixed(6));
        }
    }, [hrsAmount, hrsPrice]);

    // ── handleHrsSwap: HRS → USDT via horseContract.swapToUsd ───────────────

    const handleHrsSwap = async () => {
        const amount = parseFloat(hrsAmount);
        if (!hrsAmount || isNaN(amount) || amount <= 0) {
            setHrsSwapError("Please enter a valid HRS amount greater than 0.");
            return;
        }
        if (!activeAccount) {
            setHrsSwapError("No wallet connected. Please connect your wallet first.");
            return;
        }

        setHrsSwapError("");
        setHrsSwapSuccess(false);
        setHrsSwapping(true);
        setHrsSwapStep("Loading contract…");

        try {
            const horseContract = await horseTokenContractInstance(activeAccount);
            if (!horseContract) throw new Error("Failed to load Horse token contract.");

            // ── Check HRS balance ──
            setHrsSwapStep("Checking HRS balance…");
            const decimals: number = (() => { try { return 18; } catch { return 18; } })();
            const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);
            const hrsBal = await horseContract.balanceOf(activeAccount.address);
            if (hrsBal.lt(amountWei))
                throw new Error(
                    `Insufficient HRS. You have ${parseFloat(ethers.utils.formatUnits(hrsBal, decimals)).toFixed(4)} HRS.`
                );

            // ── Execute swapToUsd(_horseAmt) ──
            // Contract burns HRS from caller and sends USDT back
            setHrsSwapStep("Sending swap transaction…");
            const tx = await horseContract.swapToUsd(amountWei);

            setHrsSwapStep("Waiting for confirmation…");
            const receipt = await tx.wait();
            if (receipt.status !== 1) throw new Error("Swap reverted on-chain.");

            // ── Success ──
            setHrsSwapSuccess(true);
            setHrsAmount("");
            setHrsEstimate("");
            setHrsSwapStep("");
            setTimeout(() => setHrsSwapSuccess(false), 5000);

            // Refresh price + both balance sets
            fetchHorsePrice();
            fetchBalances();
            fetchInnerBalances();

        } catch (err: unknown) {
            let msg = "Swap failed. Please try again.";
            if (err instanceof Error) {
                const m = err.message;
                if (m.includes("user rejected") || m.includes("ACTION_REJECTED") || m.includes("User denied"))
                    msg = "Transaction rejected by wallet.";
                else if (m.includes("insufficient funds"))
                    msg = "Not enough BNB to cover gas fees.";
                else if (m.includes("ERC20InsufficientBalance"))
                    msg = "Insufficient HRS token balance.";
                else if (m.includes("execution reverted"))
                    msg = "Transaction reverted. Check your HRS balance or try again.";
                else
                    msg = m.slice(0, 120);
            }
            setHrsSwapError(msg);
            setHrsSwapStep("");
        } finally {
            setHrsSwapping(false);
        }
    };

 
    // ── handleSwap ─────────────────────────────────────────────────────────────

    const handleSwap = async () => {
        const amount = parseFloat(swapAmount);
        if (!swapAmount || isNaN(amount) || amount <= 0) {
            setSwapError("Please enter a valid amount greater than 0.");
            return;
        }
        if (!activeAccount) {
            setSwapError("No wallet connected. Please connect your wallet first.");
            return;
        }

        setSwapError("");
        setSwapSuccess(false);
        setIsSwapping(true);
        setSwapStep("Initializing…");

        const deadline = Math.floor(Date.now() / 1000) + 600;
        const { from, to } = swapDir;

        try {
            // ══════════════════════════════════════════════
            //  WBNB → BNB  (unwrap)
            // ══════════════════════════════════════════════
            if (from === "WBNB" && to === "BNB") {
                setSwapStep("Checking WBNB balance…");
                const wbnbContract = await wbnbContractInstance(activeAccount);
                if (!wbnbContract) throw new Error("Failed to load WBNB contract.");
                const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
                const bal = await wbnbContract.balanceOf(walletAddress);
                if (bal.lt(amountWei))
                    throw new Error(`Insufficient WBNB. You have ${ethers.utils.formatUnits(bal, 18)} WBNB.`);
                setSwapStep("Sending withdrawal transaction…");
                const tx = await wbnbContract.withdraw(amountWei);
                setSwapStep("Waiting for confirmation…");
                const receipt = await tx.wait();
                if (receipt.status !== 1) throw new Error("Withdrawal reverted on-chain.");
            }

            // ══════════════════════════════════════════════
            //  BNB → WBNB  (wrap)
            // ══════════════════════════════════════════════
            else if (from === "BNB" && to === "WBNB") {
                setSwapStep("Checking BNB balance…");
                const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
                const bnbBal = await provider.getBalance(walletAddress);
                const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
                // Reserve 0.001 BNB for gas
                const gasReserve = ethers.utils.parseUnits("0.001", 18);
                if (bnbBal.lt(amountWei.add(gasReserve)))
                    throw new Error(`Insufficient BNB. You have ${ethers.utils.formatEther(bnbBal)} BNB (reserve some for gas).`);

                // Use wbnbContract signer for deposit (payable)
                const wbnbContract = await wbnbContractInstance(activeAccount);
                if (!wbnbContract) throw new Error("Failed to load WBNB contract.");
                setSwapStep("Sending wrap transaction…");
                const tx = await wbnbContract.deposit({ value: amountWei });
                setSwapStep("Waiting for confirmation…");
                const receipt = await tx.wait();
                if (receipt.status !== 1) throw new Error("Wrap transaction reverted on-chain.");
            }

            // ══════════════════════════════════════════════
            //  USDT → BNB  (PancakeSwap)
            // ══════════════════════════════════════════════
            else if (from === "USDT" && to === "BNB") {
                setSwapStep("Checking USDT balance…");
                const usdtContract = await usdtContractInstance(activeAccount);
                if (!usdtContract) throw new Error("Failed to load USDT contract.");
                const amountIn = ethers.utils.parseUnits(amount.toString(), 18);
                const usdtBal = await usdtContract.balanceOf(walletAddress);
                if (usdtBal.lt(amountIn))
                    throw new Error(`Insufficient USDT. You have ${ethers.utils.formatUnits(usdtBal, 18)} USDT.`);

                setSwapStep("Checking allowance…");
                const allowance = await usdtContract.allowance(walletAddress, PANCAKE_ROUTER_V2);
                if (allowance.lt(amountIn)) {
                    setSwapStep("Approving USDT spend…");
                    const approveTx = await usdtContract.approve(PANCAKE_ROUTER_V2, ethers.constants.MaxUint256);
                    setSwapStep("Waiting for approval confirmation…");
                    const approveReceipt = await approveTx.wait();
                    if (approveReceipt.status !== 1) throw new Error("Approval transaction failed.");
                }

                setSwapStep("Getting swap quote…");
                const router = await pancakeRouterContractInstance(activeAccount);
                if (!router) throw new Error("Failed to load router contract.");
                const path = [TOKEN_ADDRESSES.USDT, TOKEN_ADDRESSES.WBNB];
                let amountsOut;
                try { amountsOut = await router.getAmountsOut(amountIn, path); }
                catch { throw new Error("Could not get swap quote. Liquidity may be insufficient."); }
                const amountOutMin = amountsOut[1].mul(10000 - SLIPPAGE_BPS).div(10000);

                setSwapStep("Executing swap…");
                const swapTx = await router.swapExactTokensForETH(
                    amountIn, amountOutMin, path, walletAddress, deadline,
                    { gasLimit: ethers.utils.hexlify(300000) }
                );
                setSwapStep("Waiting for confirmation…");
                const receipt = await swapTx.wait();
                if (receipt.status !== 1) throw new Error("Swap reverted on-chain.");
            }

            // ══════════════════════════════════════════════
            //  BNB → USDT  (PancakeSwap)
            // ══════════════════════════════════════════════
            else if (from === "BNB" && to === "USDT") {
                setSwapStep("Checking BNB balance…");
                const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
                const bnbBal = await provider.getBalance(walletAddress);
                const amountWei = ethers.utils.parseUnits(amount.toString(), 18);
                const gasReserve = ethers.utils.parseUnits("0.001", 18);
                if (bnbBal.lt(amountWei.add(gasReserve)))
                    throw new Error(`Insufficient BNB. You have ${ethers.utils.formatEther(bnbBal)} BNB.`);

                setSwapStep("Getting swap quote…");
                const router = await pancakeRouterContractInstance(activeAccount);
                if (!router) throw new Error("Failed to load router contract.");
                const path = [TOKEN_ADDRESSES.WBNB, TOKEN_ADDRESSES.USDT];
                let amountsOut;
                try { amountsOut = await router.getAmountsOut(amountWei, path); }
                catch { throw new Error("Could not get swap quote. Liquidity may be insufficient."); }
                const amountOutMin = amountsOut[1].mul(10000 - SLIPPAGE_BPS).div(10000);

                setSwapStep("Executing swap…");
                const swapTx = await router.swapExactETHForTokens(
                    amountOutMin, path, walletAddress, deadline,
                    { value: amountWei, gasLimit: ethers.utils.hexlify(300000) }
                );
                setSwapStep("Waiting for confirmation…");
                const receipt = await swapTx.wait();
                if (receipt.status !== 1) throw new Error("Swap reverted on-chain.");
            }

            // Success
            setSwapSuccess(true);
            setSwapAmount("");
            setSwapEstimate("");
            setSwapStep("");
            setTimeout(() => setSwapSuccess(false), 5000);
            fetchBalances();
        } catch (err) {
            setSwapError(friendlyError(err));
            setSwapStep("");
        } finally {
            setIsSwapping(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="relative border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 transition-colors"
                >
                    <Wallet className="h-4 w-4" />
                </Button>
            </SheetTrigger>

            <SheetContent
                className="w-full sm:max-w-[400px] bg-[#080808] border-l border-white/[0.06] text-white overflow-y-auto p-0 flex flex-col"
                style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
            >
                {!showHorseTokenDetail ? (
                    <div className="flex flex-col min-h-full">

                        {/* ── Header ───────────────────────────────── */}
                        <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-3.5 w-3.5 text-zinc-500" />
                                    <span className="text-[11px] font-medium tracking-[0.12em] text-zinc-500 uppercase">
                                        Wallet
                                    </span>
                                </div>
                                <WalletConnect />
                            </div>

                            {/* Address + copy */}
                            <button
                                onClick={handleCopyAddress}
                                className="group flex items-center gap-2 mb-5"
                            >
                                <span className="font-mono text-[13px] text-zinc-400 group-hover:text-white transition-colors">
                                    {formatAddress(walletAddress)}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Copy className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                    {isCopied && (
                                        <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
                                    )}
                                </div>
                            </button>

                            {/* Total */}
                            <div>
                                <p className="text-[10px] tracking-[0.14em] text-zinc-600 uppercase mb-1">
                                    Total Value
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[2.6rem] font-extralight tracking-tight leading-none text-white">
                                        ${displayTotalBalance}
                                    </span>
                                    <button
                                        onClick={() => { fetchBalances(); fetchInnerBalances(); }}
                                        disabled={isLoadingBalances}
                                        className="mb-1 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <RefreshCw className={`h-3.5 w-3.5 text-zinc-600 ${isLoadingBalances ? "animate-spin" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Tabs ─────────────────────────────────── */}
                        <div className="flex px-5 border-b border-white/[0.06]">
                            {(["portfolio", "swap"] as ActiveTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-3 mr-5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-all border-b-[1.5px] -mb-px ${
                                        activeTab === tab
                                            ? "border-white text-white"
                                            : "border-transparent text-zinc-600 hover:text-zinc-400"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* ── Content ──────────────────────────────── */}
                        <div className="flex-1 px-5 py-5 space-y-6">

                            {/* PORTFOLIO */}
                            {activeTab === "portfolio" && (
                                <>
                                    {/* Inner balance */}
                                    {liveInnerBalances.length > 0 && (
                                        <section>
                                            <div className="flex items-center justify-between mb-2.5">
                                                <p className="text-[10px] tracking-[0.14em] text-zinc-600 uppercase">
                                                    Inner Balance
                                                </p>
                                                <button
                                                    onClick={fetchInnerBalances}
                                                    disabled={isLoadingInner}
                                                    className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                                                    title="Refresh inner balances"
                                                >
                                                    <RefreshCw className={`h-3 w-3 text-zinc-700 ${isLoadingInner ? "animate-spin" : ""}`} />
                                                </button>
                                            </div>
                                            <div className="space-y-1">
                                                {liveInnerBalances.map((token, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleTokenClick(token)}
                                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                                                            token.isHorseToken
                                                                ? "border-amber-900/30 bg-amber-950/10 hover:bg-amber-950/20 cursor-pointer"
                                                                : "border-white/[0.05] hover:border-white/10 cursor-default"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                                                                <Image
                                                                    src={token.icon}
                                                                    alt={token.symbol}
                                                                    width={36}
                                                                    height={36}
                                                                    className="object-cover"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).style.display = "none";
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{token.symbol}</p>
                                                                <p className="text-[11px] text-zinc-500">{token.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            {isLoadingInner && (token.symbol === "ENR" || token.symbol === "HRS") ? (
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <RefreshCw className="h-3 w-3 text-zinc-600 animate-spin" />
                                                                    <span className="text-[11px] text-zinc-600">Loading…</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <p className="text-sm font-medium tabular-nums">{token.balance}</p>
                                                                    <p className="text-[11px] text-zinc-500">{token.usdValue}</p>
                                                                </>
                                                            )}
                                                            {token.isHorseToken && (
                                                                <p className="text-[10px] text-zinc-700 mt-0.5">Details →</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Wallet balance */}
                                    <section>
                                        <p className="text-[10px] tracking-[0.14em] text-zinc-600 uppercase mb-2.5">
                                            Wallet Balance
                                        </p>
                                        {isLoadingBalances ? (
                                            <div className="flex flex-col items-center py-10 gap-3">
                                                <RefreshCw className="h-5 w-5 text-zinc-700 animate-spin" />
                                                <p className="text-xs text-zinc-600">Fetching balances…</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {displayWalletBalances.map((token, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.02] transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                                                                <TokenImg symbol={token.symbol} size={28} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{token.symbol}</p>
                                                                <p className="text-[11px] text-zinc-500">{token.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium tabular-nums">{token.balance}</p>
                                                            <p className="text-[11px] text-zinc-500">{token.usdValue}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                </>
                            )}

                            {/* SWAP TAB */}
                            {activeTab === "swap" && (
                                <div className="space-y-3">

                                    {/* ── Mode tabs: Swap | HRS → USDT ── */}
                                    <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                        {SWAP_TABS.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => {
                                                    setSwapMode(tab.id);
                                                    setSwapAmount("");
                                                    setSwapEstimate("");
                                                    setSwapError("");
                                                    setSwapStep("");
                                                    setHrsAmount("");
                                                    setHrsEstimate("");
                                                    setHrsSwapError("");
                                                    setHrsSwapStep("");
                                                    setShowFromPicker(false);
                                                    setShowToPicker(false);
                                                }}
                                                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all ${
                                                    swapMode === tab.id
                                                        ? "bg-white text-black"
                                                        : "text-zinc-600 hover:text-zinc-400"
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* ══ FREE SWAP MODE ══════════════════════════ */}
                                    {swapMode === "free" && (
                                        <>
                                            {/* FROM card */}
                                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                                                <div className="flex justify-between mb-3">
                                                    <span className="text-[11px] text-zinc-600">You pay</span>
                                                    <button
                                                        className="text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors tabular-nums"
                                                        onClick={() => setSwapAmount(getTokenBalance(swapDir.from))}
                                                    >
                                                        Balance: <span className="text-zinc-400">{getTokenBalance(swapDir.from)}</span>
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {/* Token picker — FROM */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => {
                                                                setShowFromPicker((v) => !v);
                                                                setShowToPicker(false);
                                                            }}
                                                            className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] rounded-xl px-3 py-2 min-w-[100px] transition-colors border border-white/[0.04] hover:border-white/10"
                                                        >
                                                            <TokenImg symbol={swapDir.from} size={20} />
                                                            <span className="text-[13px] font-semibold">{swapDir.from}</span>
                                                            <ChevronDown className="h-3 w-3 text-zinc-500 ml-auto" />
                                                        </button>
                                                        {showFromPicker && (
                                                            <div className="absolute top-full left-0 mt-1.5 z-50 w-[150px] rounded-xl border border-white/[0.08] bg-[#111] shadow-2xl overflow-hidden">
                                                                {(Object.keys(TOKEN_META) as string[]).map((sym) => (
                                                                    <button
                                                                        key={sym}
                                                                        disabled={sym === swapDir.to}
                                                                        onClick={() => {
                                                                            setSwapDir((prev) => ({ ...prev, from: sym }));
                                                                            setSwapAmount("");
                                                                            setSwapEstimate("");
                                                                            setSwapError("");
                                                                            setShowFromPicker(false);
                                                                        }}
                                                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors text-left ${
                                                                            sym === swapDir.from
                                                                                ? "bg-white/[0.07] text-white"
                                                                                : sym === swapDir.to
                                                                                ? "opacity-30 cursor-not-allowed"
                                                                                : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                                                                        }`}
                                                                    >
                                                                        <TokenImg symbol={sym} size={18} />
                                                                        <span>{sym}</span>
                                                                        {sym === swapDir.from && (
                                                                            <CheckCircle2 className="h-3 w-3 text-white ml-auto" />
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        placeholder="0.00"
                                                        value={swapAmount}
                                                        onChange={(e) => {
                                                            setSwapAmount(e.target.value);
                                                            setSwapError("");
                                                        }}
                                                        className="flex-1 bg-transparent text-right text-2xl font-extralight text-white placeholder-zinc-700 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-1.5 mt-3">
                                                    {[
                                                        { label: "25%", factor: 0.25 },
                                                        { label: "50%", factor: 0.5 },
                                                        { label: "Max", factor: 1 },
                                                    ].map(({ label, factor }) => (
                                                        <button
                                                            key={label}
                                                            onClick={() => {
                                                                const bal = parseFloat(getTokenBalance(swapDir.from)) || 0;
                                                                const reserve = swapDir.from === "BNB" ? 0.001 : 0;
                                                                const val = Math.max(0, bal * factor - (factor === 1 ? reserve : 0));
                                                                setSwapAmount(val.toFixed(6));
                                                            }}
                                                            className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.05] text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.07] transition-all font-medium"
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Flip button */}
                                            <div className="flex justify-center relative z-10">
                                                <button
                                                    onClick={flipSwapDir}
                                                    className="group h-9 w-9 rounded-full border border-white/[0.08] bg-[#080808] hover:bg-white/[0.05] flex items-center justify-center transition-all hover:border-white/20 hover:scale-110 active:scale-95"
                                                >
                                                    <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                                                </button>
                                            </div>

                                            {/* TO card */}
                                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                                                <div className="flex justify-between mb-3">
                                                    <span className="text-[11px] text-zinc-600">You receive</span>
                                                    <span className="text-[11px] text-zinc-600 tabular-nums">
                                                        Balance: <span className="text-zinc-400">{getTokenBalance(swapDir.to)}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {/* Token picker — TO */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => {
                                                                setShowToPicker((v) => !v);
                                                                setShowFromPicker(false);
                                                            }}
                                                            className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] rounded-xl px-3 py-2 min-w-[100px] transition-colors border border-white/[0.04] hover:border-white/10"
                                                        >
                                                            <TokenImg symbol={swapDir.to} size={20} />
                                                            <span className="text-[13px] font-semibold">{swapDir.to}</span>
                                                            <ChevronDown className="h-3 w-3 text-zinc-500 ml-auto" />
                                                        </button>
                                                        {showToPicker && (
                                                            <div className="absolute top-full left-0 mt-1.5 z-50 w-[150px] rounded-xl border border-white/[0.08] bg-[#111] shadow-2xl overflow-hidden">
                                                                {(Object.keys(TOKEN_META) as string[]).map((sym) => (
                                                                    <button
                                                                        key={sym}
                                                                        disabled={sym === swapDir.from}
                                                                        onClick={() => {
                                                                            setSwapDir((prev) => ({ ...prev, to: sym }));
                                                                            setSwapAmount("");
                                                                            setSwapEstimate("");
                                                                            setSwapError("");
                                                                            setShowToPicker(false);
                                                                        }}
                                                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium transition-colors text-left ${
                                                                            sym === swapDir.to
                                                                                ? "bg-white/[0.07] text-white"
                                                                                : sym === swapDir.from
                                                                                ? "opacity-30 cursor-not-allowed"
                                                                                : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                                                                        }`}
                                                                    >
                                                                        <TokenImg symbol={sym} size={18} />
                                                                        <span>{sym}</span>
                                                                        {sym === swapDir.to && (
                                                                            <CheckCircle2 className="h-3 w-3 text-white ml-auto" />
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 text-right text-2xl font-extralight text-zinc-500 tabular-nums">
                                                        {swapEstimate || "0.00"}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rate line */}
                                            {swapEstimate && swapAmount && (
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[11px] text-zinc-700">Rate</span>
                                                    <span className="text-[11px] text-zinc-500 tabular-nums">
                                                        1 {swapDir.from} ≈{" "}
                                                        {(() => {
                                                            const pFrom = tokenPrices[swapDir.from as keyof typeof tokenPrices] || 1;
                                                            const pTo = tokenPrices[swapDir.to as keyof typeof tokenPrices] || 1;
                                                            return (pFrom / pTo).toFixed(6);
                                                        })()}{" "}
                                                        {swapDir.to}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Slippage */}
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[11px] text-zinc-700">Slippage</span>
                                                <span className="text-[11px] text-zinc-600">1.0%</span>
                                            </div>

                                            {/* Step feedback */}
                                            {swapStep && !swapError && (
                                                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                                                    <RefreshCw className="h-3.5 w-3.5 text-zinc-500 animate-spin shrink-0" />
                                                    <span className="text-[12px] text-zinc-400">{swapStep}</span>
                                                </div>
                                            )}

                                            {/* Error */}
                                            {swapError && (
                                                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-950/20 border border-red-900/30">
                                                    <AlertCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                                                    <span className="text-[12px] text-red-300 leading-relaxed">{swapError}</span>
                                                </div>
                                            )}

                                            {/* Success */}
                                            {swapSuccess && (
                                                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                                    <span className="text-[12px] text-emerald-300 font-medium">
                                                        Swap successful! Balances updated.
                                                    </span>
                                                </div>
                                            )}

                                            {/* CTA */}
                                            <button
                                                onClick={handleSwap}
                                                disabled={isSwapping || !swapAmount || parseFloat(swapAmount) <= 0}
                                                className="w-full py-3.5 rounded-2xl bg-white text-black text-[13px] font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-25 disabled:cursor-not-allowed mt-1"
                                            >
                                                {isSwapping ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                        {swapStep || "Processing…"}
                                                    </span>
                                                ) : (
                                                    `Swap ${swapDir.from} → ${swapDir.to}`
                                                )}
                                            </button>

                                            <p className="text-center text-[10px] text-zinc-700 tracking-wide">
                                                Powered by PancakeSwap V2 · BSC Mainnet
                                            </p>
                                        </>
                                    )}

                                    {/* ══ HRS → USDT MODE ════════════════════════ */}
                                    {swapMode === "hrs_usdt" && (
                                        <div className="space-y-3">

                                            {/* Live price card */}
                                            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-5 w-5 rounded-full overflow-hidden shrink-0">
                                                        <Image src="/horse-token-img.png" alt="HRS" width={20} height={20} className="object-cover" />
                                                    </div>
                                                    <span className="text-[11px] text-zinc-500">1 HRS</span>
                                                    <span className="text-[11px] text-zinc-700">=</span>
                                                    <span className="text-[13px] font-semibold text-white tabular-nums">
                                                        {hrsPriceLoading
                                                            ? "…"
                                                            : hrsPrice
                                                            ? `${parseFloat(hrsPrice).toFixed(4)} USDT`
                                                            : "—"
                                                        }
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={fetchHorsePrice}
                                                    disabled={hrsPriceLoading}
                                                    className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors touch-manipulation"
                                                    title="Refresh price"
                                                >
                                                    <RefreshCw className={`h-3 w-3 text-zinc-600 ${hrsPriceLoading ? "animate-spin" : ""}`} />
                                                </button>
                                            </div>

                                            {/* FROM card — HRS (fixed) */}
                                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-[11px] text-zinc-600">You pay</span>
                                                    <button
                                                        className="text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors tabular-nums touch-manipulation"
                                                        onClick={() => setHrsAmount(getHrsBalance())}
                                                    >
                                                        Balance: <span className="text-zinc-400">{getHrsBalance()}</span>
                                                        {isLoadingInner && <RefreshCw className="inline h-2.5 w-2.5 ml-1 animate-spin text-zinc-600" />}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Fixed HRS badge */}
                                                    <div className="flex items-center gap-2 bg-amber-950/20 border border-amber-900/30 rounded-xl px-2.5 py-2 shrink-0" style={{ minWidth: 90 }}>
                                                        <div className="h-[18px] w-[18px] rounded-full overflow-hidden shrink-0">
                                                            <Image src="/horse-token-img.png" alt="HRS" width={18} height={18} className="object-cover" />
                                                        </div>
                                                        <span className="text-[13px] font-semibold text-amber-200">HRS</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        placeholder="0.00"
                                                        value={hrsAmount}
                                                        onChange={(e) => {
                                                            setHrsAmount(e.target.value);
                                                            setHrsSwapError("");
                                                        }}
                                                        className="flex-1 min-w-0 bg-transparent text-right text-xl font-extralight text-white placeholder-zinc-700 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>
                                                {/* Quick-fill */}
                                                <div className="flex justify-end gap-1.5 mt-2.5">
                                                    {[{ label: "25%", factor: 0.25 }, { label: "50%", factor: 0.5 }, { label: "Max", factor: 1 }].map(({ label, factor }) => (
                                                        <button
                                                            key={label}
                                                            onClick={() => {
                                                                const bal = parseFloat(getHrsBalance()) || 0;
                                                                setHrsAmount((bal * factor).toFixed(4));
                                                                setHrsSwapError("");
                                                            }}
                                                            className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.05] text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.07] transition-all font-medium touch-manipulation"
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Arrow — direction fixed, non-interactive */}
                                            <div className="flex justify-center">
                                                <div className="h-9 w-9 rounded-full border border-white/[0.08] bg-[#080808] flex items-center justify-center">
                                                    <ArrowUpDown className="h-3.5 w-3.5 text-zinc-600" />
                                                </div>
                                            </div>

                                            {/* TO card — USDT (fixed, shows live estimate) */}
                                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-[11px] text-zinc-600">You receive</span>
                                                    <span className="text-[11px] text-zinc-600 tabular-nums">
                                                        Balance: <span className="text-zinc-400">{getTokenBalance("USDT")}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Fixed USDT badge */}
                                                    <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.04] rounded-xl px-2.5 py-2 shrink-0" style={{ minWidth: 90 }}>
                                                        <img
                                                            src="https://upload.wikimedia.org/wikipedia/commons/0/01/USDT_Logo.png"
                                                            alt="USDT"
                                                            width={18}
                                                            height={18}
                                                            style={{ borderRadius: "50%", objectFit: "cover", width: 18, height: 18 }}
                                                        />
                                                        <span className="text-[13px] font-semibold">USDT</span>
                                                    </div>
                                                    <div className="flex-1 text-right text-xl font-extralight tabular-nums">
                                                        {hrsEstimate
                                                            ? <span className="text-white">{hrsEstimate}</span>
                                                            : <span className="text-zinc-700">0.00</span>
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rate + note row */}
                                            {hrsPrice && (
                                                <div className="flex justify-between items-center px-1">
                                                    <span className="text-[11px] text-zinc-700">Rate</span>
                                                    <span className="text-[11px] text-zinc-500 tabular-nums">
                                                        1 HRS = {parseFloat(hrsPrice).toFixed(4)} USDT
                                                    </span>
                                                </div>
                                            )}

                                            {/* Step feedback */}
                                            {hrsSwapStep && !hrsSwapError && (
                                                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                                                    <RefreshCw className="h-3.5 w-3.5 text-zinc-500 animate-spin shrink-0" />
                                                    <span className="text-[12px] text-zinc-400">{hrsSwapStep}</span>
                                                </div>
                                            )}

                                            {/* Error */}
                                            {hrsSwapError && (
                                                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-950/20 border border-red-900/30">
                                                    <AlertCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                                                    <span className="text-[12px] text-red-300 leading-relaxed">{hrsSwapError}</span>
                                                </div>
                                            )}

                                            {/* Success */}
                                            {hrsSwapSuccess && (
                                                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                                    <span className="text-[12px] text-emerald-300 font-medium">
                                                        Swap successful! USDT received in your wallet.
                                                    </span>
                                                </div>
                                            )}

                                            {/* CTA */}
                                            <button
                                                onClick={handleHrsSwap}
                                                disabled={hrsSwapping || !hrsAmount || parseFloat(hrsAmount) <= 0}
                                                className="w-full py-4 rounded-2xl bg-white text-black text-[13px] font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-25 disabled:cursor-not-allowed touch-manipulation"
                                            >
                                                {hrsSwapping ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                        {hrsSwapStep || "Processing…"}
                                                    </span>
                                                ) : (
                                                    "Swap HRS → USDT"
                                                )}
                                            </button>

                                            <p className="text-center text-[10px] text-zinc-700 tracking-wide">
                                                Via Horse Token Contract · BSC Mainnet
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={handleBackToWallet}
                            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors px-5 pt-5 pb-4"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to wallet
                        </button>
                        <HorseTokenDetail onBack={handleBackToWallet} />
                    </div>
                )}

                <SheetDescription className="sr-only">
                    View your wallet balance and manage your tokens
                </SheetDescription>
            </SheetContent>
        </Sheet>
    );
}