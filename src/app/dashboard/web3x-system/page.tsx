/* eslint-disable react-hooks/rules-of-hooks */
import MetaSystemLevelShower from '@/components/dashboard/web3x-system/web3x-mn-plan';
import NFTLevelShower from '@/components/dashboard/web3x-system/nft-level-shower';
import { getUserById, getUserHighestPackage } from '@/actions/user';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getSession } from '@/lib/get-session';
import { getUserHighestNFT } from '@/actions/nft';



const mockNftData = {
  id: "1",
  userId: "user-123",
  tokenType: 0,
  tokenId: 1001,
  mintDate: new Date(),
  royaltNFTId: "royalty-123"
};



export default async function MetaUnitySystemPage() {
  const session = await getSession()
  const highestPackage = await getUserHighestPackage(session?.user.wallet_address || "")
  const userHighestNFT = await getUserHighestNFT(session?.user?.wallet_address || '')


  return (
    <main className="min-h-screen  ">
      <MetaSystemLevelShower highestPackage={highestPackage?.packageNumber || 0}/>
      <NFTLevelShower nftData={userHighestNFT}/>
    
    </main>
  );
}
