/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { Users, Loader2, Zap, ArrowRight } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { getNftContractInstance } from "@/contract/royaltynfts/nft-contract-instance";
import TransferNFT from "./transfernft-dialog";
import { Account } from "thirdweb/wallets";
import { setNFTsToDB } from "@/actions/nft/index";
import { ethers } from "ethers";
import { toast } from "sonner";

type Props = { earthNFTsCount: number };

// ── Minting loader overlay ────────────────────────────────────────────────────
function MintingLoader() {
  return (
    <div className="w-full max-w-5xl">
      <div className="rounded-3xl border border-white/[0.07] bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 py-24 px-8">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border border-white/10 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-white/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-white/5 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[15px] font-medium text-white mb-1">Minting NFT</p>
          <p className="text-[13px] text-zinc-600">Please wait and don&apos;t close this window…</p>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const BuyEarthNFT = ({ earthNFTsCount }: Props) => {
  const activeAccount = useActiveAccount();
  const router = useRouter();
  const energyToken = "0x473f431fDd1D05b889AFccA2C022A66B778d5BB0";
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const [isTransactionSuccessful, setIsTransactionSuccessful] = useState<boolean | null>(null);

  const isJustNFTExistToUser = async (activeAccount: Account): Promise<boolean> => {
    try {
      const inst = await getNftContractInstance(activeAccount);
      return !!(await inst.userMetadata(activeAccount.address));
    } catch {
      return false;
    }
  };

  const buyEarthNFT = async () => {
    try {
      if (!activeAccount) {
        toast.info("Please connect wallet");
        return;
      }

      setIsTransactionInProgress(true);
      const inst = await getNftContractInstance(activeAccount);

      if (!(await isJustNFTExistToUser(activeAccount))) {
        toast("You do not have a Just NFT!", { icon: "ℹ️" });
        return;
      }

      const res = await inst?.mint(energyToken);
      await res.wait();

      const receipt = await inst.provider.getTransactionReceipt(res.hash);
      const iface = new ethers.utils.Interface([
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
      ]);

      let tokenIdIs: number | undefined;
      receipt.logs.forEach((log: any) => {
        try {
          const parsed = iface.parseLog(log);
          if (parsed.name === "Transfer")
            tokenIdIs = ethers.BigNumber.from(parsed.args.tokenId).toNumber();
        } catch {}
      });

      await setEarthNFTDB(activeAccount.address, tokenIdIs!);
      setIsTransactionSuccessful(true);
      router.refresh();
    } catch (error: any) {
      if (error.message?.includes("User DOnt Have Sufficient Amount")) {
        toast.error("Insufficient energy token balance.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      setIsTransactionSuccessful(false);
    } finally {
      setIsTransactionInProgress(false);
    }
  };

  const setEarthNFTDB = async (address: string, tokenId: number) => {
    try {
      const response = await setNFTsToDB(address, 1, tokenId);
      if (!response.status) { toast.error(response.message); return; }
      toast.success(response.message);
    } catch (error) {
      console.log("setEarthNFTDB error", error);
    }
  };

  useEffect(() => {
    if (isTransactionSuccessful) router.refresh();
  }, [isTransactionSuccessful, router]);

  if (isTransactionInProgress) return <MintingLoader />;

  return (
    <div className="w-full max-w-5xl" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl border border-white/[0.07] overflow-hidden bg-[#0a0a0a]">

        {/* ── Left: GIF ── */}
        <div className="relative flex items-center justify-center bg-[#080808] min-h-[280px] lg:min-h-[460px] p-8">
          <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-white/10 rounded-tl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-white/10 rounded-br-lg" />

          <div className="relative">
            <img
              src="/GENESIS-GIF.gif"
              alt="Genesis NFT"
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
                Genesis Collection
              </span>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-tight">
                Genesis
              </h1>
              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-tight">
                NFT
              </h1>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <Users className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-[13px] font-medium text-zinc-300 tabular-nums">{earthNFTsCount}</span>
                <span className="text-[11px] text-zinc-600">minted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[12px] text-zinc-500">Top 21%</span>
              </div>
            </div>

            {/* Price */}
            <div className="px-4 py-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[11px] text-zinc-600 uppercase tracking-widest mb-2">Current Price</p>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-zinc-400" />
                <span className="text-[22px] font-light text-white tracking-tight">50</span>
                <span className="text-[13px] text-zinc-400 font-medium">MUBooster Token</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 space-y-3">
            <button
              onClick={buyEarthNFT}
              disabled={isTransactionInProgress}
              className="w-full py-3.5 rounded-2xl bg-white text-black text-[14px] font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isTransactionInProgress ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Minting…
                </>
              ) : (
                <>
                  Mint Genesis NFT
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Transfer */}
            <div className="flex justify-center">
              <TransferNFT />
            </div>

            <p className="text-center text-[11px] text-zinc-700 tracking-wide">
              Requires Just Creator NFT · Energy Token payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyEarthNFT;