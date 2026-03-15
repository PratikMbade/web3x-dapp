/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// components/HorseTokenDetail.tsx
"use client";

import { Button } from "@/components/ui/button";
import { icoContractInstance } from "@/contract/ico-contract/ico-contract";
import { ArrowLeft, Coins, Gift, ExternalLink, Clock, RefreshCw, Lock } from "lucide-react";
import Image from "next/image";
import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { formatUnits } from "ethers/lib/utils";
import { toast } from "sonner";
import { horseTokenContractInstance } from "@/contract/horse-token-contract/contract-instance";

interface ClaimHistory {
    type: "ico" | "gift";
    amount: string;
    date: string;
    txHash?: string;
    usdValue: string;
}

interface HorseTokenDetailProps {
    onBack: () => void;
}

interface ICOVestingData {
    lockedAmt: string;
    claimedAmt: string;
    lastClaimTime: number;
    remaining: string;
}

interface GiftVestingData {
    lockedAmt: string;
    claimedAmt: string;
    package: string;
    lastClaimTime: number;
    remaining: string;
}

export function HorseTokenDetail({onBack}:HorseTokenDetailProps) {
    const activeAccount = useActiveAccount();
    const [balance, setBalance] = useState('0');
    const [icoVestingData, setIcoVestingData] = useState<ICOVestingData | null>(null);
    const [giftVestingData, setGiftVestingData] = useState<GiftVestingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [claimingIco, setClaimingIco] = useState(false);
    const [claimingGift, setClaimingGift] = useState(false);
    const [unlockingGift, setUnlockingGift] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

    const CLAIM_INTERVAL = 86400; // 5 minutes in seconds

    const formatDate = useCallback((dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }, []);

    const shortenHash = useCallback((hash: string) => {
        return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
    }, []);

    // ==================== ICO VESTING LOGIC ====================
    
    const isIcoClaimAvailable = useMemo(() => {
        if (!icoVestingData) return false;
        if (parseFloat(icoVestingData.remaining) <= 0) return false;
        const timeSinceLastClaim = currentTime - icoVestingData.lastClaimTime;
        return timeSinceLastClaim >= CLAIM_INTERVAL;
    }, [icoVestingData, currentTime]);

    const nextIcoClaimTime = useMemo(() => {
        if (!icoVestingData) return 0;
        return icoVestingData.lastClaimTime + CLAIM_INTERVAL;
    }, [icoVestingData]);

    const timeUntilNextIcoClaim = useMemo(() => {
        if (!icoVestingData) return "";
        if (parseFloat(icoVestingData.remaining) <= 0) return "Buy Tokens in ICO";
        
        const diff = nextIcoClaimTime - currentTime;
        if (diff <= 0) return "Available now";

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    }, [icoVestingData, currentTime, nextIcoClaimTime]);

const currentIcoAvailable = useMemo(() => {
    if (!icoVestingData) return "0";
    
    const remainingNum = parseFloat(icoVestingData.remaining);
    if (remainingNum <= 0 || !isIcoClaimAvailable) return "0";
    
    const timeSinceLastClaim = currentTime - icoVestingData.lastClaimTime;
    const intervalsPassed = Math.floor(timeSinceLastClaim / CLAIM_INTERVAL);
    if (intervalsPassed < 1) return "0";
    
    const lockedAmount = parseFloat(icoVestingData.lockedAmt);
    // Always 0.5% of lockedAmt — fixed daily amount, never accumulates
    const dailyClaimable = lockedAmount * 0.005;
    const calculated = Math.min(dailyClaimable, remainingNum);
    
    return calculated.toFixed(2);
}, [icoVestingData, currentTime, isIcoClaimAvailable]);

    // ==================== GIFT VESTING LOGIC ====================
    
    const isGiftLocked = useMemo(() => {
        if (!giftVestingData) return true;
        return parseFloat(giftVestingData.lockedAmt) === 0;
    }, [giftVestingData]);

    const isGiftClaimAvailable = useMemo(() => {
        if (!giftVestingData || isGiftLocked) return false;
        if (parseFloat(giftVestingData.remaining) <= 0) return false;
        
        const timeSinceLastClaim = currentTime - giftVestingData.lastClaimTime;
        return timeSinceLastClaim >= CLAIM_INTERVAL;
    }, [giftVestingData, currentTime, isGiftLocked]);

    const nextGiftClaimTime = useMemo(() => {
        if (!giftVestingData) return 0;
        return giftVestingData.lastClaimTime + CLAIM_INTERVAL;
    }, [giftVestingData]);

    const timeUntilNextGiftClaim = useMemo(() => {
        if (!giftVestingData) return "";
        if (isGiftLocked) return "Locked";
        if (parseFloat(giftVestingData.remaining) <= 0) return "No tokens left";
        
        const diff = nextGiftClaimTime - currentTime;
        if (diff <= 0) return "Available now";

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    }, [giftVestingData, currentTime, nextGiftClaimTime, isGiftLocked]);


const currentGiftAvailable = useMemo(() => {
    if (!giftVestingData || isGiftLocked) return "0";
    
    const remainingNum = parseFloat(giftVestingData.remaining);
    if (remainingNum <= 0 || !isGiftClaimAvailable) return "0";
    
    const timeSinceLastClaim = currentTime - giftVestingData.lastClaimTime;
    const intervalsPassed = Math.floor(timeSinceLastClaim / CLAIM_INTERVAL);
    if (intervalsPassed < 1) return "0";
    
    const lockedAmount = parseFloat(giftVestingData.lockedAmt);
    // Always 0.5% of lockedAmt — fixed daily amount, never accumulates
    const dailyClaimable = lockedAmount * 0.005;
    const calculated = Math.min(dailyClaimable, remainingNum);
    
    return calculated.toFixed(2);
}, [giftVestingData, currentTime, isGiftClaimAvailable, isGiftLocked]);

    // ==================== DATA FETCHING ====================
    
    // Fetch horse token balance
    const getUserHorseTokenBalance = useCallback(async () => {
        try {
            if (!activeAccount) return;

            const horseTokenInsta = await horseTokenContractInstance(activeAccount);
            const data = await horseTokenInsta.balanceOf(activeAccount.address);
            const userBalance = formatUnits(data, 18);
            
            setBalance(parseFloat(userBalance).toFixed(2));
        } catch (error) {
            console.error("Error fetching horse token balance:", error);
        }
    }, [activeAccount]);
    
    // Fetch ICO vesting data
    const getUserICOView = useCallback(async () => {
        try {
            if (!activeAccount) return;

            const icoContractInsta = await icoContractInstance(activeAccount);
            const userIcoViewData = await icoContractInsta.userHRSIcoLiveView(activeAccount.address);

            const vestingData: ICOVestingData = {
                lockedAmt: formatUnits(userIcoViewData[0], 18),
                claimedAmt: formatUnits(userIcoViewData[1], 18),
                lastClaimTime: userIcoViewData[2].toNumber(),
                remaining: formatUnits(userIcoViewData[3], 18),
            };

            setIcoVestingData(vestingData);
        } catch (error) {
            console.error("Error fetching ICO vesting data:", error);
        }
    }, [activeAccount]);

    // Fetch gift vesting data
    const getGiftVestingFromContract = useCallback(async () => {
        try {
            if (!activeAccount) return;

            const icoContractInsta = await icoContractInstance(activeAccount);
            const data = await icoContractInsta.userHRSGiftLiveView(activeAccount.address);

            const giftData: GiftVestingData = {
                lockedAmt: formatUnits(data[0], 18),
                claimedAmt: formatUnits(data[1], 18),
                package: data[2].toString(),
                lastClaimTime: data[3].toNumber(),
                remaining: formatUnits(data[4], 18),
            };
            console.log('Gift vesting data fetched:', giftData);

            setGiftVestingData(giftData);
        } catch (error) {
            console.error("Error fetching gift vesting data:", error);
        }
    }, [activeAccount]);

    // Fetch all data in parallel for optimal performance
    const fetchAllVestingData = useCallback(async (showToast = false) => {
        try {
            if (!activeAccount) {
                setLoading(false);
                return;
            }

            if (showToast) setRefreshing(true);

            // Fetch all data simultaneously for instant loading
            await Promise.all([
                getUserHorseTokenBalance(),
                getUserICOView(),
                getGiftVestingFromContract()
            ]);

            setLoading(false);
            setRefreshing(false);

            if (showToast) toast.success("Data refreshed successfully");
        } catch (error) {
            console.error("Error fetching vesting data:", error);
            setLoading(false);
            setRefreshing(false);
            
            if (showToast) toast.error("Failed to refresh data");
        }
    }, [activeAccount, getUserHorseTokenBalance, getUserICOView, getGiftVestingFromContract]);

    // ==================== CLAIM HANDLERS ====================
    
    const onIcoVestingClaim = useCallback(async () => {
        try {
            if (!activeAccount) {
                toast.info("Please connect the wallet");
                return;
            }

            if (parseFloat(icoVestingData?.remaining || "0") === 0) {
                toast.info("No tokens remaining to claim");
                return;
            }

            if (!isIcoClaimAvailable) {
                const timeLeft = nextIcoClaimTime - currentTime;
                const minutesLeft = Math.ceil(timeLeft / 60);
                toast.info(`Please wait ${minutesLeft} minute(s) before claiming again`);
                return;
            }

            if (parseFloat(currentIcoAvailable) === 0) {
                toast.info("No tokens available to claim at this time");
                return;
            }

            setClaimingIco(true);
            toast.loading('Transaction pending...', { id: 'claim-ico' });

            const icoInsta = await icoContractInstance(activeAccount);
            const tx = await icoInsta.claimHRSIcoLock(activeAccount.address);
            await tx.wait();

            toast.success('ICO vesting claimed successfully 🎉', { id: 'claim-ico' });
            await fetchAllVestingData(false);
            
        } catch (error: any) {
            console.error('Error claiming ICO tokens:', error);

            if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
                toast.error('Transaction cancelled by user', { id: 'claim-ico' });
                return;
            }

            const revertReason =
                error?.reason || 
                error?.shortMessage || 
                error?.message?.split('(')[0] || 
                'Transaction failed';

            toast.error(revertReason, { id: 'claim-ico' });
        } finally {
            setClaimingIco(false);
        }
    }, [activeAccount, currentIcoAvailable, fetchAllVestingData, isIcoClaimAvailable, icoVestingData?.remaining, nextIcoClaimTime, currentTime]);

    const onGiftVestingUnlock = useCallback(async () => {
        try {
            if (!activeAccount) {
                toast.info("Please connect the wallet");
                return;
            }

            setUnlockingGift(true);
            toast.loading('Unlocking gift vesting...', { id: 'unlock-gift' });

            const icoInsta = await icoContractInstance(activeAccount);
            const tx = await icoInsta.matrixHRSGiftLock(activeAccount.address);
            await tx.wait();

            toast.success('Gift vesting unlocked successfully 🎉', { id: 'unlock-gift' });
            await fetchAllVestingData(false);
            
        } catch (error: any) {
            console.error('Error unlocking gift vesting:', error);

            if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
                toast.error('Transaction cancelled by user', { id: 'unlock-gift' });
                return;
            }

            const revertReason =
                error?.reason || 
                error?.shortMessage || 
                error?.message?.split('(')[0] || 
                'Transaction failed';

            toast.error(revertReason, { id: 'unlock-gift' });
        } finally {
            setUnlockingGift(false);
        }
    }, [activeAccount, fetchAllVestingData]);

    const onGiftVestingClaim = useCallback(async () => {
        try {
            if (!activeAccount) {
                toast.info("Please connect the wallet");
                return;
            }

            if (isGiftLocked) {
                toast.info("Please unlock gift vesting first");
                return;
            }

            if (parseFloat(giftVestingData?.remaining || "0") === 0) {
                toast.info("No tokens remaining to claim");
                return;
            }

            if (!isGiftClaimAvailable) {
                const timeLeft = nextGiftClaimTime - currentTime;
                const minutesLeft = Math.ceil(timeLeft / 60);
                toast.info(`Please wait ${minutesLeft} minute(s) before claiming again`);
                return;
            }

            if (parseFloat(currentGiftAvailable) === 0) {
                toast.info("No tokens available to claim at this time");
                return;
            }

            setClaimingGift(true);
            toast.loading('Transaction pending...', { id: 'claim-gift' });

            const icoInsta = await icoContractInstance(activeAccount);
            const tx = await icoInsta.claimMatrixGift(activeAccount.address);
            await tx.wait();

            toast.success('Gift vesting claimed successfully 🎉', { id: 'claim-gift' });
            await fetchAllVestingData(false);
            
        } catch (error: any) {
            console.error('Error claiming gift tokens:', error);

            if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
                toast.error('Transaction cancelled by user', { id: 'claim-gift' });
                return;
            }

            const revertReason =
                error?.reason || 
                error?.shortMessage || 
                error?.message?.split('(')[0] || 
                'Transaction failed';

            toast.error(revertReason, { id: 'claim-gift' });
        } finally {
            setClaimingGift(false);
        }
    }, [activeAccount, currentGiftAvailable, fetchAllVestingData, isGiftClaimAvailable, giftVestingData?.remaining, nextGiftClaimTime, currentTime, isGiftLocked]);

    const handleManualRefresh = useCallback(() => {
        fetchAllVestingData(true);
    }, [fetchAllVestingData]);

    // ==================== EFFECTS ====================
    
    useEffect(() => {
        fetchAllVestingData(false);
    }, [fetchAllVestingData]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Math.floor(Date.now() / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchAllVestingData(false);
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchAllVestingData]);

    return (
        <div className="h-full flex flex-col p-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 hover:bg-zinc-800"
                        onClick={onBack}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-xl font-semibold">Horse Token Details</h2>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 hover:bg-zinc-800"
                    onClick={handleManualRefresh}
                    disabled={refreshing || loading}
                >
                    <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* Token Balance Card */}
            <div className="bg-gradient-to-br from-amber-900/20 to-amber-700/20 border border-amber-700/30 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <Image
                        src="/horse-token-img.png"
                        alt="horse-token"
                        width={56}
                        height={56}
                    />
                    <div>
                        <p className="text-sm text-zinc-400">Your Balance</p>
                        <h3 className="text-3xl font-bold text-amber-500">{balance} HRS</h3>
                        <p className="text-sm text-zinc-400">{}</p>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
                        <p className="text-sm text-zinc-400">Loading vesting data...</p>
                    </div>
                </div>
            )}

            {/* ICO Vesting Stats */}
            {!loading && icoVestingData && (
                <>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-zinc-900/50 border border-zinc-700/30 rounded-lg p-3">
                            <p className="text-xs text-zinc-400 mb-1">ICO Locked</p>
                            <p className="text-lg font-semibold text-white">
                                {parseFloat(icoVestingData.lockedAmt).toFixed(2)} HRS
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-700/30 rounded-lg p-3">
                            <p className="text-xs text-zinc-400 mb-1">ICO Claimed</p>
                            <p className="text-lg font-semibold text-green-500">
                                {parseFloat(icoVestingData.claimedAmt).toFixed(2)} HRS
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-700/30 rounded-lg p-3">
                            <p className="text-xs text-zinc-400 mb-1">ICO Remaining</p>
                            <p className="text-lg font-semibold text-amber-500">
                                {parseFloat(icoVestingData.remaining).toFixed(2)} HRS
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-700/30 rounded-lg p-3">
                            <div className="flex items-center gap-1 mb-1">
                                <Clock className="h-3 w-3 text-zinc-400" />
                                <p className="text-xs text-zinc-400">Next ICO Claim</p>
                            </div>
                            <p className="text-sm font-semibold text-blue-400">{timeUntilNextIcoClaim}</p>
                        </div>
                    </div>

                    {/* Gift Vesting Stats */}
                    {giftVestingData && !isGiftLocked && (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-zinc-900/50 border border-purple-700/30 rounded-lg p-3">
                                <p className="text-xs text-zinc-400 mb-1">Gift Locked</p>
                                <p className="text-lg font-semibold text-white">
                                    {parseFloat(giftVestingData.lockedAmt).toFixed(2)} HRS
                                </p>
                            </div>
                            <div className="bg-zinc-900/50 border border-purple-700/30 rounded-lg p-3">
                                <p className="text-xs text-zinc-400 mb-1">Gift Claimed</p>
                                <p className="text-lg font-semibold text-green-500">
                                    {parseFloat(giftVestingData.claimedAmt).toFixed(2)} HRS
                                </p>
                            </div>
                            <div className="bg-zinc-900/50 border border-purple-700/30 rounded-lg p-3">
                                <p className="text-xs text-zinc-400 mb-1">Gift Remaining</p>
                                <p className="text-lg font-semibold text-purple-500">
                                    {parseFloat(giftVestingData.remaining).toFixed(2)} HRS
                                </p>
                            </div>
                            <div className="bg-zinc-900/50 border border-purple-700/30 rounded-lg p-3">
                                <div className="flex items-center gap-1 mb-1">
                                    <Clock className="h-3 w-3 text-zinc-400" />
                                    <p className="text-xs text-zinc-400">Next Gift Claim</p>
                                </div>
                                <p className="text-sm font-semibold text-purple-400">{timeUntilNextGiftClaim}</p>
                            </div>
                        </div>
                    )}

                    {/* Vesting Claim Buttons */}
                    <div className="space-y-3 mb-6">
                        {/* ICO Vesting Claim */}
                        <div className="bg-zinc-900/50 border border-amber-700/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Coins className="h-5 w-5 text-amber-500" />
                                    <span className="font-medium text-amber-500">ICO Vesting</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-400">Available</p>
                                    <p className="text-lg font-bold text-amber-400">
                                        {currentIcoAvailable} HRS
                                    </p>
                                </div>
                            </div>

                            <div className="mb-3 p-2 bg-amber-900/10 rounded border border-amber-700/20">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-400">Vesting Rate:</span>
                                    <span className="text-amber-400 font-medium">Every 24 hours</span>
                                </div>
                                <div className="flex items-center justify-between text-xs mt-1">
                                    <span className="text-zinc-400">Next unlock:</span>
                                    <span className="text-amber-400 font-medium">{timeUntilNextIcoClaim}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-amber-900/30 hover:bg-amber-900/50 text-amber-500 border border-amber-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={onIcoVestingClaim}
                                disabled={!isIcoClaimAvailable || claimingIco || parseFloat(icoVestingData.remaining) === 0}
                            >
                                {claimingIco ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Claiming...
                                    </span>
                                ) : !isIcoClaimAvailable && parseFloat(icoVestingData.remaining) > 0 ? (
                                    `Wait ${timeUntilNextIcoClaim}`
                                ) : parseFloat(icoVestingData.remaining) === 0 ? (
                                    "All Tokens Claimed"
                                ) : (
                                    "Claim ICO Vesting"
                                )}
                            </Button>
                        </div>

                        {/* Gift Vesting - Unlock or Claim */}
                        <div className="bg-zinc-900/50 border border-purple-700/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Gift className="h-5 w-5 text-purple-500" />
                                    <span className="font-medium text-purple-500">Gift Vesting</span>
                                </div>
                                {!isGiftLocked && (
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-400">Available</p>
                                        <p className="text-lg font-bold text-purple-400">
                                            {currentGiftAvailable} HRS
                                        </p>
                                    </div>
                                )}
                            </div>

                            {isGiftLocked ? (
                                <>
                                    <div className="mb-3 p-3 bg-purple-900/10 rounded border border-purple-700/20 text-center">
                                        <Lock className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                                        <p className="text-xs text-purple-300">
                                            Gift vesting is locked. Unlock to start vesting.
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full bg-purple-900/30 hover:bg-purple-900/50 text-purple-500 border border-purple-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={onGiftVestingUnlock}
                                        disabled={unlockingGift}
                                    >
                                        {unlockingGift ? (
                                            <span className="flex items-center gap-2">
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Unlocking...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Lock className="h-4 w-4" />
                                                Unlock Gift Vesting
                                            </span>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="mb-3 p-2 bg-purple-900/10 rounded border border-purple-700/20">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-400">Vesting Rate:</span>
                                            <span className="text-purple-400 font-medium">Every 24 hours</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs mt-1">
                                            <span className="text-zinc-400">Next unlock:</span>
                                            <span className="text-purple-400 font-medium">{timeUntilNextGiftClaim}</span>
                                        </div>
                                        {giftVestingData && (
                                            <div className="flex items-center justify-between text-xs mt-1">
                                                <span className="text-zinc-400">Package:</span>
                                                <span className="text-purple-400 font-medium">#{giftVestingData.package}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        className="w-full bg-purple-900/30 hover:bg-purple-900/50 text-purple-500 border border-purple-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={onGiftVestingClaim}
                                        disabled={!isGiftClaimAvailable || claimingGift || parseFloat(giftVestingData?.remaining || "0") === 0}
                                    >
                                        {claimingGift ? (
                                            <span className="flex items-center gap-2">
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Claiming...
                                            </span>
                                        ) : !isGiftClaimAvailable && parseFloat(giftVestingData?.remaining || "0") > 0 ? (
                                            `Wait ${timeUntilNextGiftClaim}`
                                        ) : parseFloat(giftVestingData?.remaining || "0") === 0 ? (
                                            "All Tokens Claimed"
                                        ) : (
                                            "Claim Gift Vesting"
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Claim History */}
            <div className="flex-1 overflow-y-auto">
                <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase">Claim History</h3>
{/* 
                <div className="space-y-3">
                    {icoClaimHistory.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Coins className="h-4 w-4 text-amber-500" />
                                <p className="text-xs font-medium text-amber-500">ICO VESTING CLAIMS</p>
                            </div>
                            <div className="space-y-2">
                                {icoClaimHistory.map((claim, index) => (
                                    <div
                                        key={`ico-${index}`}
                                        className="bg-zinc-900/50 border border-amber-700/20 rounded-lg p-3"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">Claimed</span>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-amber-500">
                                                    {claim.amount} HRS
                                                </p>
                                                <p className="text-xs text-zinc-400">{claim.usdValue}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-zinc-500">{formatDate(claim.date)}</p>
                                            {claim.txHash && (
                                                <a
                                                    href={`https://etherscan.io/tx/${claim.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400"
                                                >
                                                    {shortenHash(claim.txHash)}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {giftClaimHistory.length > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Gift className="h-4 w-4 text-purple-500" />
                                <p className="text-xs font-medium text-purple-500">GIFT VESTING CLAIMS</p>
                            </div>
                            <div className="space-y-2">
                                {giftClaimHistory.map((claim, index) => (
                                    <div
                                        key={`gift-${index}`}
                                        className="bg-zinc-900/50 border border-purple-700/20 rounded-lg p-3"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">Claimed</span>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-purple-500">
                                                    {claim.amount} HRS
                                                </p>
                                                <p className="text-xs text-zinc-400">{claim.usdValue}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-zinc-500">{formatDate(claim.date)}</p>
                                            {claim.txHash && (
                                                <a
                                                    href={`https://etherscan.io/tx/${claim.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-400"
                                                >
                                                    {shortenHash(claim.txHash)}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {icoClaimHistory.length === 0 && giftClaimHistory.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-sm text-zinc-500">No claim history yet</p>
                        </div>
                    )}
                </div> */}
            </div>
        </div>
    );
}