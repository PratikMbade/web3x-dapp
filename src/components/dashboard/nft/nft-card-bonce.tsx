'use client';

import { memo } from 'react';
import { getNFTNameImg } from '@/helper';
import Image from 'next/image';
import { UserNFTs } from '@/generated/prisma';

interface NFTCardProps {
  token: UserNFTs;
}

export const NFTCardBonce = memo(
  function NFTCardBonce({ token }: NFTCardProps) {
    return (
      <div className="rounded-lg bg-zinc-900/60 mb-4 overflow-hidden">
        {/* ── Weekly release notice ── */}
        <div className="flex items-center gap-2 bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2">
          <span className="text-yellow-400 text-xs">&#9432;</span>
          <p className="text-xs font-medium text-yellow-300">
            NFT Bonus will be released in <span className="font-bold">1 week</span> — next payout every Monday 00:00 UTC
          </p>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-4">
            <Image
              src={getNFTNameImg(token.tokenType) || '/placeholder.svg'}
              alt={`NFT Token ${token.tokenId}`}
              width={50}
              height={100}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg"
            />
            <span className="text-sm text-zinc-500">
              Token id #{token.tokenId}
            </span>
          </div>
        </div>
      </div>
    );
  },
);
