/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { memo, useEffect, useState } from 'react';
import { storeUserNFTClaimedHistory } from '@/actions/nft/index';
import { getNftContractInstance } from '@/contract/royaltynfts/nft-contract-instance';
import { getNFTNameImg } from '@/helper';
import { ethers } from 'ethers';
import Image from 'next/image';
import { useActiveAccount } from 'thirdweb/react';
import { UserNFTs } from '@/generated/prisma';
import { toast } from 'sonner';

interface NFTCardProps {
  token: UserNFTs;
}

interface NFTBonusDetail {
  amount: number;
  timeRemaining: string;
}

// 1. Use `memo()` to wrap your component
export const NFTCardBonce = memo(
  function NFTCardBonce({ token }: NFTCardProps) {
    const activeAccount = useActiveAccount();

    // State to store NFT bonus details for the specific token type.
    const [nftDetails, setNftDetails] = useState<
      Record<number, NFTBonusDetail>
    >({});

    // Loading state.
    const [loading, setLoading] = useState(true);

    // Formatted countdown timer string.
    const [formattedTime, setFormattedTime] = useState('00hr:00min:00sec');

    // Fetch bonus details for just this token’s tokenType
    useEffect(() => {
      if (!activeAccount) {
        console.log('Wallet not detected');
        setLoading(false);
        return;
      }

      setLoading(true);

      (async () => {
        try {
          const nftContractInstance = await getNftContractInstance(
            activeAccount
          );

          // Amount of tokens released
          const amountRes = await nftContractInstance.releasedTokenAmt();
          const amount = ethers.utils.formatEther(amountRes);

          const details: Record<number, NFTBonusDetail> = {};

          // For each token type from 1 to 5
          for (let i = 1; i <= 5; i++) {
            const totalNFTsRes = await nftContractInstance.totalNFT(i);
            const totalNFTs = ethers.BigNumber.from(totalNFTsRes).toNumber();

            // Distribution map for each token type
            const nftsDistributionMap: Record<number, number> = {
              1: 0.1,
              2: 0.15,
              3: 0.2,
              4: 0.25,
              5: 0.3,
            };

            // Distribution factor for the current token’s type
            const distribution = nftsDistributionMap[i] ?? 0;

            // Set NFT bonus detail for this tokenType
            details[i] = {
              amount: (Number(amount) * distribution) / totalNFTs,
              timeRemaining: '13h:09m:10s', // Update dynamically if needed
            };
          }

          setNftDetails(details);
        } catch (error) {
          console.error('Error fetching NFT bonus:', error);
        } finally {
          setLoading(false);
        }
      })();
    }, [activeAccount]);

    // Global weekly countdown timer (counts to next Monday 00:00 UTC)
    useEffect(() => {
      const timer = window.setInterval(() => {
        const now = new Date();

        // UTC weekday: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const utcDay = now.getUTCDay();

        // Days until next Monday; if today is Monday, we want 7 days (next Monday)
        const daysUntilNextMonday = ((1 - utcDay + 7) % 7) || 7;

        // Build a Date for next Monday 00:00:00 UTC
        const nextMondayUTC = Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + daysUntilNextMonday,
          0,
          0,
          0,
          0
        );

        const diffMs = nextMondayUTC - Date.now();

        if (diffMs <= 0) {
          setFormattedTime('00d:00hr:00min:00sec');
        } else {
          const diffSec = Math.floor(diffMs / 1000);
          const days = Math.floor(diffSec / 86400);
          const hours = Math.floor((diffSec % 86400) / 3600);
          const minutes = Math.floor((diffSec % 3600) / 60);
          const seconds = diffSec % 60;

          const formatted = `${days.toString().padStart(2, '0')}d:${hours
            .toString()
            .padStart(2, '0')}hr:${minutes
              .toString()
              .padStart(2, '0')}min:${seconds.toString().padStart(2, '0')}sec`;
          setFormattedTime(formatted);
        }
      }, 1000);

      return () => clearInterval(timer);
    }, []);



    async function claimBonus(tokenType: number, tokenId: number) {
      if (!activeAccount) {
        console.log('Wallet not detected');
        return;
      }
      console.log(
        'Claiming bonus for token type:',
        tokenType,
        'tokenId:',
        tokenId
      );

      try {
        const nftContractInstance = await getNftContractInstance(activeAccount);
        // Send the transaction
        const tx = await nftContractInstance.withdrawRewardByID(
          tokenType,
          tokenId
        );
        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        // Look for the evntrewardwithdraw event in the receipt
        const event = receipt.events?.find(
          (event: any) => event.event === 'evntrewardwithdraw'
        );

        let claimedAmount = '0';
        if (event) {
          const { user, amount, tokentype, tokenid, timestamp } = event.args;
          console.log('Event data:', {
            user,
            amount,
            tokentype,
            tokenid,
            timestamp,
          });
          claimedAmount = ethers.utils.formatEther(amount);
        } else {
          console.log('evntrewardwithdraw event not found in receipt');
        }

        toast.success('Bonus claimed successfully');
        storeUserNFTClaimedHistory(
          activeAccount.address,
          tokenType,
          tokenId,
          claimedAmount
        );
      } catch (error: any) {
        if (error?.message && error.message.includes('Already Claimed')) {
          toast.error('Already Claimed Bonus');
        } else if (
          error?.message &&
          error.message.includes('After reset you can claim the amount')
        ) {
            toast.error(
            'You have just minted this NFT. Please wait for the current 1-week cycle to end before claiming your bonus.'
            );
        } else if (
          error?.message &&
          error.message.includes('You Dont Have Just Token')
        ) {
          toast.error('To claim bonus you need to have Just NFT');
        } else {
          toast.error('Error claiming bonus');
        }
        console.error('Claim bonus error:', error);
      }
    }

    return (
      <div className="rounded-lg bg-zinc-900/60 p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <Image
              src={getNFTNameImg(token.tokenType) || '/placeholder.svg'}
              alt={`NFT Token ${token.tokenId}`}
              width={50}
              height={100}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg"
            />
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-xl sm:text-xl text-white">
                Time for withdraw
              </h3>
              {/* Display the fixed 24hr countdown timer */}
              <p className="text-lg sm:text-xl text-white">{formattedTime}</p>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-sm text-zinc-500">
                Token id #{token.tokenId}
              </span>
              <span className="text-xl sm:text-xs text-white">
                {loading
                  ? 'Loading...'
                  : `WBNB ${nftDetails[token.tokenType]?.amount.toFixed(5) || 0}`}
              </span>
            </div>
            <button
              onClick={() => claimBonus(token.tokenType, token.tokenId)}
              className="px-4 sm:px-6 py-2 text-black font-medium bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors"
              disabled={loading}
            >
              Claim
            </button>
          </div>
        </div>
      </div>
    );
  },
);