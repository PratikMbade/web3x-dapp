'use client'
import React, { useState } from "react";
import BuyEarthNFT from "./buyearthnft";
import CreateJustNFT from "./create-just-nft";

type Props = {
  justNFTsCount: number;
  earthNFTsCount: number;
};

const TABS = [
  { id: "create-nft" as const, label: "Just Creator NFT" },
  { id: "mint-nft"   as const, label: "Genesis NFT" },
];

type TabId = typeof TABS[number]["id"];

const RenderNFTBuy = ({ justNFTsCount, earthNFTsCount }: Props) => {
  const [active, setActive] = useState<TabId>("create-nft");

  return (
    <div
      className="w-full my-8 px-4"
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      {/* ── Tab switcher ── */}
      <div className="flex justify-center mb-10">
        <div className="relative flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
          {/* sliding pill */}
          <div
            className="absolute top-1 bottom-1 rounded-xl bg-white/[0.09] border border-white/[0.10] transition-all duration-300 ease-out"
            style={{
              left:  active === "create-nft" ? "4px" : "50%",
              right: active === "create-nft" ? "50%" : "4px",
            }}
          />
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`relative z-10 px-5 py-2.5 rounded-xl text-[13px] font-semibold tracking-wide transition-colors duration-200 whitespace-nowrap ${
                active === tab.id
                  ? "text-white"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex justify-center w-full">
        {active === "create-nft" && <CreateJustNFT justNFTsCount={justNFTsCount} />}
        {active === "mint-nft"   && <BuyEarthNFT   earthNFTsCount={earthNFTsCount} />}
      </div>
    </div>
  );
};

export default RenderNFTBuy;