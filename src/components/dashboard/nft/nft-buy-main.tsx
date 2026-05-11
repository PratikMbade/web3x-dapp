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
      style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}
    >
      {/* ── Tab switcher ── */}
      <div className="flex justify-center mb-10">
        <div className="relative flex p-1 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* sliding pill */}
          <div
            className="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-out"
            style={{
              left:  active === "create-nft" ? "4px" : "50%",
              right: active === "create-nft" ? "50%" : "4px",
              background: "rgba(255,200,60,0.12)",
              border: "1px solid rgba(255,200,60,0.28)",
            }}
          />
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="relative z-10 px-5 py-2.5 rounded-xl text-[13px] font-semibold tracking-wide transition-colors duration-200 whitespace-nowrap"
              style={{
                color: active === tab.id ? "#ffc83c" : "rgba(255,255,255,0.35)",
              }}
              onMouseEnter={(e) => {
                if (active !== tab.id) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)";
              }}
              onMouseLeave={(e) => {
                if (active !== tab.id) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)";
              }}
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