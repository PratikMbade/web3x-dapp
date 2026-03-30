/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// components/HorseTokenDetail.tsx
"use client";

import { Button } from "@/components/ui/button";
import { icoContractInstance } from "@/contract/ico-contract/ico-contract";
import { ArrowLeft, Coins, Gift, ExternalLink, Clock, RefreshCw, Lock, ChevronRight } from "lucide-react";
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

// ─── Tiny stat cell ──────────────────────────────────────────────────────────

function Stat({
    label,
    value,
    valueClass = "text-white",
}: {
    label: string;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] tracking-[0.12em] uppercase text-zinc-600 font-medium">
                {label}
            </span>
            <span className={`text-[15px] font-semibold tabular-nums leading-none ${valueClass}`}>
                {value}
            </span>
        </div>
    );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
    return <div className="h-px bg-white/[0.05] my-1" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HorseTokenDetail({ onBack }: HorseTokenDetailProps) {
    const activeAccount = useActiveAccount();
    const [balance, setBalance] = useState("0");
    const [icoVestingData, setIcoVestingData] = useState<ICOVestingData | null>(null);
    const [giftVestingData, setGiftVestingData] = useState<GiftVestingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [claimingIco, setClaimingIco] = useState(false);
    const [claimingGift, setClaimingGift] = useState(false);
    const [unlockingGift, setUnlockingGift] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

    const CLAIM_INTERVAL = 86400;

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
        const dailyClaimable = lockedAmount * 0.005;
        const calculated = Math.min(dailyClaimable, remainingNum);
        return calculated.toFixed(2);
    }, [giftVestingData, currentTime, isGiftClaimAvailable, isGiftLocked]);

    // ==================== DATA FETCHING ====================

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

    const getUserICOView = useCallback(async () => {
        try {
            if (!activeAccount) return;
            const icoContractInsta = await icoContractInstance(activeAccount);
            const userIcoViewData = await icoContractInsta.userHRSIcoLiveView(activeAccount.address);
            setIcoVestingData({
                lockedAmt: formatUnits(userIcoViewData[0], 18),
                claimedAmt: formatUnits(userIcoViewData[1], 18),
                lastClaimTime: userIcoViewData[2].toNumber(),
                remaining: formatUnits(userIcoViewData[3], 18),
            });
        } catch (error) {
            console.error("Error fetching ICO vesting data:", error);
        }
    }, [activeAccount]);

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
            console.log("Gift vesting data fetched:", giftData);
            setGiftVestingData(giftData);
        } catch (error) {
            console.error("Error fetching gift vesting data:", error);
        }
    }, [activeAccount]);

    const fetchAllVestingData = useCallback(
        async (showToast = false) => {
            try {
                if (!activeAccount) { setLoading(false); return; }
                if (showToast) setRefreshing(true);
                await Promise.all([getUserHorseTokenBalance(), getUserICOView(), getGiftVestingFromContract()]);
                setLoading(false);
                setRefreshing(false);
                if (showToast) toast.success("Data refreshed successfully");
            } catch (error) {
                console.error("Error fetching vesting data:", error);
                setLoading(false);
                setRefreshing(false);
                if (showToast) toast.error("Failed to refresh data");
            }
        },
        [activeAccount, getUserHorseTokenBalance, getUserICOView, getGiftVestingFromContract]
    );

    // ==================== CLAIM HANDLERS ====================

    const onIcoVestingClaim = useCallback(async () => {
        try {
            if (!activeAccount) { toast.info("Please connect the wallet"); return; }
            if (parseFloat(icoVestingData?.remaining || "0") === 0) { toast.info("No tokens remaining to claim"); return; }
            if (!isIcoClaimAvailable) {
                const timeLeft = nextIcoClaimTime - currentTime;
                toast.info(`Please wait ${Math.ceil(timeLeft / 60)} minute(s) before claiming again`);
                return;
            }
            if (parseFloat(currentIcoAvailable) === 0) { toast.info("No tokens available to claim at this time"); return; }
            setClaimingIco(true);
            toast.loading("Transaction pending...", { id: "claim-ico" });
            const icoInsta = await icoContractInstance(activeAccount);
            const tx = await icoInsta.claimHRSIcoLock(activeAccount.address);
            await tx.wait();
            toast.success("ICO vesting claimed successfully 🎉", { id: "claim-ico" });
            await fetchAllVestingData(false);
        } catch (error: any) {
            console.error("Error claiming ICO tokens:", error);
            if (error?.code === "ACTION_REJECTED" || error?.code === 4001) { toast.error("Transaction cancelled by user", { id: "claim-ico" }); return; }
            toast.error(error?.reason || error?.shortMessage || error?.message?.split("(")[0] || "Transaction failed", { id: "claim-ico" });
        } finally { setClaimingIco(false); }
    }, [activeAccount, currentIcoAvailable, fetchAllVestingData, isIcoClaimAvailable, icoVestingData?.remaining, nextIcoClaimTime, currentTime]);

    const onGiftVestingUnlock = useCallback(async () => {
        try {
            if (!activeAccount) { toast.info("Please connect the wallet"); return; }
            setUnlockingGift(true);
            toast.loading("Unlocking gift vesting...", { id: "unlock-gift" });
            const icoInsta = await icoContractInstance(activeAccount);
            const tx = await icoInsta.matrixHRSGiftLock(activeAccount.address);
            await tx.wait();
            toast.success("Gift vesting unlocked successfully 🎉", { id: "unlock-gift" });
            await fetchAllVestingData(false);
        } catch (error: any) {
            console.error("Error unlocking gift vesting:", error);
            if (error?.code === "ACTION_REJECTED" || error?.code === 4001) { toast.error("Transaction cancelled by user", { id: "unlock-gift" }); return; }
            toast.error(error?.reason || error?.shortMessage || error?.message?.split("(")[0] || "Transaction failed", { id: "unlock-gift" });
        } finally { setUnlockingGift(false); }
    }, [activeAccount, fetchAllVestingData]);

    const onGiftVestingClaim = useCallback(async () => {
        try {
            if (!activeAccount) { toast.info("Please connect the wallet"); return; }
            if (isGiftLocked) { toast.info("Please unlock gift vesting first"); return; }
            if (parseFloat(giftVestingData?.remaining || "0") === 0) { toast.info("No tokens remaining to claim"); return; }
            if (!isGiftClaimAvailable) {
                const timeLeft = nextGiftClaimTime - currentTime;
                toast.info(`Please wait ${Math.ceil(timeLeft / 60)} minute(s) before claiming again`);
                return;
            }
            if (parseFloat(currentGiftAvailable) === 0) { toast.info("No tokens available to claim at this time"); return; }
            setClaimingGift(true);
            toast.loading("Transaction pending...", { id: "claim-gift" });
            const icoInsta = await icoContractInstance(activeAccount);
            const tx = await icoInsta.claimMatrixGift(activeAccount.address);
            await tx.wait();
            toast.success("Gift vesting claimed successfully 🎉", { id: "claim-gift" });
            await fetchAllVestingData(false);
        } catch (error: any) {
            console.error("Error claiming gift tokens:", error);
            if (error?.code === "ACTION_REJECTED" || error?.code === 4001) { toast.error("Transaction cancelled by user", { id: "claim-gift" }); return; }
            toast.error(error?.reason || error?.shortMessage || error?.message?.split("(")[0] || "Transaction failed", { id: "claim-gift" });
        } finally { setClaimingGift(false); }
    }, [activeAccount, currentGiftAvailable, fetchAllVestingData, isGiftClaimAvailable, giftVestingData?.remaining, nextGiftClaimTime, currentTime, isGiftLocked]);

    const handleManualRefresh = useCallback(() => { fetchAllVestingData(true); }, [fetchAllVestingData]);

    // ==================== EFFECTS ====================

    useEffect(() => { fetchAllVestingData(false); }, [fetchAllVestingData]);

    useEffect(() => {
        const interval = setInterval(() => { setCurrentTime(Math.floor(Date.now() / 1000)); }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => { fetchAllVestingData(false); }, 30000);
        return () => clearInterval(interval);
    }, [fetchAllVestingData]);

    // ── Progress bar helper ────────────────────────────────────────────────────
    const icoProgress = useMemo(() => {
        if (!icoVestingData) return 0;
        const locked = parseFloat(icoVestingData.lockedAmt);
        const claimed = parseFloat(icoVestingData.claimedAmt);
        if (locked <= 0) return 0;
        return Math.min(100, (claimed / locked) * 100);
    }, [icoVestingData]);

    const giftProgress = useMemo(() => {
        if (!giftVestingData || isGiftLocked) return 0;
        const locked = parseFloat(giftVestingData.lockedAmt);
        const claimed = parseFloat(giftVestingData.claimedAmt);
        if (locked <= 0) return 0;
        return Math.min(100, (claimed / locked) * 100);
    }, [giftVestingData, isGiftLocked]);

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div
            className="flex flex-col px-4 pb-8"
            style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
        >
            {/* ── Top bar ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between py-4 mb-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-[12px] touch-manipulation"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span className="tracking-wide">Back</span>
                </button>

                <button
                    onClick={handleManualRefresh}
                    disabled={refreshing || loading}
                    className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors disabled:opacity-40 touch-manipulation"
                >
                    <RefreshCw className={`h-3.5 w-3.5 text-zinc-500 ${refreshing ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* ── Hero balance ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 mb-6 px-1">
                <div className="relative shrink-0">
                    <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-white/[0.07] flex items-center justify-center overflow-hidden">
                        <Image src="/horse-token-img.png" alt="HRS" width={52} height={52} className="object-cover" />
                    </div>
                    {/* tiny online dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-amber-500 border-2 border-[#080808]" />
                </div>
                <div>
                    <p className="text-[10px] tracking-[0.14em] uppercase text-zinc-600 mb-0.5">
                        HRS · Horse Token
                    </p>
                    <p className="text-[2rem] font-extralight tracking-tight text-white leading-none tabular-nums">
                        {balance}
                        <span className="text-[1rem] text-zinc-600 ml-1.5 font-light">HRS</span>
                    </p>
                </div>
            </div>

            {/* ── Loading skeleton ─────────────────────────────────────────── */}
            {loading && (
                <div className="flex flex-col items-center gap-3 py-16">
                    <RefreshCw className="h-5 w-5 text-zinc-700 animate-spin" />
                    <p className="text-[11px] tracking-widest uppercase text-zinc-700">Loading…</p>
                </div>
            )}

            {/* ── Data loaded ──────────────────────────────────────────────── */}
            {!loading && icoVestingData && (
                <div className="space-y-5">

                    {/* ── ICO VESTING PANEL ─────────────────────────────────── */}
                    <section>
                        {/* Section label */}
                        <div className="flex items-center gap-2 mb-3">
                            <Coins className="h-3.5 w-3.5 text-amber-500/70" />
                            <span className="text-[10px] tracking-[0.14em] uppercase text-zinc-600 font-semibold">
                                ICO Vesting
                            </span>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <Stat label="Locked" value={`${parseFloat(icoVestingData.lockedAmt).toFixed(2)} HRS`} />
                            <Stat label="Claimed" value={`${parseFloat(icoVestingData.claimedAmt).toFixed(2)} HRS`} valueClass="text-emerald-400" />
                            <Stat label="Remaining" value={`${parseFloat(icoVestingData.remaining).toFixed(2)} HRS`} valueClass="text-amber-400" />
                            <Stat label="Next Unlock" value={timeUntilNextIcoClaim} valueClass="text-sky-400" />
                        </div>

                        {/* Progress bar */}
                        <div className="mb-3 px-1">
                            <div className="flex justify-between mb-1.5">
                                <span className="text-[10px] text-zinc-700 tracking-wide">Vesting progress</span>
                                <span className="text-[10px] text-zinc-600 tabular-nums">{icoProgress.toFixed(1)}%</span>
                            </div>
                            <div className="h-1 w-full rounded-full bg-white/[0.05] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-amber-500 transition-all duration-700"
                                    style={{ width: `${icoProgress}%` }}
                                />
                            </div>
                        </div>

                        {/* Available + claim row */}
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-[10px] tracking-[0.12em] uppercase text-zinc-600 mb-0.5">
                                        Available to claim
                                    </p>
                                    <p className="text-[22px] font-light tabular-nums text-amber-400 leading-none">
                                        {currentIcoAvailable}
                                        <span className="text-[13px] text-zinc-600 ml-1">HRS</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-700 mb-0.5">Rate</p>
                                    <p className="text-[12px] text-zinc-500">0.5% / day</p>
                                </div>
                            </div>

                            <button
                                onClick={onIcoVestingClaim}
                                disabled={!isIcoClaimAvailable || claimingIco || parseFloat(icoVestingData.remaining) === 0}
                                className={`w-full py-3 rounded-xl text-[12px] font-semibold tracking-wide transition-all touch-manipulation
                                    ${isIcoClaimAvailable && parseFloat(icoVestingData.remaining) > 0
                                        ? "bg-amber-500 text-black hover:bg-amber-400 active:scale-[0.98]"
                                        : "bg-white/[0.04] text-zinc-600 border border-white/[0.06] cursor-not-allowed"
                                    }`}
                            >
                                {claimingIco ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                        Claiming…
                                    </span>
                                ) : parseFloat(icoVestingData.remaining) === 0 ? (
                                    "All Tokens Claimed"
                                ) : !isIcoClaimAvailable ? (
                                    <span className="flex items-center justify-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        {timeUntilNextIcoClaim}
                                    </span>
                                ) : (
                                    "Claim ICO Vesting"
                                )}
                            </button>
                        </div>
                    </section>

                    <Divider />

                    {/* ── GIFT VESTING PANEL ────────────────────────────────── */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Gift className="h-3.5 w-3.5 text-violet-400/70" />
                            <span className="text-[10px] tracking-[0.14em] uppercase text-zinc-600 font-semibold">
                                Gift Vesting
                            </span>
                            {isGiftLocked && (
                                <span className="ml-auto text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full border border-white/[0.07] text-zinc-600 bg-white/[0.03]">
                                    Locked
                                </span>
                            )}
                        </div>

                        {/* Unlocked stats */}
                        {giftVestingData && !isGiftLocked && (
                            <>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <Stat label="Locked" value={`${parseFloat(giftVestingData.lockedAmt).toFixed(2)} HRS`} />
                                    <Stat label="Claimed" value={`${parseFloat(giftVestingData.claimedAmt).toFixed(2)} HRS`} valueClass="text-emerald-400" />
                                    <Stat label="Remaining" value={`${parseFloat(giftVestingData.remaining).toFixed(2)} HRS`} valueClass="text-violet-400" />
                                    <Stat label="Next Unlock" value={timeUntilNextGiftClaim} valueClass="text-sky-400" />
                                </div>

                                {/* Progress bar */}
                                <div className="mb-3 px-1">
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-[10px] text-zinc-700 tracking-wide">Vesting progress</span>
                                        <span className="text-[10px] text-zinc-600 tabular-nums">{giftProgress.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1 w-full rounded-full bg-white/[0.05] overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-violet-500 transition-all duration-700"
                                            style={{ width: `${giftProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Claim / unlock card */}
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                            {isGiftLocked ? (
                                <>
                                    {/* Lock state */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                                            <Lock className="h-4 w-4 text-zinc-600" />
                                        </div>
                                        <div>
                                            <p className="text-[13px] text-zinc-300 font-medium">Gift vesting is locked</p>
                                            <p className="text-[11px] text-zinc-600 mt-0.5">
                                                Unlock to begin your daily vesting schedule.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onGiftVestingUnlock}
                                        disabled={unlockingGift}
                                        className="w-full py-3 rounded-xl text-[12px] font-semibold tracking-wide transition-all touch-manipulation bg-violet-500 text-white hover:bg-violet-400 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {unlockingGift ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                Unlocking…
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Lock className="h-3.5 w-3.5" />
                                                Unlock Gift Vesting
                                            </span>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-[10px] tracking-[0.12em] uppercase text-zinc-600 mb-0.5">
                                                Available to claim
                                            </p>
                                            <p className="text-[22px] font-light tabular-nums text-violet-400 leading-none">
                                                {currentGiftAvailable}
                                                <span className="text-[13px] text-zinc-600 ml-1">HRS</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {giftVestingData && (
                                                <>
                                                    <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-700 mb-0.5">Package</p>
                                                    <p className="text-[12px] text-zinc-500">#{giftVestingData.package}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={onGiftVestingClaim}
                                        disabled={!isGiftClaimAvailable || claimingGift || parseFloat(giftVestingData?.remaining || "0") === 0}
                                        className={`w-full py-3 rounded-xl text-[12px] font-semibold tracking-wide transition-all touch-manipulation
                                            ${isGiftClaimAvailable && parseFloat(giftVestingData?.remaining || "0") > 0
                                                ? "bg-violet-500 text-white hover:bg-violet-400 active:scale-[0.98]"
                                                : "bg-white/[0.04] text-zinc-600 border border-white/[0.06] cursor-not-allowed"
                                            }`}
                                    >
                                        {claimingGift ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                Claiming…
                                            </span>
                                        ) : parseFloat(giftVestingData?.remaining || "0") === 0 ? (
                                            "All Tokens Claimed"
                                        ) : !isGiftClaimAvailable ? (
                                            <span className="flex items-center justify-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                {timeUntilNextGiftClaim}
                                            </span>
                                        ) : (
                                            "Claim Gift Vesting"
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </section>

                    <Divider />

                    {/* ── CLAIM HISTORY (placeholder) ───────────────────────── */}
                    <section>
                        <p className="text-[10px] tracking-[0.14em] uppercase text-zinc-700 font-semibold mb-3">
                            Claim History
                        </p>
                        <div className="flex items-center justify-center py-8 rounded-xl border border-dashed border-white/[0.05]">
                            <p className="text-[12px] text-zinc-700">No claims recorded yet</p>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}