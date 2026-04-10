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
      className="w-full bg-[#161616] border border-[#222] rounded-[20px] overflow-hidden"
    >
      {/* Image zone */}
      <div className="relative h-[200px] sm:h-[220px] bg-[#111] flex items-center justify-center overflow-hidden">
        {/* Subtle radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(249,115,22,0.09),transparent_65%)]" />

        {/* Active badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 border border-[#2a2a2a] rounded-full px-2.5 py-1.5 backdrop-blur-md">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-[#aaa]">Active</span>
        </div>

        {/* Token ID badge */}
        <div className="absolute top-3 right-3 bg-black/70 border border-[#2a2a2a] rounded-full px-2.5 py-1.5 backdrop-blur-md">
          <span className="text-[10px] font-bold text-yellow-400">#{nftId}</span>
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
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#161616] to-transparent" />
      </div>

      {/* Info */}
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-[15px] font-extrabold text-white leading-none">{nftName}</h3>
            <p className="text-[11px] text-[#555] mt-1 font-medium">Level {nftLevel} &nbsp;·&nbsp; Token #{nftId}</p>
          </div>
        </div>

        <div className="h-px bg-[#1f1f1f] mb-3" />

        <Link
          href={
            nftName === "Just Spaceship"
              ? "/dashboard/nft"
              : `/dashboard/nft/${nftName}/${nftId}`
          }
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 transition-colors duration-200 text-white text-[13px] font-bold rounded-xl py-3 cursor-pointer"
          >
            <Zap style={{ width: 14, height: 14 }} />
            Upgrade NFT
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}