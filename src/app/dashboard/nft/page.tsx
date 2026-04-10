
import RenderNFTBuy from "@/components/dashboard/nft/nft-buy-main";
import React from "react";
import UserNFTs from "@/components/dashboard/nft/user-nfts";
import { getEarthNFTsCount, getJustNFTsCount, getUserNFTs } from "@/actions/nft/index";
import { redirect } from "next/navigation";
import { GetNFTSTypes } from "@/actions/nft/types";
import { getSession } from "@/lib/get-session";





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

       <RenderNFTBuy justNFTsCount={justNFTsCount} earthNFTsCount={earthNFTsCount} />
       <UserNFTs userNFTs={userNFTs!} />

    </>
  );
}