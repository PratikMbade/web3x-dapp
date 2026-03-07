/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, ArrowRight } from "lucide-react"
import { toast } from 'sonner'
import { contractInstance, metaunityAddress, wbnbContractInstance } from '@/contract/contract'
import { ethers } from 'ethers'
import { FadeLoader } from 'react-spinners'
import { useRouter } from 'next/navigation'
import { extractEventsFromReceipt, waitForPackageBuyEvent } from '@/contract/event-poller'
import { usdtToWbnb } from "@/lib/utils"
import { getUserHighestPackage } from "@/actions/user"
import { useActiveAccount } from "thirdweb/react"
import { isPackageBuyStored } from "@/actions/metaunity-system"

// Plan interface
type Package = {
    id: number
    name: string
    description: string
    price: number
    duration: number
}

type Plan = Package | null;


const planNames: Record<number, string> = {
    1: "Explorer",
    2: "Builder",
    3: "Strategist",
    4: "Innovator",
    5: "Mentor",
    6: "Achiever",
    7: "Wayfinder",
    8: "Leader",
    9: "Seer",
    10: "Sage",
    11: "Champion",
    12: "Shining Star",
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const packageAmount: Record<number, string> = {
    1: "5",
    2: "10",
    3: "20",
    4: "40",
    5: "80",
    6: "160",
    7: "320",
    8: "640",
    9: "1280",
    10: "2560",
    11: "5120",
    12: "10240",
}

export default function PackageBuyUserCard() {
    const [walletAddress, setWalletAddress] = useState("")
    const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
    const [nextPlan, setNextPlan] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [isApproved, setIsApproved] = useState(false)
    const [isActivating, setIsActivating] = useState(false)
    const activeAccount = useActiveAccount();
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    // Debouncing effect for wallet address verification
    useEffect(() => {
        if (!walletAddress || walletAddress.length !== 42) {
            setCurrentPlan(null)
            setIsApproved(false)
            return
        }

        setIsVerifying(true)
        const timeoutId = setTimeout(() => {
            getUserHighestPackage(walletAddress).then((plan:any) => {
                setCurrentPlan(plan)
                if (plan?.packageNumber && plan.packageNumber < 12) {
                    setNextPlan((plan.packageNumber + 1).toString())
                }
                else if (plan?.packageNumber === 12) {
                    setNextPlan("13")
                }
                else {
                    setNextPlan("1")
                }
                setIsVerifying(false)
            })
        }, 800)

        return () => clearTimeout(timeoutId)
    }, [walletAddress])




    const handleApprove = async () => {
        try {
            if (!nextPlan || !walletAddress) {
                toast.error('Please enter a valid wallet address and plan number')
                return;
            }

            if (Number(nextPlan) > 12) {
                toast.error('User is already bought all plan')
                return;
            }

            if (Number(nextPlan) >= 13) {
                toast.error('User is already bought all plan')
                return;
            }

            if (!activeAccount) {
                toast.error('Please connect your wallet')
                return;
            }
            setIsPending(true)

            const contractIns = await wbnbContractInstance(activeAccount);


            const wbnbAmountReadable = await usdtToWbnb('10240');
            // returns e.g. "0.01523" (human-readable WBNB)

            // Convert to BigNumber in wei (18 decimals for WBNB)
            const wad = ethers.utils.parseUnits(wbnbAmountReadable, 18);

            const approve = await contractIns!.approve(
                metaunityAddress,
                wad
            )


            const result = await approve.wait();

            if (result.status === 1) {
                setIsApproved(true)
                setIsPending(false)
            }
            else {
                toast.error('Something went wrong in handleApprove')
                setIsPending(false)
            }

        } catch (error) {
            console.log('error in handleApprove', error)
            toast.error('Something went wrong in handleApprove')
            setIsPending(false)
        }
        finally {
            setIsPending(false)
        }
    }

    const handleActivate = async () => {
        try {

            if (!isApproved || !activeAccount || !walletAddress || !nextPlan) {
                toast.error('Please approve the transaction first')
                return;
            }

            setIsActivating(true)
            setIsPending(true)

            const contractIns = await contractInstance(activeAccount);

            const isUserRegistered = await contractIns?.register(walletAddress);
            if (!isUserRegistered) {
                toast.error('User is not registered')
                return;
            }

                        const USDT = "0x55d398326f99059fF775485246999027B3197955";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const pathToBuy = [USDT,WBNB]; // <-- strings, not bare hex literals

            let activate;
            if (nextPlan === "1") {
                console.log('we are buy plan 1');
                activate = await contractIns?.buy_user_firstpackage(
                    walletAddress,
                    pathToBuy
                );
            }
            else {
                activate = await contractIns?.buy_user(
                    walletAddress,
                    pathToBuy
                );
            }


            const result = await activate.wait();

            if (result.status === 1) {
                const isTranxDone = await isPackageBuyStored(result.transactionHash, walletAddress);

                if (!isTranxDone) {
                    const responses = await waitForPackageBuyEvent(result.transactionHash, walletAddress);
                    console.log('response in handleBuy', responses);

                    if (!responses.length) {
                        toast.error('Transaction failed, please try again');
                        setIsPending(false);
                        return;
                    }

                    const has200 = responses.some((r) => r.statusCode === 200);
                    const all201 = responses.every((r) => r.statusCode === 201);

                    if (has200) {
                        const res = await extractEventsFromReceipt(result.transactionHash, walletAddress);
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

                setIsPending(false);
                router.refresh();
            }

            else {
                toast.error('Something went wrong in handleBuy')
                setIsPending(false)
            }

        } catch (error: any) {
            console.log('error in handleActivate', error)
            if (error?.message?.includes('SafeMath') || error?.message?.includes('sub failed')) {
                toast.error("You haven't approved enough USDT. Please approve the required amount and try again.");
            } else {
                toast.error('An error occurred while approving the transaction. Please try again.');
            }
            setIsPending(false)
        }
        finally {
            // reset all states
            setIsApproved(false)
            setCurrentPlan(null)
            setNextPlan("")
            setWalletAddress("")
            setIsActivating(false)
            setIsPending(false)
        }
    }

    return (
        <div className="min-h-screen p-4 flex items-center justify-center">
            {isPending && (
                <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md bg-opacity-50 flex flex-col items-center justify-center">
                    <FadeLoader color="#f7421e" />
                    <span className="text-white font-semibold text-sm text-center lg:text-2xl mx-auto max-w-90 lg:max-w-6xl">
                        Please wait, the transaction is in progress. Do not refresh the
                        page.
                    </span>
                </div>
            )}
            <Card className="w-full max-w-90  md:max-w-xl mx-auto shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">Package Buy User</CardTitle>
                    <CardDescription>Verify user wallet and upgrade their plan</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Wallet Address Input */}
                    <div className="space-y-2">
                        <Label htmlFor="wallet">Wallet Address</Label>
                        <Input
                            id="wallet"
                            type="text"
                            placeholder="0x..."
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value.trim())}
                            className="font-mono text-sm"
                        />
                    </div>

                    {/* Current Plan Display */}
                    <div className="space-y-2">
                        <Label>Current Plan</Label>
                        <div className="min-h-[60px] p-3 border rounded-lg bg-background">
                            {isVerifying ? (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Verifying wallet...</span>
                                </div>
                            ) : currentPlan ? (
                                <div className="space-y-2">
                                    <div className="flex flex-col items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{planNames[currentPlan.id]}</p>
                                            <p className="font-medium">{currentPlan.price}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Package Number {currentPlan.id}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : walletAddress ? (
                                <p className="text-sm text-red-400">No plan found for this wallet</p>
                            ) : (
                                <p className="text-sm text-gray-200">Enter wallet address to verify</p>
                            )}
                        </div>
                    </div>

                    {/* Next Plan Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="nextPlan">Select Next Plan</Label>
                        {
                            Number(nextPlan) >= 13 ? (
                                <div className="p-3 bg-neutral-800 border border-neutral-800 rounded-lg text-green-600">
                                    User has already purchased all the plan.
                                </div>
                            ) : (
                                <Input
                                    id="nextPlan"
                                    type="number"
                                    value={nextPlan}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                            )
                        }
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {!isApproved ? (
                            <Button onClick={handleApprove} disabled={!walletAddress || !nextPlan || isVerifying} className="w-full">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Plan Change
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">Plan Approved!</span>
                                    </div>
                                    <p className="text-xs text-green-600 mt-1">
                                        Ready to activate Plan {nextPlan} ({planNames[Number.parseInt(nextPlan)]})
                                    </p>
                                </div>

                                <Button
                                    onClick={handleActivate}
                                    disabled={isActivating}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {isActivating ? (
                                        <>
                                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                                            Activating...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowRight className="w-4 h-4 mr-2" />
                                            Activate Plan
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Info Text */}
                    <div className="text-xs text-gray-500 text-center space-y-1">
                        <p>• Wallet verification uses debounced input</p>
                        <p>• Plan changes require approval before activation</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
