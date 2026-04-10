"use client";
import React, { useState } from "react";
import { Users, Info, Loader2 } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { getNftContractInstance } from "@/contract/royaltynfts/nft-contract-instance";
import { Account } from "thirdweb/wallets";
import { setJustTokenNFTs } from "@/actions/nft/index";
import { toast } from "sonner";

type Props = { justNFTsCount: number };

const CreateJustNFT = ({ justNFTsCount }: Props) => {
  const activeAccount = useActiveAccount();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const isJustExistToUser = async (activeAccount: Account): Promise<boolean> => {
    try {
      const inst = await getNftContractInstance(activeAccount);
      const isUser = await inst.userMetadata(activeAccount.address);
      return !!isUser._justToken;
    } catch (error) {
      console.error("Error checking if user exists: ", error);
      return false;
    }
  };

  const createJustNftToken = async () => {
    try {
      if (!activeAccount) { toast.error("Please Connect Wallet"); return; }
      setIsPending(true);
      const inst = await getNftContractInstance(activeAccount);
      const isUserHasJustNFT = await isJustExistToUser(activeAccount);
      if (isUserHasJustNFT) {
        toast("You already have a Just NFT!", { icon: "ℹ️" });
        return;
      }
      const res = await inst?.purchaseJustToken();
      await res.wait();
      await setJustNFTTokenInDB(activeAccount.address);
      router.refresh();
    } catch (error) {
      const err = error as { code?: string; message?: string };
      if (err.message?.includes("You Have Not Purchased Enought Package")) {
        toast.error("You don't have enough packages to get Just NFT");
        return;
      }
      switch (err.code) {
        case "UNPREDICTABLE_GAS_LIMIT":
          toast.error("Transaction failed: unpredictable gas limit."); break;
        case "INSUFFICIENT_FUNDS":
          toast.error("Insufficient funds to complete the transaction."); break;
        default:
          toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  };

  const setJustNFTTokenInDB = async (address: string) => {
    try {
      const response = await setJustTokenNFTs(address, 0);
      if (!response.status) { toast.error(response.message); return; }
      toast.success(response.message);
    } catch (error) {
      console.log("setJustNFTTokenInDB error", error);
    }
  };

  return (
    <div className="w-full max-w-5xl" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl border border-white/[0.07] overflow-hidden bg-[#0a0a0a]">

        {/* ── Left: GIF ── */}
        <div className="relative flex items-center justify-center bg-[#080808] min-h-[280px] lg:min-h-[460px] p-8">
          {/* Subtle corner accent */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-white/10 rounded-tl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-white/10 rounded-br-lg" />

          <div className="relative">
            <img
              src="/JUST_CREATOR_GIF.gif"
              alt="Just Creator NFT"
              className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] object-cover rounded-2xl border border-white/[0.08]"
              style={{ boxShadow: "0 0 60px rgba(255,255,255,0.04)" }}
            />
          </div>
        </div>

        {/* ── Right: Details ── */}
        <div className="flex flex-col justify-between p-8 lg:p-10">
          <div className="space-y-6">

            {/* Tag */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
                Exclusive NFT
              </span>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-tight">
                Just Creator
              </h1>
              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight">
                NFT
              </h1>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <Users className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-[13px] font-medium text-zinc-300 tabular-nums">{justNFTsCount}</span>
                <span className="text-[11px] text-zinc-600">holders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[12px] text-zinc-500">Top 21%</span>
              </div>
            </div>

            {/* Notice */}
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Info className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                Requires <span className="text-zinc-300 font-medium">4 active packages</span> in Metaunity to claim your Just Creator NFT.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <button
              onClick={createJustNftToken}
              disabled={isPending}
              className="w-full py-3.5 rounded-2xl bg-white text-black text-[14px] font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating NFT…
                </>
              ) : (
                "Create Just NFT"
              )}
            </button>
            <p className="text-center text-[11px] text-zinc-700 mt-3 tracking-wide">
              One-time · Non-transferable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJustNFT;