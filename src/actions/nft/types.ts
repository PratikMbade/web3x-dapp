/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */


export interface GetNFTSTypes{
    id:string;
    userId:string;
    tokenType:number;
    tokenId:number;
    mintDate:Date;
    royaltNFTId:string;
}

export let userNFT:GetNFTSTypes[] = [ 
    
      {
        id:"1243",
        userId:"12324",
        tokenType:1,
        tokenId:12,
        mintDate: new Date(),
        royaltNFTId:"124"
       },
       {
        id:"1243",
        userId:"12324",
        tokenType:1,
        tokenId:12,
        mintDate: new Date(),
        royaltNFTId:"124"
       },
       {
        id:"1243",
        userId:"12324",
        tokenType:1,
        tokenId:12,
        mintDate: new Date(),
        royaltNFTId:"124"
       },
       

       {
        id:"1242",
        userId:"12325",
        tokenType:2,
        tokenId:14,
        mintDate: new Date(),
        royaltNFTId:"12"
       },
       {
        id:"124244",
        userId:"12325",
        tokenType:3,
        tokenId:4,
        mintDate: new Date(),
        royaltNFTId:"123"
       },
       {
        id:"1242667",
        userId:"12325",
        tokenType:4,
        tokenId:3,
        mintDate: new Date(),
        royaltNFTId:"2"
       },
]
export interface SetNFTBuyResponseTypes{
    status: boolean;
     message: string;
     error?:any;
}