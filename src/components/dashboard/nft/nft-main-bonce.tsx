/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { NFTCardBonce } from "./nft-card-bonce";
import { UserNFTs } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { ethers } from "ethers";
import { nft_contract_abi, nft_contract_address } from "@/contract/royaltynfts/nft-contract-instance";

type Props = { nft: UserNFTs[] };

const NFT_PERCENTAGES: Record<number, number> = { 1: 15, 2: 17, 3: 20, 4: 23, 5: 25 };

export type TypeReward = { hrs: string; wbnb: string };

function formatReward(amount: ethers.BigNumber): string {
  const val = parseFloat(ethers.utils.formatEther(amount));
  if (val === 0) return "0.0000";
  if (val < 0.0001) return "<0.0001";
  return val.toFixed(4);
}

function StatChip({ label, value, valueClass }: { label: string; value: number; valueClass?: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/40 min-w-[56px]">
      <span className={`text-lg font-extrabold tabular-nums leading-none ${valueClass ?? "text-white"}`}>{value}</span>
      <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold mt-0.5">{label}</span>
    </div>
  );
}

export function NFTBonceCard({ nft }: Props) {
  const [page, setPage] = useState(1);
  const [typeRewards, setTypeRewards] = useState<Record<number, TypeReward>>({});
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [nextReleaseAt, setNextReleaseAt] = useState<number>(0);
  const [rewardIntervalSecs, setRewardIntervalSecs] = useState<number>(604800);

  const PER = 4;
  const totalPages = Math.max(1, Math.ceil(nft.length / PER));
  const slice = nft.slice((page - 1) * PER, page * PER);

  const claimable = nft.filter((n: any) => n.isClaimable).length;
  const claimed = nft.filter((n: any) => !n.isClaimable).length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingRewards(true);
        const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
        const contract = new ethers.Contract(nft_contract_address, nft_contract_abi, provider);

        const [
          hrsTotal, wbnbTotal,
          cnt1, cnt2, cnt3, cnt4, cnt5,
          releaseDate, rewardInterval,
        ] = await Promise.all([
          contract.releasedTokenAmtNew(0),
          contract.releasedTokenAmtNew(1),
          contract.allTokens(1),
          contract.allTokens(2),
          contract.allTokens(3),
          contract.allTokens(4),
          contract.allTokens(5),
          contract.releaseDate(),
          contract.rewardInterval(),
        ]);

        const intervalSecs = (rewardInterval as ethers.BigNumber).toNumber();
        const nextRelease = (releaseDate as ethers.BigNumber).toNumber();

        setNextReleaseAt(nextRelease);
        setRewardIntervalSecs(intervalSecs);

        const counts: Record<number, ethers.BigNumber> = { 1: cnt1, 2: cnt2, 3: cnt3, 4: cnt4, 5: cnt5 };
        const rewards: Record<number, TypeReward> = {};
        for (const [typeStr, pct] of Object.entries(NFT_PERCENTAGES)) {
          const type = Number(typeStr);
          const count = counts[type];
          rewards[type] = count.isZero()
            ? { hrs: "0.0000", wbnb: "0.0000" }
            : {
                hrs: formatReward(hrsTotal.mul(pct).div(100).div(count)),
                wbnb: formatReward(wbnbTotal.mul(pct).div(100).div(count)),
              };
        }
        setTypeRewards(rewards);
      } catch (err) {
        console.error("Failed to fetch NFT rewards:", err);
      } finally {
        setLoadingRewards(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-zinc-800/60 bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-900/30">
            <TrendingUp className="text-white" style={{ width: 16, height: 16 }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">NFT Bounce Rewards</h2>
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
              <RefreshCw style={{ width: 10, height: 10 }} />
              Distributes every 7 days — upgrade tier to earn more
            </p>
          </div>
        </div>

      </div>

      {/* ── NFT List ── */}
      <div className="px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-2"
          >
            {slice.length === 0 ? (
              <div className="py-12 text-center text-zinc-600 text-sm">No NFTs yet</div>
            ) : (
              slice.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NFTCardBonce
                    token={item}
                    hrsReward={typeRewards[item.tokenType]?.hrs}
                    wbnbReward={typeRewards[item.tokenType]?.wbnb}
                    loadingRewards={loadingRewards}
                    nextReleaseAt={nextReleaseAt}
                    rewardInterval={rewardIntervalSecs}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="border-t border-zinc-800/60 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg border border-zinc-700 hover:border-orange-500/60 hover:bg-orange-500/5 flex items-center justify-center text-zinc-500 hover:text-orange-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft style={{ width: 14, height: 14 }} />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  page === i + 1 ? "w-5 bg-orange-500" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                )}
              />
            ))}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-lg border border-zinc-700 hover:border-orange-500/60 hover:bg-orange-500/5 flex items-center justify-center text-zinc-500 hover:text-orange-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
    </div>
  );
}
