/* eslint-disable @typescript-eslint/no-unused-vars */
/* src/components/dashboard/nft/user-nfts.tsx */
'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NFTCard } from '@/components/dashboard/nft/nft-cards';
import { GetNFTSTypes } from '@/actions/nft/types';
import { TabsContent } from '@radix-ui/react-tabs';
import { getNFTForTab, getNFTName } from '@/helper';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Filter, ChevronDown, Check } from 'lucide-react';
import { useNFTStore } from '@/store/recoil-store/nftStates';

const nftCategories = [
  { value: 'all', label: 'All NFTs' },
  { value: 'just', label: 'Just Creator' },
  { value: 'earth', label: 'Genesis NFTs' },
  { value: 'mars', label: 'Unity NFTs' },
  { value: 'venus', label: 'Legacy NFTs' },
  { value: 'saturn', label: 'Infinity NFTs' },
  { value: 'neptune', label: 'Crown NFTs' },
];

const UserNFTs = ({ userNFTs }: { userNFTs: GetNFTSTypes[] }) => {
const clearDisableIds = useNFTStore((s) => s.clearDisableIds);
// if you need the array:
const disableIds = useNFTStore((s) => s.disableIds);

  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // clear on mount
  clearDisableIds();

    // only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredNFTs = userNFTs?.filter(
    (data) => data.tokenType === getNFTForTab(selectedCategory)
  ) ?? [];

  return (
    <div className="border-t flex flex-col mb-10" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="mx-4 md:mx-16 my-4">
        <p className="text-3xl font-semibold text-center lg:text-start mt-3" style={{ color: "#f0f0f8", fontFamily: "'Outfit', sans-serif" }}>
          My NFTs
        </p>
      </div>

      <div className="w-full px-4 md:px-8">
        {/* Mobile Filter Dropdown */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between hover:bg-black/60"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {
                    nftCategories.find((cat) => cat.value === selectedCategory)
                      ?.label
                  }
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[calc(100vw-32px)]"
              style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)" }}
              align="center"
            >
              {nftCategories.map((category) => (
                <DropdownMenuItem
                  key={category.value}
                  className="flex items-center justify-between py-2 cursor-pointer"
                  style={{ color: selectedCategory === category.value ? "#ffc83c" : "rgba(255,255,255,0.5)" }}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                  {selectedCategory === category.value && (
                    <Check className="h-4 w-4" style={{ color: "#ffc83c" }} />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="mt-4">
            {selectedCategory === 'all' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
                {userNFTs?.map((data) => (
                  <NFTCard
                    key={data.id}
                    nftName={getNFTName(data.tokenType)}
                    nftLevel={data.tokenType}
                    nftId={data.tokenId}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
                {filteredNFTs.length > 0 ? (
                  filteredNFTs.map((data) => (
                    <NFTCard
                      key={data.id}
                      nftName={getNFTName(data.tokenType)}
                      nftLevel={data.tokenType}
                      nftId={data.tokenId}
                    />
                  ))
                ) : (
                  <p style={{ color: "rgba(255,255,255,0.4)" }}>No NFTs found for the selected category.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="h-12 flex flex-nowrap overflow-x-auto w-full items-center justify-start p-1 scrollbar-hide"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {nftCategories.map((category) => (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="relative h-9 rounded-full px-6 text-base font-medium transition-all"
                  style={{
                    color: selectedCategory === category.value ? "#ffc83c" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {selectedCategory === 'all' ? (
              <TabsContent
                value={'all'}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-7"
              >
                {userNFTs?.map((data) => (
                  <NFTCard
                    key={data.id}
                    nftName={getNFTName(data.tokenType)}
                    nftLevel={data.tokenType}
                    nftId={data.tokenId}
                  />
                ))}
              </TabsContent>
            ) : (
              <TabsContent
                value={selectedCategory}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-7"
              >
                {filteredNFTs.length > 0 ? (
                  filteredNFTs.map((data) => (
                    <NFTCard
                      key={data.id}
                      nftName={getNFTName(data.tokenType)}
                      nftLevel={data.tokenType}
                      nftId={data.tokenId}
                    />
                  ))
                ) : (
                  <p style={{ color: "rgba(255,255,255,0.4)" }}>No NFTs found for the selected category.</p>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserNFTs;
