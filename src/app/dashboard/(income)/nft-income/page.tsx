// app/dashboard/nft-bonus-history/page.tsx

import { Coins, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSession } from "@/lib/get-session";

import { NFTBonusHistoryTable } from "@/components/dashboard/income/nft-bonus-history-table";
import { getUserNFTBonusHistory } from "@/actions/nft";

export default async function NFTBonusHistoryPage() {
 const session = await getSession();
 const walletAddress = session?.user.wallet_address
  const history = walletAddress
    ? await getUserNFTBonusHistory(walletAddress.toLowerCase())
    : null;

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* ── Header ── */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                NFT Bonus History
              </h1>
              <p className="text-sm text-muted-foreground">
                All bonus claims linked to your wallet
              </p>
            </div>
          </div>

          {walletAddress && (
            <p className="pl-1 pt-1 font-mono text-xs text-muted-foreground break-all">
              {walletAddress}
            </p>
          )}
        </div>

        {/* ── Content ── */}
        {!walletAddress ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No wallet address provided. Pass <code>?wallet=0x…</code> in the URL.
            </AlertDescription>
          </Alert>
        ) : history === null ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Could not fetch bonus history. The wallet may not be registered.
            </AlertDescription>
          </Alert>
        ) : history.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No NFT bonus history found for this wallet.</AlertDescription>
          </Alert>
        ) : (
          <NFTBonusHistoryTable data={history} />
        )}
      </div>
    </main>
  );
}