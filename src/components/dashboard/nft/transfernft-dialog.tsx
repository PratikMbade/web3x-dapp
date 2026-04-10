"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getNftContractInstance } from "@/contract/royaltynfts/nft-contract-instance";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import TransactionLoader from "@/components/ui/loader";
import { transferNFT, TransferResponse } from '@/actions/nft/index';
import { toast } from "sonner";

interface TransfetNFTTypes {
  receiver_adr: string;
  tokenType: string;
  tokenId: string;
}

const TransferNFT = () => {
  const activeAccount = useActiveAccount();
  const router = useRouter();
  const [transferValues, setTransferValues] = useState<TransfetNFTTypes>({
    receiver_adr: "",
    tokenType: "",
    tokenId: "",
  });

  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const [isTransactionSuccessful, setIsTransactionSuccessful] = useState<
    boolean | null
  >(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setTransferValues((prev: TransfetNFTTypes) => ({
      ...prev,
      [id]: value,
    }));
  };

  const transferNFTs = async () => {
    try {
      console.log("he");
      if (!activeAccount) {
        toast.error("Please Connect Wallet");
        router.push("/");
        return;
      }

      setIsTransactionInProgress(true);

      console.log("data", transferValues);

      const nftContractInstance = await getNftContractInstance(activeAccount);

      const transx = await nftContractInstance.TransferNFT(
        transferValues.receiver_adr,
        Number(transferValues.tokenId),
        Number(transferValues.tokenType)
      );

      await transx.wait();
      console.log("trans", transx);


      const res: TransferResponse = await transferNFT(activeAccount.address, transferValues.receiver_adr, transferValues.tokenType, transferValues.tokenId);

      if(res.status === true){
        toast.success(res.message);
      }
      else{
        toast.error(res.message);
      }

      setIsTransactionSuccessful(true);
    } catch (error) {
      console.error("went wrong", error);
      setIsTransactionSuccessful(false);
    } finally {
      setIsTransactionInProgress(false);
    }
  };

  useEffect(() => {
    if (isTransactionSuccessful !== null) {

      if (isTransactionSuccessful) {


        router.refresh(); 
      } else {
        console.log("Transaction failed.");
      }
    }
  }, [isTransactionSuccessful, router]);

  return (
    <div className='w-full'>
      {isTransactionInProgress ? (
        <TransactionLoader loaderDescription="Please Wait Until.. NFT Getting Transfer" />
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="rounded-[7px] font-semibold text-lg py-3 px-10 w-full lg:w-fit"
              >
              Transfer NFT
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-80 lg:max-w-[580px] lg:h-[350px] rounded-[2px]">
            <DialogHeader>
              <DialogTitle>Transfer Earth NFTs</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you are done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className=" text-center text-sm w-full">
                  Receiver Address
                </Label>
                <Input
                  id="receiver_adr"
                  value={transferValues.receiver_adr}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-center">
                  NFT Type
                </Label>
                <Input
                  id="tokenType"
                  value={transferValues.tokenType}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-center">
                  NFT Id
                </Label>
                <Input
                  id="tokenId"
                  value={transferValues.tokenId}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={transferNFTs} type="button" 

               >
                Transfer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TransferNFT;