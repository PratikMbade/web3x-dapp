/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useCallback, useRef, RefObject } from "react";
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
import { useActiveAccount } from "thirdweb/react";
import { horseTokenContractInstance } from "@/contract/horse-token-contract/contract-instance";

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

type SwapDirection = {
    from: keyof typeof TOKEN_META;
    to: keyof typeof TOKEN_META;
};

const ALL_PAIRS: SwapDirection[] = [
    { from: "USDT", to: "BNB" },
    { from: "BNB", to: "USDT" },
    { from: "WBNB", to: "BNB" },
    { from: "BNB", to: "WBNB" },
    // ✅ NEW: WBNB ↔ USDT pairs
    { from: "WBNB", to: "USDT" },
    { from: "USDT", to: "WBNB" },
];

type ActiveTab = "portfolio" | "swap";
type SwapMode = "free" | "coming_soon";

const SWAP_TABS: { id: SwapMode; label: string }[] = [
    { id: "free", label: "Swap" },
    { id: "coming_soon", label: "HRS → USDT" },
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

// ─── Token Picker Dropdown (extracted for reuse) ──────────────────────────────

function TokenPicker({
    value,
    disabledValue,
    show,
    onToggle,
    onSelect,
    pickerRef,
    dropdownSide = "left",
}: {
    value: string;
    disabledValue: string;
    show: boolean;
    onToggle: () => void;
    onSelect: (sym: string) => void;
pickerRef: RefObject<HTMLDivElement | null> | null;
    dropdownSide?: "left" | "right";
}) {
    return (
        <div className="relative shrink-0" ref={pickerRef}>
            <button
                onClick={onToggle}
                className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.10] rounded-xl px-2.5 py-2 transition-colors border border-white/[0.04] hover:border-white/10 touch-manipulation"
                style={{ minWidth: 90 }}
            >
                <TokenImg symbol={value} size={18} />
                <span className="text-[13px] font-semibold">{value}</span>
                <ChevronDown
                    className="h-3 w-3 text-zinc-500 ml-auto transition-transform"
                    style={{ transform: show ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>

            {show && (
                <div
                    className={`absolute z-[100] top-full mt-1.5 w-[140px] rounded-xl border border-white/[0.08] bg-[#111] shadow-2xl overflow-hidden ${
                        dropdownSide === "right" ? "right-0" : "left-0"
                    }`}
                >
                    {(Object.keys(TOKEN_META) as string[]).map((sym) => {
                        const isCurrent = sym === value;
                        const isDisabled = sym === disabledValue;
                        return (
                            <button
                                key={sym}
                                disabled={isCurrent || isDisabled}
                                onClick={() => onSelect(sym)}
                                className={`w-full flex items-center gap-2.5 px-3 py-3 text-[12px] font-medium transition-colors text-left touch-manipulation ${
                                    isCurrent
                                        ? "bg-white/[0.07] text-white"
                                        : isDisabled
                                        ? "opacity-30 cursor-not-allowed"
                                        : "text-zinc-400 hover:bg-white/[0.05] hover:text-white active:bg-white/[0.08]"
                                }`}
                            >
                                <TokenImg symbol={sym} size={18} />
                                <span>{sym}</span>
                                {isCurrent && (
                                    <CheckCircle2 className="h-3 w-3 text-white ml-auto" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
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
    const [swapStep, setSwapStep] = useState<string>("");
    const [tokenPrices, setTokenPrices] = useState({ BNB: 0, USDT: 1, WBNB: 0 });
    const [swapMode, setSwapMode] = useState<SwapMode>("free");
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const [liveInnerBalances, setLiveInnerBalances] = useState<TokenBalance[]>(innerBalances);
    const [isLoadingInner, setIsLoadingInner] = useState(false);

    const fromPickerRef = useRef<HTMLDivElement>(null);
    const toPickerRef = useRef<HTMLDivElement>(null);

    // ── Close dropdowns on outside click ─────────────────────────────────────

    useEffect(() => {
        const handler = (e: MouseEvent | TouchEvent) => {
            if (fromPickerRef.current && !fromPickerRef.current.contains(e.target as Node)) {
                setShowFromPicker(false);
            }
            if (toPickerRef.current && !toPickerRef.current.contains(e.target as Node)) {
                setShowToPicker(false);
            }
        };
        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };
    }, []);

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

    // ── Prices ────────────────────────────────────────────────────────────────

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

    // ── Balances ──────────────────────────────────────────────────────────────

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

    // ── Estimate ──────────────────────────────────────────────────────────────

    useEffect(() => {
        const amount = parseFloat(swapAmount);
        if (!swapAmount || isNaN(amount) || amount <= 0) { setSwapEstimate(""); return; }
        const { from, to } = swapDir;
        const pFrom = tokenPrices[from as keyof typeof tokenPrices] || 1;
        const pTo = tokenPrices[to as keyof typeof tokenPrices] || 1;
        if (pTo > 0) setSwapEstimate(((amount * pFrom) / pTo).toFixed(6));
    }, [swapAmount, swapDir, tokenPrices]);

    // ── Fetch live Energy token balance ───────────────────────────────────────

    const fetchInnerBalances = useCallback(async () => {
        if (!activeAccount) return;
        setIsLoadingInner(true);
        try {
            const userAddress = activeAccount.address;
            const energyContract = await energyTokenContractInstance(activeAccount);
            const horseContract = await horseTokenContractInstance(activeAccount)

            const updated = await Promise.all(
                innerBalances.map(async (token) => {
                    if (token.symbol === "ENR" && energyContract) {
                        try {
                            const raw = await energyContract.balanceOf(userAddress);
                            let decimals = 18;
                            try { decimals = await energyContract.decimals(); } catch { /* use 18 */ }
                            const formatted = parseFloat(ethers.utils.formatUnits(raw, decimals));
                            return { ...token, balance: formatted.toFixed(4), usdValue: token.usdValue };
                        } catch (e) {
                            console.error("Failed to fetch ENR balance:", e);
                            return token;
                        }
                    }
                     if (token.symbol === "HRS" && energyContract) {
                        try {
                            const raw = await horseContract.balanceOf(userAddress);
                            let decimals = 18;
                            try { decimals = await horseContract.decimals(); } catch { /* use 18 */ }
                            const formatted = parseFloat(ethers.utils.formatUnits(raw, decimals));
                            return { ...token, balance: formatted.toFixed(4), usdValue: token.usdValue };
                        } catch (e) {
                            console.error("Failed to fetch ENR balance:", e);
                            return token;
                        }
                    }
                    return token;
                })
            );

            setLiveInnerBalances(updated);
        } catch (e) {
            console.error("fetchInnerBalances error:", e);
            setLiveInnerBalances(innerBalances);
        } finally {
            setIsLoadingInner(false);
        }
    }, [activeAccount, innerBalances]);

    useEffect(() => { if (walletAddress) fetchBalances(); }, [walletAddress, fetchBalances]);
    useEffect(() => { fetchInnerBalances(); }, [activeAccount, fetchInnerBalances]);

    const displayWalletBalances = fetchedWalletBalances.length > 0 ? fetchedWalletBalances : walletBalances;
    const displayTotalBalance = fetchedWalletBalances.length > 0 ? calculatedTotalBalance : totalBalance;

    const getTokenBalance = (symbol: string) => {
        const t = displayWalletBalances.find((b) => b.symbol === symbol);
        return t ? t.balance : "0.0000";
    };

    // ── Flip direction ────────────────────────────────────────────────────────

    const flipSwapDir = () => {
        setSwapDir((prev) => ({ from: prev.to, to: prev.from }));
        setSwapAmount("");
        setSwapEstimate("");
        setSwapError("");
        setSwapStep("");
    };

    // ── handleSwap ────────────────────────────────────────────────────────────

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
                const gasReserve = ethers.utils.parseUnits("0.001", 18);
                if (bnbBal.lt(amountWei.add(gasReserve)))
                    throw new Error(`Insufficient BNB. You have ${ethers.utils.formatEther(bnbBal)} BNB (reserve some for gas).`);
                const wbnbContract = await wbnbContractInstance(activeAccount);
                if (!wbnbContract) throw new Error("Failed to load WBNB contract.");
                setSwapStep("Sending wrap transaction…");
                const tx = await wbnbContract.deposit({ value: amountWei });
                setSwapStep("Waiting for confirmation…");
                const receipt = await tx.wait();
                if (receipt.status !== 1) throw new Error("Wrap transaction reverted on-chain.");
            }

            // ══════════════════════════════════════════════
            //  USDT → BNB  (PancakeSwap: USDT → WBNB → unwrap)
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

            // ══════════════════════════════════════════════
            //  ✅ WBNB → USDT  (PancakeSwap: token → token)
            // ══════════════════════════════════════════════
            else if (from === "WBNB" && to === "USDT") {
                setSwapStep("Checking WBNB balance…");
                const wbnbContract = await wbnbContractInstance(activeAccount);
                if (!wbnbContract) throw new Error("Failed to load WBNB contract.");
                const amountIn = ethers.utils.parseUnits(amount.toString(), 18);
                const wbnbBal = await wbnbContract.balanceOf(walletAddress);
                if (wbnbBal.lt(amountIn))
                    throw new Error(`Insufficient WBNB. You have ${ethers.utils.formatUnits(wbnbBal, 18)} WBNB.`);

                setSwapStep("Checking allowance…");
                const allowance = await wbnbContract.allowance(walletAddress, PANCAKE_ROUTER_V2);
                if (allowance.lt(amountIn)) {
                    setSwapStep("Approving WBNB spend…");
                    const approveTx = await wbnbContract.approve(PANCAKE_ROUTER_V2, ethers.constants.MaxUint256);
                    setSwapStep("Waiting for approval confirmation…");
                    const approveReceipt = await approveTx.wait();
                    if (approveReceipt.status !== 1) throw new Error("Approval transaction failed.");
                }

                setSwapStep("Getting swap quote…");
                const router = await pancakeRouterContractInstance(activeAccount);
                if (!router) throw new Error("Failed to load router contract.");
                const path = [TOKEN_ADDRESSES.WBNB, TOKEN_ADDRESSES.USDT];
                let amountsOut;
                try { amountsOut = await router.getAmountsOut(amountIn, path); }
                catch { throw new Error("Could not get swap quote. Liquidity may be insufficient."); }
                const amountOutMin = amountsOut[1].mul(10000 - SLIPPAGE_BPS).div(10000);

                setSwapStep("Executing swap…");
                const swapTx = await router.swapExactTokensForTokens(
                    amountIn, amountOutMin, path, walletAddress, deadline,
                    { gasLimit: ethers.utils.hexlify(300000) }
                );
                setSwapStep("Waiting for confirmation…");
                const receipt = await swapTx.wait();
                if (receipt.status !== 1) throw new Error("Swap reverted on-chain.");
            }

            // ══════════════════════════════════════════════
            //  ✅ USDT → WBNB  (PancakeSwap: token → token)
            // ══════════════════════════════════════════════
            else if (from === "USDT" && to === "WBNB") {
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
                const swapTx = await router.swapExactTokensForTokens(
                    amountIn, amountOutMin, path, walletAddress, deadline,
                    { gasLimit: ethers.utils.hexlify(300000) }
                );
                setSwapStep("Waiting for confirmation…");
                const receipt = await swapTx.wait();
                if (receipt.status !== 1) throw new Error("Swap reverted on-chain.");
            }

            else {
                throw new Error(`Swap pair ${from} → ${to} is not supported.`);
            }

            // ── Success ───────────────────────────────────────────────────────
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

    // ── Render ────────────────────────────────────────────────────────────────

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

                        {/* ── Header ───────────────────────────────────────── */}
                        <div className="px-4 pt-5 pb-4 border-b border-white/[0.06]">
                            <div className="flex items-center justify-between mb-4">
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
                                className="group flex items-center gap-2 mb-4 touch-manipulation"
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
                                    <span className="text-[2.2rem] font-extralight tracking-tight leading-none text-white">
                                        ${displayTotalBalance}
                                    </span>
                                    <button
                                        onClick={() => { fetchBalances(); fetchInnerBalances(); }}
                                        disabled={isLoadingBalances}
                                        className="mb-1 p-1.5 rounded-lg hover:bg-white/5 transition-colors touch-manipulation"
                                    >
                                        <RefreshCw className={`h-3.5 w-3.5 text-zinc-600 ${isLoadingBalances ? "animate-spin" : ""}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Tabs ─────────────────────────────────────────── */}
                        <div className="flex px-4 border-b border-white/[0.06]">
                            {(["portfolio", "swap"] as ActiveTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-3 mr-5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-all border-b-[1.5px] -mb-px touch-manipulation ${
                                        activeTab === tab
                                            ? "border-white text-white"
                                            : "border-transparent text-zinc-600 hover:text-zinc-400"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* ── Content ──────────────────────────────────────── */}
                        <div className="flex-1 px-4 py-4 space-y-5">

                            {/* ─── PORTFOLIO TAB ────────────────────────────── */}
                            {activeTab === "portfolio" && (
                                <>
                                    {liveInnerBalances.length > 0 && (
                                        <section>
                                            <div className="flex items-center justify-between mb-2.5">
                                                <p className="text-[10px] tracking-[0.14em] text-zinc-600 uppercase">
                                                    Inner Balance
                                                </p>
                                                <button
                                                    onClick={fetchInnerBalances}
                                                    disabled={isLoadingInner}
                                                    className="p-1 rounded-lg hover:bg-white/5 transition-colors touch-manipulation"
                                                >
                                                    <RefreshCw className={`h-3 w-3 text-zinc-700 ${isLoadingInner ? "animate-spin" : ""}`} />
                                                </button>
                                            </div>
                                            <div className="space-y-1">
                                                {liveInnerBalances.map((token, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => handleTokenClick(token)}
                                                        className={`flex items-center justify-between px-3 py-3 rounded-xl border transition-all ${
                                                            token.isHorseToken
                                                                ? "border-amber-900/30 bg-amber-950/10 hover:bg-amber-950/20 cursor-pointer active:bg-amber-950/30"
                                                                : "border-white/5 hover:border-white/10 cursor-default"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
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
                                                            {isLoadingInner && token.symbol === "ENR" ? (
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <RefreshCw className="h-3 w-3 text-zinc-600 animate-spin" />
                                                                    <span className="text-[11px] text-zinc-600">Loading…</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <p className="text-sm font-medium tabular-nums">{token.balance}</p>
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
                                                        className="flex items-center justify-between px-3 py-3 rounded-xl border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.02] transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
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

                            {/* ─── SWAP TAB ──────────────────────────────────── */}
                            {activeTab === "swap" && (
                                <div className="space-y-3">

                                    {/* Mode tabs */}
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
                                                    setShowFromPicker(false);
                                                    setShowToPicker(false);
                                                }}
                                                className={`flex-1 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-all touch-manipulation ${
                                                    swapMode === tab.id
                                                        ? "bg-white text-black"
                                                        : "text-zinc-600 hover:text-zinc-400"
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* ══ FREE SWAP MODE ══ */}
                                    {swapMode === "free" && (
                                        <>
                                            {/* FROM card */}
                                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-[11px] text-zinc-600">You pay</span>
                                                    <button
                                                        className="text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors tabular-nums touch-manipulation"
                                                        onClick={() => setSwapAmount(getTokenBalance(swapDir.from))}
                                                    >
                                                        Balance:{" "}
                                                        <span className="text-zinc-400">{getTokenBalance(swapDir.from)}</span>
                                                    </button>
                                                </div>

                                                {/* Token selector + amount input row */}
                                                <div className="flex items-center gap-2">
                                                    <TokenPicker
                                                        value={swapDir.from}
                                                        disabledValue={swapDir.to}
                                                        show={showFromPicker}
                                                        onToggle={() => {
                                                            setShowFromPicker((v) => !v);
                                                            setShowToPicker(false);
                                                        }}
                                                        onSelect={(sym) => {
                                                            setSwapDir((prev) => ({ ...prev, from: sym }));
                                                            setSwapAmount("");
                                                            setSwapEstimate("");
                                                            setSwapError("");
                                                            setShowFromPicker(false);
                                                        }}
                                                        pickerRef={fromPickerRef}
                                                        dropdownSide="left"
                                                    />
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
                                                        className="flex-1 min-w-0 bg-transparent text-right text-xl font-extralight text-white placeholder-zinc-700 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>

                                                {/* % quick-fill buttons */}
                                                <div className="flex justify-end gap-1.5 mt-2.5">
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
                                                            className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.05] text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.07] transition-all font-medium touch-manipulation"
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Flip button */}
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={flipSwapDir}
                                                    className="group h-9 w-9 rounded-full border border-white/[0.08] bg-[#080808] hover:bg-white/[0.05] flex items-center justify-center transition-all hover:border-white/20 hover:scale-110 active:scale-95 touch-manipulation"
                                                >
                                                    <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                                                </button>
                                            </div>

                                            {/* TO card */}
                                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-[11px] text-zinc-600">You receive</span>
                                                    <span className="text-[11px] text-zinc-600 tabular-nums">
                                                        Balance:{" "}
                                                        <span className="text-zinc-400">{getTokenBalance(swapDir.to)}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <TokenPicker
                                                        value={swapDir.to}
                                                        disabledValue={swapDir.from}
                                                        show={showToPicker}
                                                        onToggle={() => {
                                                            setShowToPicker((v) => !v);
                                                            setShowFromPicker(false);
                                                        }}
                                                        onSelect={(sym) => {
                                                            setSwapDir((prev) => ({ ...prev, to: sym }));
                                                            setSwapAmount("");
                                                            setSwapEstimate("");
                                                            setSwapError("");
                                                            setShowToPicker(false);
                                                        }}
                                                        pickerRef={toPickerRef}
                                                        dropdownSide="right"
                                                    />
                                                    <div className="flex-1 min-w-0 text-right text-xl font-extralight text-zinc-500 tabular-nums truncate">
                                                        {swapEstimate || "0.00"}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rate + slippage row */}
                                            <div className="flex flex-col gap-1.5 px-1">
                                                {swapEstimate && swapAmount && (
                                                    <div className="flex justify-between items-center">
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
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[11px] text-zinc-700">Slippage</span>
                                                    <span className="text-[11px] text-zinc-600">1.0%</span>
                                                </div>
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
                                                className="w-full py-4 rounded-2xl bg-white text-black text-[13px] font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-25 disabled:cursor-not-allowed touch-manipulation"
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

                                    {/* ══ COMING SOON MODE ══ */}
                                    {swapMode === "coming_soon" && (
                                        <div className="flex flex-col items-center justify-center py-10 px-4 gap-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="h-12 w-12 rounded-full bg-zinc-900 border border-amber-900/30 flex items-center justify-center overflow-hidden">
                                                        <Image src="/horse-token-img.png" alt="HRS" width={48} height={48} className="object-cover" />
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-zinc-400">HRS</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1 mx-1">
                                                    <div className="h-px w-8 bg-zinc-800" />
                                                    <ArrowUpDown className="h-3.5 w-3.5 text-zinc-600" />
                                                    <div className="h-px w-8 bg-zinc-800" />
                                                </div>
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="h-12 w-12 rounded-full bg-zinc-900 border border-white/[0.05] flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src="https://upload.wikimedia.org/wikipedia/commons/0/01/USDT_Logo.png"
                                                            alt="USDT"
                                                            width={40}
                                                            height={40}
                                                            style={{ borderRadius: "50%", objectFit: "cover" }}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-zinc-400">USDT</span>
                                                </div>
                                            </div>

                                            <div className="px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03]">
                                                <span className="text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
                                                    Coming Soon
                                                </span>
                                            </div>

                                            <p className="text-center text-[12px] text-zinc-600 leading-relaxed max-w-[220px]">
                                                Swapping HRS tokens to USDT will be available in an upcoming update.
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
                            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors px-4 pt-5 pb-4 touch-manipulation"
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