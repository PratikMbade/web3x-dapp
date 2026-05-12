
import RenderNFTBuy from "@/components/dashboard/nft/nft-buy-main";
import React from "react";
import UserNFTs from "@/components/dashboard/nft/user-nfts";
import { getEarthNFTsCount, getJustNFTsCount, getUserNFTs } from "@/actions/nft/index";
import { redirect } from "next/navigation";
import { GetNFTSTypes } from "@/actions/nft/types";
import { getSession } from "@/lib/get-session";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";





export default async function NFTPage() {
  const session = await getSession()


  if(!session?.user.wallet_address){
    redirect("/")
  }

  //get user nfs from server actions
  const userNFTs:GetNFTSTypes[] | undefined= await getUserNFTs(session.user.wallet_address);

  const justNFTsCount = await getJustNFTsCount();
  const earthNFTsCount = await getEarthNFTsCount();

  return (
     <>
       <div className="px-4 md:px-8 pt-4">
         <Link
           href="/dashboard/web3x-system"
           className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
           style={{ color: "rgba(255,255,255,0.5)" }}
         >
           <ArrowLeft className="h-4 w-4" />
           Back
         </Link>
       </div>

       <RenderNFTBuy justNFTsCount={justNFTsCount} earthNFTsCount={earthNFTsCount} />
       <UserNFTs userNFTs={userNFTs!} />

    </>
  );
}