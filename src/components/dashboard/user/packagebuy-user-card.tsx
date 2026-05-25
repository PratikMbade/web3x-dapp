/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, ArrowRight, X, Coins } from "lucide-react"
import { toast } from 'sonner'
import { contractInstance, metaunityAddress, getPackageTokenPrice, wbnbContractInstance, wbnbAddress } from '@/contract/contract'
import { horseTokenContractInstance, HorseTokenContractAddress } from '@/contract/horse-token-contract/contract-instance'
import { ethers } from 'ethers'
import { FadeLoader } from 'react-spinners'
import { useRouter } from 'next/navigation'
import { extractEventsFromReceipt, waitForPackageBuyEvent } from '@/contract/event-poller'
import { getUserHighestPackage } from "@/actions/user"
import { useActiveAccount } from "thirdweb/react"
import { isPackageBuyStored } from "@/actions/metaunity-system"
import { Package } from "@/generated/prisma"

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"

function formatTokenAmount(amount: ethers.BigNumber, decimals = 18): string {
    const num = Number(ethers.utils.formatUnits(amount, decimals))
    if (num === 0) return '0'
    if (num < 0.000001) return num.toExponential(4)
    if (num < 0.001) return num.toPrecision(4)
    if (num < 1) return num.toFixed(6)
    return num.toFixed(4)
}

type PaymentMethod = 'hrs' | 'wbnb'

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

export default function PackageBuyUserCard() {
    const [walletAddress, setWalletAddress] = useState("")
    const [currentPlan, setCurrentPlan] = useState<Package | null>(null)
    const [nextPlan, setNextPlan] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [isApproved, setIsApproved] = useState(false)
    const [isActivating, setIsActivating] = useState(false)
    const activeAccount = useActiveAccount()
    const [isPending, setIsPending] = useState(false)
    const [packageHrsAmount, setPackageHrsAmount] = useState<ethers.BigNumber>(ethers.BigNumber.from(0))
    const [packageWbnbAmount, setPackageWbnbAmount] = useState<ethers.BigNumber>(ethers.BigNumber.from(0))
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
    const router = useRouter()

    useEffect(() => {
        const plan = Number(nextPlan)
        if (plan >= 1 && plan <= 12) {
            getPackageTokenPrice(plan, false, 1).then(setPackageHrsAmount)
            getPackageTokenPrice(plan, false, 2).then(setPackageWbnbAmount)
        }
    }, [nextPlan])

    useEffect(() => {
        if (!walletAddress || walletAddress.length !== 42) {
            setCurrentPlan(null)
            setIsApproved(false)
            return
        }

        setIsVerifying(true)
        const timeoutId = setTimeout(() => {
            getUserHighestPackage(walletAddress.toLowerCase()).then((plan: any) => {
                setCurrentPlan(plan)
                if (plan?.packageNumber && plan.packageNumber < 12) {
                    setNextPlan((plan.packageNumber + 1).toString())
                } else if (plan?.packageNumber === 12) {
                    setNextPlan("13")
                } else {
                    setNextPlan("1")
                }
                setIsVerifying(false)
            })
        }, 800)

        return () => clearTimeout(timeoutId)
    }, [walletAddress])

    const handleApprove = async (method: PaymentMethod) => {
        if (!nextPlan || !walletAddress) {
            toast.error('Please enter a valid wallet address and plan number')
            return
        }
        if (Number(nextPlan) >= 13) {
            toast.error('User has already bought all plans')
            return
        }
        if (!activeAccount) {
            toast.error('Please connect your wallet')
            return
        }

        setShowPaymentModal(false)
        setPaymentMethod(method)
        setIsPending(true)

        try {
            if (method === 'hrs') {
                const contractIns = await horseTokenContractInstance(activeAccount)
                if (!contractIns) { toast.error('Could not connect to HRS contract'); return }
                const wad = packageHrsAmount.mul(105).div(100)
                const approve = await contractIns.approve(metaunityAddress, wad)
                const result = await approve.wait()
                if (result.status !== 1) { toast.error('HRS approval failed'); setPaymentMethod(null); return }
            } else {
                const contractIns = await wbnbContractInstance(activeAccount)
                if (!contractIns) { toast.error('Could not connect to WBNB contract'); return }
                const wad = packageWbnbAmount.mul(105).div(100)
                const approve = await contractIns.approve(metaunityAddress, wad)
                const result = await approve.wait()
                if (result.status !== 1) { toast.error('WBNB approval failed'); setPaymentMethod(null); return }
            }

            setIsApproved(true)
        } catch (error) {
            console.log('error in handleApprove', error)
            toast.error('Something went wrong in handleApprove')
            setPaymentMethod(null)
        } finally {
            setIsPending(false)
        }
    }

    const handleActivate = async () => {
        if (!isApproved || !activeAccount || !walletAddress || !nextPlan) {
            toast.error('Please approve the transaction first')
            return
        }
        if (!paymentMethod) {
            toast.error('Payment method not selected')
            return
        }

        setIsActivating(true)
        setIsPending(true)

        try {
            const contractIns = await contractInstance(activeAccount)
            if (!contractIns) { toast.error('Contract instance not found'); return }

            const isUserRegistered = await contractIns.register(walletAddress)
            if (!isUserRegistered) { toast.error('User is not registered'); return }

            const tokenParam = paymentMethod === 'hrs' ? 1 : 2
            const path = paymentMethod === 'hrs'
                ? [HorseTokenContractAddress, wbnbAddress, USDT_ADDRESS]
                : [wbnbAddress, USDT_ADDRESS]

            const activate = await contractIns.buyPackageUser(walletAddress, path, false, tokenParam)
            const result = await activate.wait()

            if (result.status === 1) {
                const isTranxDone = await isPackageBuyStored(result.transactionHash, walletAddress)
                if (!isTranxDone) {
                    const responses = await waitForPackageBuyEvent(result.transactionHash, walletAddress)
                    if (!responses.length) { toast.error('Transaction failed, please try again'); return }

                    const has200 = responses.some((r) => r.statusCode === 200)
                    const all201 = responses.every((r) => r.statusCode === 201)

                    if (has200) {
                        const res = await extractEventsFromReceipt(result.transactionHash, walletAddress)
                        if (!res) { toast.error('Event parsing failed'); return }
                        toast.success('✅ Transaction completed successfully')
                    } else if (all201) {
                        toast.success('✅ Transaction already processed')
                    } else {
                        toast.success('✅ Transaction completed successfully')
                        router.refresh()
                        return
                    }
                }

                router.refresh()
            } else {
                toast.error('Something went wrong in handleActivate')
            }
        } catch (error: any) {
            console.log('error in handleActivate', error)
            const rawData = error?.data ?? error?.error?.data ?? error?.cause?.data
            if (rawData) {
                console.log('contract revert data:', rawData)
            }
            if (error?.message?.includes('SafeMath') || error?.message?.includes('sub failed')) {
                toast.error("You haven't approved enough tokens. Please approve the required amount and try again.")
            } else {
                toast.error(error?.reason ?? error?.message ?? 'An error occurred while activating the plan. Please try again.')
            }
        } finally {
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
                        Please wait, the transaction is in progress. Do not refresh the page.
                    </span>
                </div>
            )}

            {/* Payment Method Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/75 flex items-center justify-center p-4">
                    <div
                        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
                        style={{
                            background: "linear-gradient(145deg, #1a1a1a 0%, #111111 100%)",
                            boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.8)",
                        }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-px"
                            style={{ background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)" }} />

                        <div className="flex items-center justify-between px-5 pt-5 pb-4">
                            <div>
                                <p className="text-white font-semibold text-base">Select Payment Method</p>
                                <p className="text-neutral-500 text-xs mt-0.5">
                                    Buying Plan {nextPlan}{planNames[Number(nextPlan)] ? ` — ${planNames[Number(nextPlan)]}` : ''}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="text-neutral-500 hover:text-white transition-colors p-1"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mx-5 h-px bg-white/5" />

                        <div className="p-5 space-y-3">
                            {/* HRS Option */}
                            <button
                                onClick={() => handleApprove('hrs')}
                                className="w-full rounded-xl p-4 text-left transition-all duration-150 active:scale-[0.98]"
                                style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)" }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center"
                                            style={{ background: "rgba(249,115,22,0.15)" }}>
                                            <Coins className="h-4 w-4 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-semibold">HRS Token</p>
                                            <p className="text-neutral-500 text-xs">Horse Token</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white text-sm font-semibold">
                                            {formatTokenAmount(packageHrsAmount)}
                                        </p>
                                        <p className="text-neutral-500 text-xs">HRS</p>
                                    </div>
                                </div>
                            </button>

                            {/* WBNB Option */}
                            <button
                                onClick={() => handleApprove('wbnb')}
                                className="w-full rounded-xl p-4 text-left transition-all duration-150 active:scale-[0.98]"
                                style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)" }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center"
                                            style={{ background: "rgba(234,179,8,0.15)" }}>
                                            <Coins className="h-4 w-4 text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-semibold">WBNB</p>
                                            <p className="text-neutral-500 text-xs">Wrapped BNB</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white text-sm font-semibold">
                                            {formatTokenAmount(packageWbnbAmount)}
                                        </p>
                                        <p className="text-neutral-500 text-xs">WBNB</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <div className="px-5 pb-5">
                            <p className="text-neutral-600 text-xs text-center">
                                Approval required before activation
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Card className="w-full max-w-90 md:max-w-xl mx-auto shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">Package Buy User</CardTitle>
                    <CardDescription>Verify user wallet and upgrade their plan</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
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

                    <div className="space-y-2">
                        <Label>Current Plan</Label>
                        <div className="min-h-15 p-3 border rounded-lg bg-background">
                            {isVerifying ? (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Verifying wallet...</span>
                                </div>
                            ) : currentPlan ? (
                                <div className="space-y-2">
                                    <div className="flex flex-col items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{currentPlan.packageNumber}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Package Number {currentPlan.packageNumber}</span>
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

                    <div className="space-y-2">
                        <Label htmlFor="nextPlan">Select Next Plan</Label>
                        {Number(nextPlan) >= 13 ? (
                            <div className="p-3 bg-neutral-800 border border-neutral-800 rounded-lg text-green-600">
                                User has already purchased all the plans.
                            </div>
                        ) : (
                            <Input
                                id="nextPlan"
                                type="number"
                                value={nextPlan}
                                readOnly
                                className="font-mono text-sm"
                            />
                        )}
                    </div>

                    <div className="space-y-3">
                        {!isApproved ? (
                            <Button
                                onClick={() => setShowPaymentModal(true)}
                                disabled={!walletAddress || !nextPlan || isVerifying || Number(nextPlan) >= 13}
                                className="w-full"
                            >
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
                                        Ready to activate Plan {nextPlan} ({planNames[Number.parseInt(nextPlan)]}) via {paymentMethod === 'hrs' ? 'HRS Token' : 'WBNB'}
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

                    <div className="text-xs text-gray-500 text-center space-y-1">
                        <p>• Wallet verification uses debounced input</p>
                        <p>• Plan changes require approval before activation</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
