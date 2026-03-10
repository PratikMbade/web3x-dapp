export const baseAmounts: Record<number, number> = {
  1: 5,
  2: 10,
  3: 20,
  4: 40,
  5: 80,
  6: 160,
  7: 320,
  8: 640,
  9: 1280,
  10: 2560,
  11: 5120,
  12: 10240,
};

export const baseAmounts50: Record<number, number> = {
  1: 2.5,
  2: 5,
  3: 10,
  4: 20,
  5: 40,
  6: 80,
  7: 160,
  8: 320,
  9: 640,
  10: 1280,
  11: 2560,
  12: 5120,
};


export const slotRanks: Record<number, string> = {
  0:'No active package',
   1: 'Explorer',
   2: 'Builder',
   3: 'Strategist',
   4: 'Innovator',
   5: 'Mentor',
   6: 'Achiever',
   7: 'Wayfinder',
   8: 'Leader',
   9: 'Seer',
   10: 'Sage',
   11: 'Champion',
   12: 'Shining Star',
 };




 export const getPackageAmountByPackageId = (packageId: number) => {
   switch (packageId) {
     case 1:
       return 5;
     case 2:
       return 10;
     case 3:
       return 20;
     case 4:
       return 40;
     case 5:
       return 80;
     case 6:
       return 160;
     case 7:
       return 320;
     case 8:
       return 640;
     case 9:
       return 1280;
     case 10:
       return 2560;
     case 11:
       return 5120;
     case 12:
       return 10240;
     default:
       return 0;
   }
 };

 export const getPackageNumberByLevelAmount = (amount: string) => {
   switch (amount) {
     case '100000000000000000':
       return 1;
     case '150000000000000000':
       return 1;
     case '200000000000000000':
       return 2;
     case '300000000000000000':
       return 2;
     case '400000000000000000':
       return 3;
     case '600000000000000000':
       return 3;
     case '800000000000000000':
       return 4;
     case '1200000000000000000':
       return 4;
     case '1600000000000000000':
       return 5;
     case '2400000000000000000':
       return 5;
     case '3200000000000000000':
       return 6;
     case '4800000000000000000':
       return 6;
     case '6400000000000000000':
       return 7;
     case '9600000000000000000':
       return 7;
     case '12800000000000000000':
       return 8;
     case '19200000000000000000':
       return 8;
     case '25600000000000000000':
       return 9;
     case '38400000000000000000':
       return 9;
     case '51200000000000000000':
       return 10;
     case '76800000000000000000':
       return 10;
     case '102400000000000000000':
       return 11;
     case '153600000000000000000':
       return 11;
     case '204800000000000000000':
       return 12;
     case '307200000000000000000':
       return 12;
     default:
       return 0;
   }
 };

 export const getPackageNumberByMatrixAmount = (amount: string) => {
   switch (amount) {
     case '2500000000000000000':
       return 1;
     case '5000000000000000000':
       return 2;
     case '10000000000000000000':
       return 3;
     case '20000000000000000000':
       return 4;
     case '40000000000000000000':
       return 5;
     case '80000000000000000000':
       return 6;
     case '160000000000000000000':
       return 7;
     case '320000000000000000000':
       return 8;
     case '640000000000000000000':
       return 9;
     case '1280000000000000000000':
       return 10;
     case '2560000000000000000000':
       return 11;
     case '5120000000000000000000':
       return 12;
     default:
       return 0;
   }
 };



 export const getNFTName = (tokenType: number): string => {
  switch (tokenType) {
    case 0:
      return 'Just Creator';
    case 1:
      return 'GenesisNFT';
    case 2:
      return 'UnityNFT';
    case 3:
      return 'LegacyNFT';
    case 4:
      return 'InfinityNFT';
    case 5:
      return 'CrownNFT';
    default:
      return 'UnknownNFT';
  }
};

export const getNFTNameImg = (tokenType: number): string => {
  switch (tokenType) {
    case 0:
      return 'https://res.cloudinary.com/dlttworg3/image/upload/v1758449155/Just_SpaceshipImg_xksckv.png';
    case 1:
      return 'https://res.cloudinary.com/dlttworg3/image/upload/v1758478856/EarthNFTImg_pzbzee.png';
    case 2:
      return 'https://res.cloudinary.com/dlttworg3/image/upload/v1758478786/MarsNFTImg_k1sjr4.png';
    case 3:
      return 'https://res.cloudinary.com/dlttworg3/image/upload/v1758478812/VenusNFTImg_vdipav.png';
    case 4:
      return 'https://res.cloudinary.com/dlttworg3/image/upload/v1758478826/SaturnNFTImg_iswhah.png';
    case 5:
      return 'https://res.cloudinary.com/dlttworg3/image/upload/v1758478801/NeptuneNFTImg_bwhdvi.png';
    default:
      return 'UnknownNFT';
  }
};

export const getNFTType = (nftName: string): number => {
  switch (nftName) {
    case 'Just Creator':
      return 0;
    case 'GenesisNFT':
      return 1;
    case 'UnityNFT':
      return 2;
    case 'LegacyNFT':
      return 3;
    case 'InfinityNFT':
      return 4;
    case 'CrownNFT':
      return 5;
    default:
      return -1; // Indicates an unknown NFT type
  }
};

export const getNFTForTab = (tokenType: string): number => {
  switch (tokenType) {
    case 'earth':
      return 1;
    case 'mars':
      return 2;
    case 'venus':
      return 3;
    case 'saturn':
      return 4;
    case 'neptune':
      return 5;

    default:
      return 0;
  }
};

export const getPlanetNameById = (tokenType: number): string => {
  switch (tokenType) {
    case 0:
      return 'BN_Logo';
    case 1:
      return 'Earth';
    case 2:
      return 'Moon';
    case 3:
      return 'Mars';
    case 4:
      return 'Mercury';
    case 5:
      return 'Venus';
    case 6:
      return 'Jupiter';
    case 7:
      return 'Saturn';
    case 8:
      return 'Uranus';
    case 9:
      return 'Neptune';
    case 10:
      return 'Pluto';
    default:
      return 'BN_Logo';
  }
};
export const getNftNumber = (tokenType: string): number => {
  switch (tokenType) {
    case 'Just Creator':
      return 0;
    case 'GenesisNFT':
      return 1;
    case 'UnityNFT':
      return 2;
    case 'LegacyNFT':
      return 3;
    case 'InfinityNFT':
      return 4;
    case 'CrownNFT':
      return 5;
    default:
      return -1;
  }
};

