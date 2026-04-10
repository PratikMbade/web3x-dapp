/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Zap, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { getNFTNameImg } from "@/helper";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";
import { getNftContractInstance } from "@/contract/royaltynfts/nft-contract-instance";
import { setMergeNFTs } from "@/actions/nft/index";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { UserNFTs } from "@/generated/prisma";
import { cn } from "@/lib/utils";

interface NFT { tokenId: number; imageUrl: string; }
type Props = { userAvailableNFTs: UserNFTs[] | null; nftId: number; nftType: number; };

/* ── Picker card inside dialog ── */
function PickerCard({ tokenId, imageUrl, onClick, isSelected }: {
  tokenId: number; imageUrl: string; onClick: () => void; isSelected?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "relative w-full rounded-xl overflow-hidden border text-left transition-all duration-150",
        isSelected
          ? "border-orange-500/60 ring-1 ring-orange-500/30"
          : "border-[#222] hover:border-[#333]"
      )}
    >
      <div className="relative aspect-square bg-[#111]">
        <Image src={imageUrl} alt={`#${tokenId}`} fill className="object-cover" />
        {isSelected && (
          <div className="absolute inset-0 bg-orange-500/15 flex items-center justify-center">
            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
              <CheckCircle2 style={{ width: 15, height: 15 }} className="text-white" />
            </div>
          </div>
        )}
      </div>
      <div className={cn(
        "px-3 py-2 text-[11px] font-bold transition-colors",
        isSelected ? "bg-orange-500/10 text-orange-400" : "bg-[#111] text-[#555]"
      )}>
        Token #{tokenId}
      </div>
    </motion.button>
  );
}

/* ── Empty slot ── */
function EmptySlot({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ borderColor: "rgba(249,115,22,0.4)" }}
      onClick={onClick}
      className="relative w-full aspect-square rounded-xl border-2 border-dashed border-[#222] bg-white/[0.01] hover:bg-orange-500/[0.03] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 group"
    >
      <div className="w-8 h-8 rounded-full border border-[#2a2a2a] group-hover:border-orange-500/40 flex items-center justify-center transition-colors">
        <Plus style={{ width: 15, height: 15 }} className="text-[#333] group-hover:text-orange-500 transition-colors" />
      </div>
      <span className="text-[9px] uppercase tracking-[0.15em] text-[#333] group-hover:text-orange-500/60 font-semibold transition-colors">
        Pick NFT
      </span>
    </motion.div>
  );
}

/* ── Filled slot ── */
function FilledSlot({ nft, onRemove, onReplace }: {
  nft: NFT; onRemove: () => void; onReplace: () => void;
}) {
  return (
    <div className="relative w-full">
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={onReplace}
        className="relative aspect-square rounded-xl overflow-hidden border border-orange-500/30 cursor-pointer group"
      >
        <Image src={nft.imageUrl} alt={`#${nft.tokenId}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-[11px] font-bold text-white bg-black/60 rounded-lg px-3 py-1.5 transition-opacity">
            Change
          </span>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="text-[10px] font-bold text-white/80 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            #{nft.tokenId}
          </span>
        </div>
      </motion.div>
      {/* Remove */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-red-500/50 hover:bg-red-500/10 rounded-full flex items-center justify-center transition-all z-10"
      >
        <X style={{ width: 10, height: 10 }} className="text-[#555] hover:text-red-400" />
      </button>
    </div>
  );
}

/* ── Main ── */
export default function NFTMerge({ userAvailableNFTs, nftId, nftType }: Props) {
  const [slots, setSlots] = useState<{ [k: number]: NFT | null }>({ 1: null, 2: null });
  const [openDialog, setOpenDialog] = useState<number | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const activeAccount = useActiveAccount();
  const router = useRouter();

  const handleSelect = (slot: number, tokenId: number, imageUrl: string) => {
    setSlots(p => ({ ...p, [slot]: p[slot]?.tokenId === tokenId ? null : { tokenId, imageUrl } }));
    setOpenDialog(null);
  };

  const filteredNFTs = useMemo(() => {
    if (!userAvailableNFTs) return [];
    const usedIds = Object.values(slots).filter(Boolean).map(n => n!.tokenId);
    const excluded = Array.isArray(nftId) ? nftId : [nftId];
    return userAvailableNFTs.filter(n => ![...usedIds, ...excluded].includes(n.tokenId));
  }, [userAvailableNFTs, slots, nftId]);

  const canMerge = !!(slots[1] && slots[2]);
  const filledCount = 1 + (slots[1] ? 1 : 0) + (slots[2] ? 1 : 0);

  const doMerge = async () => {
    if (!activeAccount) { toast.error("Connect your wallet first"); return; }
    setIsMerging(true);
    try {
      const contract = await getNftContractInstance(activeAccount);
      const tx = await contract.mergeNFT(nftId, slots[1]?.tokenId, slots[2]?.tokenId, nftType);
      await tx.wait();
      const receipt = await contract.provider.getTransactionReceipt(tx.hash);
      const iface = new ethers.utils.Interface([
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
      ]);
      let newId: number | undefined;
      receipt.logs.forEach((log: any) => {
        try {
          const p = iface.parseLog(log);
          if (p.name === "Transfer") newId = ethers.BigNumber.from(p.args.tokenId).toNumber();
        } catch (_) {}
      });
      const res = await setMergeNFTs(
        activeAccount.address, nftType, nftId,
        slots[1]!.tokenId, slots[2]!.tokenId, newId!
      );
      if (!res.status) { toast.error(res.message); setIsMerging(false); return; }
      setIsDone(true);
      toast.success("NFTs merged successfully!");
      setTimeout(() => { window.location.href = "/dashboard/nft"; }, 2000);
    } catch (err: any) {
      const m = err?.message || "";
      if (m.includes("Invalid Package")) toast.error("Not enough NFTs or packages to merge");
      else if (m.includes("Unable to Merge")) toast.error("These NFTs were not minted by you");
      else toast.error("Transaction failed — please retry");
      setIsMerging(false);
    }
  };

  const SlotDialog = ({ slot }: { slot: number }) => (
    <Dialog open={openDialog === slot} onOpenChange={open => setOpenDialog(open ? slot : null)}>
      <DialogTrigger asChild><span className="hidden" /></DialogTrigger>
      <DialogContent className="bg-[#111] border border-[#222] rounded-2xl w-[calc(100vw-2rem)] max-w-[380px] p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 py-4 border-b border-[#1f1f1f]">
          <DialogTitle className="text-sm font-bold text-white">
            Select NFT — Slot {slot === 1 ? "A" : "B"}
          </DialogTitle>
          <p className="text-[11px] text-[#555] mt-0.5">{filteredNFTs.length} available</p>
        </DialogHeader>
        <div className="p-4 max-h-[56vh] overflow-y-auto">
          {filteredNFTs.length === 0 ? (
            <div className="py-14 text-center text-[#444] text-sm">No NFTs available</div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredNFTs.map(nft => (
                <PickerCard
                  key={nft.tokenId}
                  tokenId={nft.tokenId}
                  imageUrl={getNFTNameImg(nft.tokenType)}
                  onClick={() => handleSelect(slot, nft.tokenId, getNFTNameImg(nft.tokenType))}
                  isSelected={slots[slot]?.tokenId === nft.tokenId}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="w-full bg-[#161616] border border-[#222] rounded-[20px] overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-center">
            <Zap style={{ width: 15, height: 15 }} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-white leading-none">Merge NFTs</h2>
            <p className="text-[11px] text-[#555] mt-1">Select 2 NFTs to merge with your base</p>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={cn(
                "h-[5px] rounded-full transition-all duration-300",
                i < filledCount ? "bg-orange-500 w-4" : "bg-[#2a2a2a] w-[5px]"
              )}
            />
          ))}
          <span className="text-[10px] text-[#555] font-semibold ml-1.5 tabular-nums">
            {filledCount}/3
          </span>
        </div>
      </div>

      {/* ── Slots ── */}
      <div className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

          {/* Base (locked) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#555] font-bold">Base</span>
              <span className="text-[9px] bg-[#1d1d1d] border border-[#252525] rounded-full px-2 py-0.5 text-[#444] font-semibold uppercase tracking-wide">
                Locked
              </span>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden border border-orange-500/20 bg-[#141414]">
              <Image src={getNFTNameImg(nftType)} alt={`#${nftId}`} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2">
                <span className="text-[10px] font-bold text-white/75 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                  #{nftId}
                </span>
              </div>
            </div>
          </div>

          {/* Slot A */}
          <div>
            <span className="block text-[10px] uppercase tracking-[0.15em] text-[#555] font-bold mb-2">Slot A</span>
            {slots[1] ? (
              <FilledSlot
                nft={slots[1]}
                onRemove={() => setSlots(p => ({ ...p, 1: null }))}
                onReplace={() => setOpenDialog(1)}
              />
            ) : (
              <EmptySlot onClick={() => setOpenDialog(1)} />
            )}
          </div>

          {/* Slot B */}
          <div>
            <span className="block text-[10px] uppercase tracking-[0.15em] text-[#555] font-bold mb-2">Slot B</span>
            {slots[2] ? (
              <FilledSlot
                nft={slots[2]}
                onRemove={() => setSlots(p => ({ ...p, 2: null }))}
                onReplace={() => setOpenDialog(2)}
              />
            ) : (
              <EmptySlot onClick={() => setOpenDialog(2)} />
            )}
          </div>
        </div>

        {/* Dialogs */}
        <SlotDialog slot={1} />
        <SlotDialog slot={2} />

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#1f1f1f]" />
          <div className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 border text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
            canMerge
              ? "border-orange-500/30 bg-orange-500/08 text-orange-400"
              : "border-[#222] text-[#333]"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", canMerge ? "bg-orange-400" : "bg-[#333]")} />
            Ready to merge
          </div>
          <div className="flex-1 h-px bg-[#1f1f1f]" />
        </div>

        {/* ── Action area ── */}
        <AnimatePresence mode="wait">
          {isDone ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full rounded-xl border border-emerald-500/25 bg-emerald-500/08 py-4 flex items-center justify-center gap-2.5"
            >
              <CheckCircle2 style={{ width: 17, height: 17 }} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">Merge successful — redirecting</span>
            </motion.div>
          ) : (
            <motion.button
              key="btn"
              whileHover={canMerge ? { scale: 1.01 } : {}}
              whileTap={canMerge ? { scale: 0.99 } : {}}
              onClick={() => { if (canMerge && !isMerging) doMerge(); }}
              disabled={!canMerge || isMerging}
              className={cn(
                "w-full rounded-xl py-3.5 flex items-center justify-center gap-2.5 text-[13px] font-bold transition-all duration-200",
                canMerge && !isMerging
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                  : "bg-[#1a1a1a] border border-[#222] text-[#404040] cursor-not-allowed"
              )}
            >
              {isMerging ? (
                <>
                  <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
                  Merging your NFTs…
                </>
              ) : (
                <>
                  <Zap style={{ width: 15, height: 15 }} />
                  {canMerge ? "Merge NFTs" : "Select NFTs to continue"}
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Burn warning */}
        <AnimatePresence>
          {canMerge && !isDone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mt-3 flex items-start gap-2.5 bg-yellow-400/[0.05] border border-yellow-400/15 rounded-xl px-3.5 py-3">
                <AlertTriangle style={{ width: 13, height: 13 }} className="text-yellow-400/60 shrink-0 mt-0.5" />
                <p className="text-[11px] text-yellow-400/45 leading-relaxed">
                  This action is permanent. Both selected NFTs will be burned and cannot be recovered.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}