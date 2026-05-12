/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";
import { animate, motion } from "framer-motion";
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getNFTNameImg } from "@/helper";
import { Zap } from "lucide-react";

interface NFTCardType {
  nftName: string;
  nftLevel: number;
  nftId: number;
}

export function NFTCard({ nftName, nftLevel, nftId }: NFTCardType) {
  console.log('nftName',nftName);
  useEffect(() => {
    animate(
      ".nft-hero-img",
      { y: [0, -8, 0] },
      { duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }
    );
  }, []);

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
      <div className="relative h-[200px] sm:h-[220px] flex items-center justify-center overflow-hidden"
        style={{ background: "#080810" }}
      >
        {/* Subtle radial glow */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(255,200,60,0.09), transparent 65%)" }} />

        {/* Active badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>Active</span>
        </div>

        {/* Token ID badge */}
        <div className="absolute top-3 right-3 rounded-full px-2.5 py-1.5 backdrop-blur-md"
          style={{
            background: "rgba(255,200,60,0.1)",
            border: "1px solid rgba(255,200,60,0.25)",
          }}
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

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </div>
      {/* Info */}
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-[15px] font-extrabold leading-none" style={{ color: "#f0f0f8", fontFamily: "'Outfit', sans-serif" }}>{nftName}</h3>
            <p className="text-[11px] mt-1 font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>Level {nftLevel} &nbsp;·&nbsp; Token #{nftId}</p>
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
         {
          nftName === "Just Creator"?  
          ''
          :
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
          
          }
        </Link>

      </div>
    </motion.div>
  );
}