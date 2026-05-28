/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";
import { animate, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getNFTNameImg } from "@/helper";
import { Zap, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { getNftContractInstance, nft_contract_abi, nft_contract_address } from "@/contract/royaltynfts/nft-contract-instance";
import { ethers } from "ethers";
import { toast } from "sonner";
import { storeUserNFTClaimedHistory } from "@/actions/nft";

interface NFTCardType {
  nftName: string;
  nftLevel: number;
  nftId: number;
}

// ─── Fixed release config ────────────────────────────────────────────────────
const RELEASE_DATE = 1779827669; // your fixed release timestamp
const REWARD_INTERVAL = 604800;  // 1 week in seconds

/**
 * Returns the START of the CURRENT weekly window (or RELEASE_DATE if not yet reached).
 * Once this timestamp is in the past, the reward is claimable.
 */
function getCurrentCycleStart(): number {
  const now = Math.floor(Date.now() / 1000);
  // Still before the very first release → current "cycle" starts at RELEASE_DATE
  if (now < RELEASE_DATE) return RELEASE_DATE;
  const n = Math.floor((now - RELEASE_DATE) / REWARD_INTERVAL);
  return RELEASE_DATE + n * REWARD_INTERVAL;
}

/**
 * Returns the START of the NEXT (always future) weekly cycle.
 */
function getNextCycleStart(): number {
  const now = Math.floor(Date.now() / 1000);
  if (now < RELEASE_DATE) return RELEASE_DATE; // same as current, no prior cycle
  const n = Math.floor((now - RELEASE_DATE) / REWARD_INTERVAL);
  return RELEASE_DATE + (n + 1) * REWARD_INTERVAL;
}

function getCountdown(target: number) {
  const remaining = target - Math.floor(Date.now() / 1000);
  if (remaining <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(remaining / 86400),
    hours: Math.floor((remaining % 86400) / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
    expired: false,
  };
}

function CountdownText({ target }: { target: number }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (target === 0) {
    return <span className="inline-block h-2 w-16 bg-zinc-700/60 animate-pulse rounded" />;
  }

  const cd = getCountdown(target);
  if (cd.expired) {
    return <span style={{ color: "#4ade80" }} className="font-semibold">Ready!</span>;
  }

  return (
    <span className="font-semibold tabular-nums" style={{ color: "rgba(255,255,255,0.55)" }}>
      {cd.days > 0 && `${cd.days}d `}
      {String(cd.hours).padStart(2, "0")}h{" "}
      {String(cd.minutes).padStart(2, "0")}m{" "}
      {String(cd.seconds).padStart(2, "0")}s
    </span>
  );
}

export function NFTCard({ nftName, nftLevel, nftId }: NFTCardType) {
  const activeAccount = useActiveAccount();

  // currentCycleStart: the Unix timestamp when the current claimable window opened
  const [currentCycleStart, setCurrentCycleStart] = useState<number>(0);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Floating animation on mount
  useEffect(() => {
    animate(
      ".nft-hero-img",
      { y: [0, -8, 0] },
      { duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }
    );
  }, []);

  // Derive cycle start from the fixed constants (no RPC needed for timer)
  useEffect(() => {
    const update = () => setCurrentCycleStart(getCurrentCycleStart());
    update();
    // Re-evaluate every second so the cycle flips correctly when the week rolls
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Check localStorage claim status whenever the cycle changes
  useEffect(() => {
    if (currentCycleStart === 0) return;
    const stored = localStorage.getItem(`nft_claimed_${nftId}`);
    setHasClaimed(stored !== null && parseInt(stored, 10) === currentCycleStart);
  }, [nftId, currentCycleStart]);

  const now = Math.floor(Date.now() / 1000);
  // Claimable only once the current cycle's start time has passed
  const currentCycleExpired = currentCycleStart > 0 && now >= currentCycleStart;
  const canClaim = currentCycleExpired && !hasClaimed && !claiming;

  // Countdown target — ALWAYS points to a future timestamp so the timer is visible:
  //   • Before release / locked  → count down to currentCycleStart (first/next unlock)
  //   • Claimable now            → no countdown needed (show "Available now")
  //   • Already claimed          → count down to next cycle start
  const countdownTarget = hasClaimed
    ? getNextCycleStart()       // next weekly reset
    : currentCycleStart;        // upcoming unlock (future) OR just passed (canClaim)

  const handleClaim = useCallback(async () => {
    if (!activeAccount) { toast.info("Please connect your wallet"); return; }
    try {
      setClaiming(true);
      const contract = await getNftContractInstance(activeAccount);
      const tx = await contract.withdrawRewardByID(nftLevel, nftId);
      await tx.wait();
      localStorage.setItem(`nft_claimed_${nftId}`, String(currentCycleStart));
      setHasClaimed(true);
      storeUserNFTClaimedHistory(activeAccount.address, nftId, nftLevel, "0.0000");
      toast.success(`Bounce reward claimed for NFT #${nftId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg.includes("No Reward") ? "No reward available yet." : "You already claimed Bounce.");
    } finally {
      setClaiming(false);
    }
  }, [activeAccount, nftLevel, nftId, currentCycleStart]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full rounded-[20px] overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #080810 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Image zone */}
      <div
        className="relative h-[200px] sm:h-[220px] flex items-center justify-center overflow-hidden"
        style={{ background: "#080810" }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(255,200,60,0.09), transparent 65%)" }} />

        {/* Active badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Active</span>
        </div>

        {/* Token ID badge */}
        <div
          className="absolute top-3 right-3 rounded-full px-2.5 py-1.5 backdrop-blur-md"
          style={{ background: "rgba(255,200,60,0.1)", border: "1px solid rgba(255,200,60,0.25)" }}
        >
          <span className="text-[10px] font-bold" style={{ color: "#ffc83c" }}>#{nftId}</span>
        </div>

        {/* NFT image */}
        <div className="nft-hero-img relative z-10">
          <Image
            src={getNFTNameImg(nftLevel)}
            alt={nftName}
            width={160}
            height={160}
            className="rounded-2xl object-contain"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </div>

      {/* Info */}
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3
              className="text-[15px] font-extrabold leading-none"
              style={{ color: "#f0f0f8", fontFamily: "'Outfit', sans-serif" }}
            >
              {nftName}
            </h3>
            <p className="text-[11px] mt-1 font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
              Level {nftLevel}&nbsp;·&nbsp;Token #{nftId}
            </p>
          </div>
        </div>

        <div className="h-px mb-3" style={{ background: "rgba(255,255,255,0.06)" }} />

        <Link
          href={
            nftName === "Just Creator"
              ? "/dashboard/nft"
              : `/dashboard/nft/${nftName}/${nftId}`
          }
        >
          {nftName !== "Just Creator" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 text-[13px] font-bold rounded-xl py-3 cursor-pointer transition-all"
              style={{
                background: "linear-gradient(135deg, #ffc83c 0%, #ff8c00 100%)",
                color: "#0a0a0f",
              }}
            >
              <Zap style={{ width: 14, height: 14 }} />
              Upgrade NFT
            </motion.button>
          )}
        </Link>

        {/* Bounce Claim Section */}
        {nftName !== "Just Creator" && (
          <div className="mt-3">
            <div className="h-px mb-3" style={{ background: "rgba(255,255,255,0.06)" }} />

            <div className="flex flex-col items-stretch gap-2">
                     {/* Claim button box */}
              <motion.button
                whileHover={canClaim ? { scale: 1.02 } : {}}
                whileTap={canClaim ? { scale: 0.98 } : {}}
                onClick={handleClaim}
                disabled={!canClaim}
                className="flex-1 flex  items-center justify-center gap-1 rounded-xl py-2.5 px-2 text-[11px] font-bold transition-all"
                style={
                  claiming
                    ? { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.07)", cursor: "not-allowed" }
                    : canClaim
                      ? { background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "#fff", cursor: "pointer" }
                      : hasClaimed
                        ? { background: "rgba(34,197,94,0.07)", color: "rgba(34,197,94,0.45)", border: "1px solid rgba(34,197,94,0.18)", cursor: "not-allowed" }
                        : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.07)", cursor: "not-allowed" }
                }
              >
                {claiming ? (
                  <><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /><span>Claiming...</span></>
                ) : hasClaimed ? (
                  <><CheckCircle2 style={{ width: 14, height: 14 }} /><span>Claimed</span></>
                ) : canClaim ? (
                  <><Zap style={{ width: 14, height: 14 }} /><span>Claim Bounce</span></>
                ) : (
                  <><Clock style={{ width: 14, height: 14 }} /><span>Locked</span></>
                )}
              </motion.button>
              {/* Timer box — always visible */}
              <div
                className="flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl py-2.5 px-2"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <Clock style={{ width: 9, height: 9, color: "rgba(255,255,255,0.25)" }} />
                  <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {hasClaimed ? "Next cycle" : canClaim ? "Resets in" : "Unlocks in"}
                  </span>
                </div>
                <CountdownText target={canClaim || hasClaimed ? getNextCycleStart() : countdownTarget} />
              </div>

       
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}