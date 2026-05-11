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
          <div className="absolute top-4 left-4 w-8 h-8 border-t border-l rounded-tl-lg" style={{ borderColor: "rgba(255,200,60,0.2)" }} />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r rounded-br-lg" style={{ borderColor: "rgba(255,200,60,0.2)" }} />

          {/* Glow orb */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "rgba(255,200,60,0.06)", filter: "blur(60px)" }} />

          <div className="relative">
            <img
              src="/JUST_CREATOR_GIF.gif"
              alt="Just Creator NFT"
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
                Exclusive NFT
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,200,60,0.1)" }} />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight leading-tight" style={{ color: "#f0f0f8" }}>
                Just Creator
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
                <span className="text-[13px] font-medium tabular-nums" style={{ color: "#f0f0f8" }}>{justNFTsCount}</span>
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>holders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>Top 21%</span>
              </div>
            </div>

            {/* Notice */}
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
              style={{ background: "rgba(255,200,60,0.05)", border: "1px solid rgba(255,200,60,0.15)" }}
            >
              <Info className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "rgba(255,200,60,0.6)" }} />
              <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                Requires <span className="font-medium" style={{ color: "#f0f0f8" }}>4 active packages</span> in Web3X to claim your Just Creator NFT.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <button
              onClick={createJustNftToken}
              disabled={isPending}
              className="w-full py-3.5 rounded-2xl text-[14px] font-semibold active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #ffc83c 0%, #ff8c00 100%)",
                color: "#0a0a0f",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(255,200,60,0.35)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
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
            <p className="text-center text-[11px] mt-3 tracking-wide" style={{ color: "rgba(255,255,255,0.25)" }}>
              One-time · Non-transferable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJustNFT;