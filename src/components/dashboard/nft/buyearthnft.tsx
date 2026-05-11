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
      <div className="rounded-3xl flex flex-col items-center justify-center gap-6 py-24 px-8"
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #080810 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full animate-ping" style={{ border: "1px solid rgba(255,200,60,0.2)" }} />
          <div className="absolute inset-2 rounded-full animate-pulse" style={{ border: "1px solid rgba(255,200,60,0.3)" }} />
          <div className="absolute inset-4 rounded-full flex items-center justify-center" style={{ background: "rgba(255,200,60,0.08)" }}>
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#ffc83c" }} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[15px] font-medium mb-1" style={{ color: "#f0f0f8" }}>Minting NFT</p>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>Please wait and don&apos;t close this window…</p>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const BuyEarthNFT = ({ earthNFTsCount }: Props) => {
  const activeAccount = useActiveAccount();
  const router = useRouter();
  const energyToken = "0x9eC40A3f1a91ad370d666d58EB557E0B2C60E591";
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
    <div className="w-full max-w-5xl" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #080810 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* ── Left: GIF ── */}
        <div className="relative flex items-center justify-center min-h-[280px] lg:min-h-[460px] p-8"
          style={{ background: "#080810" }}
        >
          {/* Corner accents */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t border-l rounded-tl-lg" style={{ borderColor: "rgba(255,200,60,0.2)" }} />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r rounded-br-lg" style={{ borderColor: "rgba(255,200,60,0.2)" }} />

          {/* Glow orb */}
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "rgba(255,200,60,0.06)", filter: "blur(60px)" }} />

          <div className="relative">
            <img
              src="/GENESIS-GIF.gif"
              alt="Genesis NFT"
              className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] object-cover rounded-2xl"
              style={{ border: "1px solid rgba(255,200,60,0.12)", boxShadow: "0 0 60px rgba(255,200,60,0.08)" }}
            />
          </div>
        </div>

        {/* ── Right: Details ── */}
        <div className="flex flex-col justify-between p-8 lg:p-10">
          <div className="space-y-6">

            {/* Tag */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: "rgba(255,200,60,0.6)" }}>
                Genesis Collection
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,200,60,0.1)" }} />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight leading-tight" style={{ color: "#f0f0f8" }}>
                Genesis
              </h1>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight" style={{ color: "#f0f0f8" }}>
                NFT
              </h1>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Users className="h-3.5 w-3.5" style={{ color: "rgba(255,255,255,0.4)" }} />
                <span className="text-[13px] font-medium tabular-nums" style={{ color: "#f0f0f8" }}>{earthNFTsCount}</span>
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>minted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>Top 21%</span>
              </div>
            </div>

            {/* Price */}
            <div className="px-4 py-4 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(255,200,60,0.07) 0%, rgba(255,120,0,0.04) 100%)",
                border: "1px solid rgba(255,200,60,0.2)",
              }}
            >
              <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: "rgba(255,200,60,0.6)" }}>Current Price</p>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" style={{ color: "#ffc83c" }} />
                <span className="text-[22px] font-bold tracking-tight" style={{ color: "#ffc83c", fontFamily: "'Space Mono', monospace" }}>125</span>
                <span className="text-[13px] font-medium" style={{ color: "rgba(255,200,60,0.7)" }}>Energy Token</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 space-y-3">
            <button
              onClick={buyEarthNFT}
              disabled={isTransactionInProgress}
              className="w-full py-3.5 rounded-2xl text-[14px] font-semibold active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #ffc83c 0%, #ff8c00 100%)",
                color: "#0a0a0f",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(255,200,60,0.35)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
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

            <p className="text-center text-[11px] tracking-wide" style={{ color: "rgba(255,255,255,0.25)" }}>
              Requires Just Creator NFT · Energy Token payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyEarthNFT;