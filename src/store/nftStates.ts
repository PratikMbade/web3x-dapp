// src/store/zustand/nftStore.ts
import { create } from 'zustand';
import type { GetNFTSTypes } from '@/actions/nft/types';

type NFTStore = {
  // state
  disableIds: number[];
  selectNFT2: boolean;
  selectNFT3: boolean;
  nft2Info: GetNFTSTypes | null;
  nft3Info: GetNFTSTypes | null;

  // actions
  setDisableIds: (ids: number[]) => void;
  pushDisableId: (id: number) => void;
  removeDisableId: (id: number) => void;
  clearDisableIds: () => void;

  setSelectNFT2: (v: boolean) => void;
  setSelectNFT3: (v: boolean) => void;

  setNft2Info: (info: GetNFTSTypes | null) => void;
  setNft3Info: (info: GetNFTSTypes | null) => void;
};

export const useNFTStore = create<NFTStore>((set) => ({
  disableIds: [],
  selectNFT2: false,
  selectNFT3: false,
  nft2Info: null,
  nft3Info: null,

  setDisableIds: (ids) => set({ disableIds: ids }),
  pushDisableId: (id) => set((s) => ({ disableIds: [...s.disableIds, id] })),
  removeDisableId: (id) =>
    set((s) => ({ disableIds: s.disableIds.filter((i) => i !== id) })),
  clearDisableIds: () => set({ disableIds: [] }),

  setSelectNFT2: (v) => set({ selectNFT2: v }),
  setSelectNFT3: (v) => set({ selectNFT3: v }),

  setNft2Info: (info) => set({ nft2Info: info }),
  setNft3Info: (info) => set({ nft3Info: info }),
}));
