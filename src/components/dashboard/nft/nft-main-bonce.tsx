/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { NFTCardBonce } from "./nft-card-bonce";
import { UserNFTs } from "@/generated/prisma";
import { cn } from "@/lib/utils";

type Props = { nft: UserNFTs[] };

export function NFTBonceCard({ nft }: Props) {
  const [page, setPage] = useState(1);
  const PER = 4;
  const totalPages = Math.max(1, Math.ceil(nft.length / PER));
  const slice = nft.slice((page - 1) * PER, page * PER);

  const claimable = nft.filter((n: any) => n.isClaimable).length;
  const claimed = nft.filter((n: any) => !n.isClaimable).length;

  return (
    <div className="w-full bg-[#161616] border border-[#222] rounded-[20px] overflow-hidden">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-[#1f1f1f]">

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">NFT Bounce Rewards</h2>
            <p className="text-[11px] text-[#555] mt-1 flex items-center gap-1.5">
              <RefreshCw style={{ width: 11, height: 11 }} />
              Grows every 7 days — upgrade to earn more
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2 shrink-0">
          <div className="bg-[#1d1d1d] rounded-xl px-4 py-2.5 min-w-[72px]">
            <p className="text-[10px] uppercase tracking-widest text-[#555] font-bold mb-1">Total</p>
            <p className="text-xl font-extrabold text-white tabular-nums leading-none">{nft.length}</p>
          </div>
          <div className="bg-[#1d1d1d] rounded-xl px-4 py-2.5 min-w-[72px]">
            <p className="text-[10px] uppercase tracking-widest text-[#555] font-bold mb-1">Claimable</p>
            <p className="text-xl font-extrabold text-orange-400 tabular-nums leading-none">{claimable}</p>
          </div>
          <div className="bg-[#1d1d1d] rounded-xl px-4 py-2.5 min-w-[72px]">
            <p className="text-[10px] uppercase tracking-widest text-[#555] font-bold mb-1">Claimed</p>
            <p className="text-xl font-extrabold text-yellow-400 tabular-nums leading-none">{claimed}</p>
          </div>
        </div>
      </div>

      {/* ── NFT List ── */}
      <div className="px-4 py-3 flex flex-col gap-2">
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
              <div className="py-10 text-center text-[#444] text-sm">No NFTs yet</div>
            ) : (
              slice.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NFTCardBonce token={item} />
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="border-t border-[#1f1f1f] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg border border-[#222] hover:border-orange-500/50 flex items-center justify-center text-[#555] hover:text-orange-400 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft style={{ width: 14, height: 14 }} />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={cn(
                  "h-[5px] rounded-full transition-all duration-200",
                  page === i + 1 ? "w-5 bg-orange-500" : "w-[5px] bg-[#2a2a2a] hover:bg-[#444]"
                )}
              />
            ))}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-lg border border-[#222] hover:border-orange-500/50 flex items-center justify-center text-[#555] hover:text-orange-400 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
    </div>
  );
}