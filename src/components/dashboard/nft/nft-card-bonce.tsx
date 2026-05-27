'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNFTNameImg } from '@/helper';
import Image from 'next/image';
import { UserNFTs } from '@/generated/prisma';
import { useActiveAccount } from 'thirdweb/react';
import { getNftContractInstance } from '@/contract/royaltynfts/nft-contract-instance';
import { Loader2, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getNFTName } from '@/lib';
import { storeUserNFTClaimedHistory } from '@/actions/nft';
import { getHorsePrice } from '@/contract/horse-token-contract/contract-instance';
import { getWbnbPriceInUsdt } from '@/lib/utils';

interface NFTCardProps {
  token: UserNFTs;
  hrsReward?: string;
  wbnbReward?: string;
  loadingRewards?: boolean;
  nextReleaseAt?: number;
  rewardInterval?: number;
}

const NFT_TYPE_META: Record<number, { label: string; accent: string; badge: string }> = {
  1: { label: 'Bronze',   accent: 'border-l-amber-700',  badge: 'bg-amber-900/40 text-amber-400 ring-amber-700/30' },
  2: { label: 'Silver',   accent: 'border-l-zinc-400',   badge: 'bg-zinc-700/40 text-zinc-300 ring-zinc-500/30' },
  3: { label: 'Gold',     accent: 'border-l-yellow-500', badge: 'bg-yellow-900/40 text-yellow-400 ring-yellow-700/30' },
  4: { label: 'Platinum', accent: 'border-l-sky-400',    badge: 'bg-sky-900/40 text-sky-300 ring-sky-600/30' },
  5: { label: 'Diamond',  accent: 'border-l-violet-400', badge: 'bg-violet-900/40 text-violet-300 ring-violet-600/30' },
};

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

  if (target === 0) return <span className="inline-block h-2 w-20 bg-zinc-700 animate-pulse rounded" />;
  const cd = getCountdown(target);
  if (cd.expired) return <span className="text-emerald-400 font-semibold">now</span>;

  return (
    <span className="font-semibold tabular-nums">
      {cd.days > 0 && `${cd.days}d `}
      {String(cd.hours).padStart(2, '0')}h&nbsp;
      {String(cd.minutes).padStart(2, '0')}m&nbsp;
      {String(cd.seconds).padStart(2, '0')}s
    </span>
  );
}

function RewardPill({ label, value, loading, labelClass, valueClass }: {
  label: string; value?: string; loading?: boolean; labelClass: string; valueClass: string;
}) {
  return (
    <div className="rounded-md bg-zinc-800/80 border border-zinc-700/40 px-2.5 py-1.5 w-full">
      <span className={`text-[9px] uppercase tracking-widest font-bold block leading-none mb-0.5 ${labelClass}`}>{label}</span>
      {loading
        ? <div className="h-3 w-14 bg-zinc-700 animate-pulse rounded mt-0.5" />
        : <span className={`text-xs font-bold tabular-nums leading-none ${valueClass}`}>{value ?? '—'}</span>
      }
    </div>
  );
}

export function NFTCardBonce({
  token,
  hrsReward,
  wbnbReward,
  loadingRewards,
  nextReleaseAt = 0,
  rewardInterval = 604800,
}: NFTCardProps) {
  const activeAccount = useActiveAccount();
  const [hasClaimed, setHasClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (nextReleaseAt === 0) return;
    const stored = localStorage.getItem(`nft_claimed_${token.tokenId}`);
    setHasClaimed(stored !== null && parseInt(stored, 10) === nextReleaseAt);
  }, [token.tokenId, nextReleaseAt]);

  const countdownTarget = hasClaimed ? nextReleaseAt + rewardInterval : nextReleaseAt;
  const currentCycleExpired = nextReleaseAt > 0 && Math.floor(Date.now() / 1000) >= nextReleaseAt;
  const canClaim = currentCycleExpired && !hasClaimed && !claiming;
  const meta = NFT_TYPE_META[token.tokenType] ?? NFT_TYPE_META[1];

  const handleClaim = useCallback(async () => {
    if (!activeAccount) { toast.info('Please connect your wallet'); return; }
    try {
      setClaiming(true);
      const contract = await getNftContractInstance(activeAccount);
      const tx = await contract.withdrawRewardByID(token.tokenType, token.tokenId);
      await tx.wait();
      localStorage.setItem(`nft_claimed_${token.tokenId}`, String(nextReleaseAt));
      setHasClaimed(true);

      const parseReward = (val?: string) => parseFloat(val?.replace('<', '') || '0') || 0;
      const [hrsPrice, wbnbPrice] = await Promise.all([getHorsePrice(), getWbnbPriceInUsdt()]);
      const totalUsdt = parseReward(hrsReward) * hrsPrice + parseReward(wbnbReward) * wbnbPrice;
      storeUserNFTClaimedHistory(activeAccount.address, token.tokenId, token.tokenType, totalUsdt.toFixed(4));

      toast.success(`Reward claimed for NFT #${token.tokenId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg.includes('No Reward') ? 'No reward available yet.' : 'You already claimed Bounce.');
    } finally {
      setClaiming(false);
    }
  }, [activeAccount, token.tokenType, token.tokenId, nextReleaseAt, hrsReward, wbnbReward]);

  return (
    <div className={`rounded-xl bg-zinc-900 border border-zinc-800 border-l-2 ${meta.accent} overflow-hidden`}>

      {/* countdown strip — hidden when claimable */}
      {!canClaim && (
        <div className="flex items-center gap-1.5 px-3 py-1 border-b border-zinc-800 bg-zinc-800/30">
          <Clock className="w-2.5 h-2.5 shrink-0 text-zinc-600" />
          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
            {hasClaimed ? 'Next cycle in' : 'Unlocks in'}&nbsp;
            {loadingRewards || nextReleaseAt === 0
              ? <span className="inline-block h-2 w-20 bg-zinc-700 animate-pulse rounded" />
              : <CountdownText target={countdownTarget} />
            }
          </span>
        </div>
      )}

      {/* ── Row: image+identity | stacked rewards | claim button ── */}
      <div className="flex items-center gap-3 px-3 py-3">

        {/* NFT image */}
        <Image
          src={getNFTNameImg(token.tokenType) || '/placeholder.svg'}
          alt={`NFT #${token.tokenId}`}
          width={64}
          height={64}
          className="w-16 h-16 rounded-xl shrink-0 object-cover ring-2 ring-zinc-700/60"
        />

        {/* identity */}
        <div className="shrink-0">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ring-1 inline-block ${meta.badge}`}>
            {getNFTName(token.tokenType)}
          </span>
          <span className="text-sm font-semibold text-zinc-300 block mt-1">#{token.tokenId}</span>
        </div>

        {/* HRS + WBNB stacked */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <RewardPill
            label="HRS"
            value={hrsReward}
            loading={loadingRewards}
            labelClass="text-orange-500/70"
            valueClass="text-orange-300"
          />
          <RewardPill
            label="WBNB"
            value={wbnbReward}
            loading={loadingRewards}
            labelClass="text-yellow-500/70"
            valueClass="text-yellow-300"
          />
        </div>

        <button
          onClick={handleClaim}
          disabled={!canClaim}
          className={`shrink-0 flex flex-col items-center justify-center gap-0.5 rounded-lg w-14 py-3 text-[10px] font-bold tracking-wide transition-all active:scale-95 disabled:cursor-not-allowed ${
            claiming
              ? 'bg-zinc-800 text-zinc-500'
              : canClaim
                ? 'bg-linear-to-br from-orange-500 to-yellow-500 text-zinc-900 shadow-md shadow-orange-900/25 hover:from-orange-400 hover:to-yellow-400'
                : hasClaimed
                  ? 'bg-emerald-950/50 text-emerald-600 ring-1 ring-emerald-800/40'
                  : 'bg-zinc-800/60 text-zinc-600 ring-1 ring-zinc-700/40'
          }`}
        >
          {claiming ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Wait</span></>
          ) : hasClaimed ? (
            <><CheckCircle2 className="w-3.5 h-3.5" /><span>Done</span></>
          ) : canClaim ? (
            <><Zap className="w-3.5 h-3.5" /><span>Claim</span></>
          ) : (
            <><Clock className="w-3.5 h-3.5" /><span>Locked</span></>
          )}
        </button>
      </div>
    </div>
  );
}
