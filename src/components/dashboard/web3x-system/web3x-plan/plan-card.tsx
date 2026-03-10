/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Users2, DollarSign, CheckCircle2, Zap, ShieldCheck } from "lucide-react"
import PlanStructure from "./new-plan-structure"
import { Button } from "@/components/ui/button"
import type { Plan } from "@/types/plan"
import { useState } from "react"
import { useActiveAccount } from 'thirdweb/react'
import { toast } from 'sonner'
import { FadeLoader } from 'react-spinners'
import { contractInstance, metaunityAddress, wbnbContractInstance } from '@/contract/contract'
import { ethers } from 'ethers'
import { useRouter } from 'next/navigation'
import { isPackageBuyStored } from '@/actions/metaunity-system'
import { extractEventsFromReceipt, waitForPackageBuyEvent } from '@/contract/event-poller'
import { usdtToWbnb } from "@/lib/utils"
import { Package } from "@/generated/prisma/client"

interface PlanCardProps {
    id: number
    plan: Plan
    userPackage: Package | null
}

export default function PlanCard({ id, plan, userPackage }: PlanCardProps) {

    const activeAccount = useActiveAccount()
    const [isApproved, setIsApproved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [isBought, setIsBought] = useState(false)
    const router = useRouter()

    const handleApprove = async () => {
        try {
            if (!activeAccount) {
                toast.error('Please connect your wallet first')
                return;
            }

            setIsLoading(true)
            setIsPending(true)

            const contractInst = await wbnbContractInstance(activeAccount)

            const metaunityContract = await contractInstance(activeAccount)
            if (!metaunityContract) {
                toast.error('An error occurred while connecting...')
                return;
            }

            const userPackage: ethers.BigNumber = await metaunityContract.getPackage(activeAccount.address)
            const packageNumber = ethers.BigNumber.from(userPackage).toNumber()
            if (id !== packageNumber + 1) {
                toast.error('You need to buy the previous package first', {
                    description: 'You current package is ' + packageNumber + ' and you are trying to buy ' + plan.tier
                })
                setIsLoading(false)
                setIsPending(false)
                return;
            }

            if (!contractInst) {
                toast.error('An error occurred while connecting...')
                return;
            }

            const wbnbAmountReadable = await usdtToWbnb('10240');
            const wad = ethers.utils.parseUnits(wbnbAmountReadable, 18);

            const approve = await contractInst.approve(metaunityAddress, wad)
            const result = await approve.wait()

            if (result.status === 1) {
                setIsApproved(true)
                setIsLoading(false)
                setIsPending(false)
            } else {
                toast.error('Something went wrong in handleApprove')
                setIsLoading(false)
                setIsPending(false)
            }
        } catch (error: any) {
            console.log('error in handleApprove', error)
            toast.error("Approved failed")
            setIsLoading(false)
            setIsPending(false)
        } finally {
            setIsLoading(false)
            setIsPending(false)
        }
    }


    const handleBuy = async () => {
        try {

            if (!activeAccount) {
                toast.error('Please connect your wallet first')
                return;
            }

            setIsPending(true)

            const contractIns = await contractInstance(activeAccount)

            if (!contractIns) {
                toast.error('Contract instance not found')
                return;
            }

            const isUserRegistered = await contractIns.register(activeAccount.address)

            if (!isUserRegistered) {
                toast.error('User is not registered')
                return;
            }
            const USDT = "0x55d398326f99059fF775485246999027B3197955";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const pathToBuy = [USDT, WBNB]; // <-- strings, not bare hex literals

            let buy;
            if (plan.tier === 1) {


     console.log('contractIns',contractIns);

      buy = await contractIns.buyPackageUser(activeAccount.address, pathToBuy,true);
      console.log("callStatic simulation succeeded");            }
            else {
                buy = await contractIns.buyPackageUser(activeAccount.address,pathToBuy,true)
            }

            const result = await buy.wait()
            console.log('result in handleBuy', result)

            if (result.status === 1) {
                const isTranxDone = await isPackageBuyStored(result.transactionHash, activeAccount.address);
                console.log('isTranxDone',isTranxDone);
                if (!isTranxDone) {
                    const responses = await waitForPackageBuyEvent(result.transactionHash, activeAccount.address);
                    console.log('response in handleBuy', responses);

                    if (!responses.length) {
                        toast.error('Transaction failed, please try again');
                        setIsPending(false);
                        return;
                    }

                    const has200 = responses.some((r) => r.statusCode === 200);
                    const all201 = responses.every((r) => r.statusCode === 201);

                    if (has200) {
                        const res = await extractEventsFromReceipt(result.transactionHash, activeAccount.address);
                        console.log('extract event', res);

                        if (!res) {
                            toast.error('Event parsing failed');
                            setIsPending(false);
                            return;
                        }

                        toast.success('✅ Transaction completed successfully');
                    } else if (all201) {
                        toast.success('✅ Transaction already processed');
                    } else {
                        toast.success('✅ Transaction completed successfully');
                        setIsPending(false);
                        router.refresh();
                        return;
                    }
                }

                setIsBought(true);
                setIsPending(false);
                router.refresh();
            }

            else {
                toast.error('Something went wrong in handleBuy')
                setIsPending(false)
            }

        } catch (error: any) {
            if (error?.message?.includes('SafeMath') || error?.message?.includes('sub failed')) {
                toast.error("You haven't approved enough USDT. Please approve the required amount and try again.");
            } else {
                toast.error('An error occurred while approving the transaction. Please try again.');
            }
            console.log('error',error);
            setIsLoading(false)
            setIsPending(false)
        }
        finally {
            setIsPending(false)
        }
    }


    const isActivated = userPackage?.packageBuyTranxHash || isBought

    return (
        <>
            {/* Global Pending Overlay */}
            {isPending && (
                <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/70 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl scale-150" />
                        <FadeLoader color="#f97316" />
                    </div>
                    <div className="text-center space-y-1 max-w-sm px-6">
                        <p className="text-white font-semibold text-base tracking-wide">Transaction In Progress</p>
                        <p className="text-neutral-400 text-sm">Please do not close or refresh this page</p>
                    </div>
                </div>
            )}

            {/* Card */}
            <div
                className="relative w-80 lg:w-96 rounded-2xl overflow-hidden group"
                style={{
                    background: "linear-gradient(145deg, #141414 0%, #0d0d0d 100%)",
                    boxShadow: isActivated
                        ? "0 0 0 1px rgba(34,197,94,0.3), 0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"
                        : "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
                    transition: "box-shadow 0.3s ease"
                }}
            >
                {/* Top accent line */}
                <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                        background: isActivated
                            ? "linear-gradient(90deg, transparent, rgba(34,197,94,0.6), transparent)"
                            : "linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent)"
                    }}
                />

                {/* Subtle glow bg */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 opacity-10 blur-3xl pointer-events-none"
                    style={{
                        background: isActivated ? "#22c55e" : "#f97316",
                        borderRadius: "50%"
                    }}
                />

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2.5">
                        {isActivated ? (
                            <ShieldCheck className="h-4 w-4 text-green-400" />
                        ) : (
                            <Zap className="h-4 w-4 text-orange-400" />
                        )}
                        <span
                            className="uppercase text-xs font-bold tracking-[0.15em]"
                            style={{ color: isActivated ? "#4ade80" : "#fb923c" }}
                        >
                            {plan.displayName}
                        </span>
                    </div>

                    {/* <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 border border-white/8">
                        <span className="text-neutral-400 text-xs font-medium">0</span>
                        <Users2 className="h-3.5 w-3.5 text-neutral-500" />
                    </div> */}
                </div>

                {/* Divider */}
                <div className="mx-5 h-px bg-white/5" />

                {/* Plan Structure Visualization */}
                <div className="relative px-5 py-5">
                    <PlanStructure
                        planName={plan.name}
                        globalCount={0}
                        highestPlanetBought={plan.tier}
                    />
                </div>

                {/* Divider */}
                <div className="mx-5 h-px bg-white/5" />

                {/* Price Display */}
                <div className="px-5 py-4 flex items-center justify-between">
                    <span className="text-neutral-500 text-xs font-medium uppercase tracking-widest">Price</span>
                    <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-neutral-300" />
                        <span className="text-white text-lg font-semibold tracking-tight">
                            {plan.price}
                        </span>
                        <span className="text-neutral-500 text-sm ml-1">WBNB</span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="px-5 pb-5">
                    {isActivated ? (
                        <button
                            disabled
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold tracking-wide cursor-default"
                            style={{
                                background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(21,128,61,0.1))",
                                border: "1px solid rgba(34,197,94,0.25)",
                                color: "#4ade80"
                            }}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Activated
                        </button>
                    ) : isApproved ? (
                        <button
                            onClick={handleBuy}
                            disabled={isLoading}
                            className="w-full relative overflow-hidden rounded-xl py-3 text-sm font-semibold tracking-wide transition-all duration-200 active:scale-[0.98]"
                            style={{
                                background: isLoading
                                    ? "rgba(234,179,8,0.1)"
                                    : "linear-gradient(135deg, #ca8a04, #a16207)",
                                border: "1px solid rgba(234,179,8,0.3)",
                                color: isLoading ? "#a16207" : "#fff",
                                boxShadow: isLoading ? "none" : "0 4px 20px rgba(202,138,4,0.25)"
                            }}
                        >
                            <span className="relative flex items-center justify-center gap-2">
                                <Zap className="h-4 w-4" />
                                {isLoading ? "Activating..." : "Activate Package"}
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={handleApprove}
                            disabled={isLoading}
                            className="w-full relative overflow-hidden rounded-xl py-3 text-sm font-semibold tracking-wide transition-all duration-200 active:scale-[0.98]"
                            style={{
                                background: isLoading
                                    ? "rgba(249,115,22,0.08)"
                                    : "linear-gradient(135deg, #ea580c, #c2410c)",
                                border: "1px solid rgba(249,115,22,0.25)",
                                color: isLoading ? "#ea580c" : "#fff",
                                boxShadow: isLoading ? "none" : "0 4px 24px rgba(234,88,12,0.3)"
                            }}
                        >
                            <span className="relative flex items-center justify-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                {isLoading ? "Approving..." : "Approve & Continue"}
                            </span>
                        </button>
                    )}
                </div>

                {/* Bottom tier badge */}
                <div
                    className="absolute top-0 right-0 rounded-tl-xl px-3 py-1"
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        borderLeft: "1px solid rgba(255,255,255,0.05)"
                    }}
                >
                    <span className="text-neutral-600 text-[10px] font-medium tracking-widest uppercase">
                        Tier {plan.tier}
                    </span>
                </div>
            </div>
        </>
    )
}