import { getUserAllNFTs, getUserNFTsByName } from "@/actions/nft";
import { getNFTType } from "@/helper";
import { redirect } from "next/navigation";
import { NFTCard } from "@/components/dashboard/nft/nft-cards";
import NFTMerge from "@/components/dashboard/nft/nft-merge";
import { NFTBonceCard } from "@/components/dashboard/nft/nft-main-bonce";
import { getSession } from "@/lib/get-session";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ mergenfts: string[] }>;
};

export default async function NFTMergePage({ params }: Props) {
  const session = await getSession();
  if (!session?.user.wallet_address) redirect("/");

  const { mergenfts } = await params;
  const [nftName, nftId] = mergenfts;

  const [userTokenForId, userAllNFTs] = await Promise.all([
    getUserNFTsByName(session.user.wallet_address, getNFTType(nftName)),
    getUserAllNFTs(session.user.wallet_address),
  ]);

  if (!userTokenForId) return null;

  return (
    <div className="min-h-screen w-full">

      {/* ── Topbar ── */}
      <div className="sticky top-0 z-20  backdrop-blur-xl ">
        <div className=" mx-auto px-4 sm:px-6 h-[52px] flex items-center justify-between">
          <Link href="/dashboard/nft">
            <div className="group flex items-center gap-2 text-white hover:text-white transition-colors duration-200">
              <div className="w-7 h-7 rounded-lg border border-[#222] group-hover:border-[#333] flex items-center justify-center transition-all">
                <ArrowLeft style={{ width: 13, height: 13 }} />
              </div>
              <span className="text-[12px] font-medium hidden sm:block">Back to NFTs</span>
            </div>
          </Link>


          <div className="w-24 sm:w-28" />
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="px-4 py-4">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-[22px] sm:text-[26px] font-extrabold text-white tracking-tight leading-none">
            Merge NFTs
          </h1>
          <p className="text-[13px] text-[#555] mt-1.5">
            Combine tokens to evolve your collection
          </p>
        </div>
    <div className=" items-start">

          <NFTMerge
            userAvailableNFTs={userTokenForId}
            nftId={Number(nftId)}
            nftType={getNFTType(nftName)}
          />
        </div>
        {/* ── 1. BOUNCE SECTION (TOP) ── */}
        <div className="mt-5">
          <NFTBonceCard nft={userAllNFTs!} />
        </div>

        {/* ── 2. NFT CARD + MERGE (BELOW) ── */}
    

      </div>
    </div>
  );
}