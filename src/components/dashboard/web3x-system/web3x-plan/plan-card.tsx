/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { DollarSign, CheckCircle2, Zap, ShieldCheck, X, Coins } from "lucide-react"
import PlanStructure from "./new-plan-structure"
import type { Plan } from "@/types/plan"
import { useState, useEffect } from "react"
import { useActiveAccount } from 'thirdweb/react'
import { toast } from 'sonner'
import { FadeLoader } from 'react-spinners'
import { contractInstance, metaunityAddress, getPackageTokenPrice, wbnbContractInstance, wbnbAddress } from '@/contract/contract'
import { horseTokenContractInstance, HorseTokenContractAddress } from '@/contract/horse-token-contract/contract-instance'
import { ethers } from 'ethers'
import { useRouter } from 'next/navigation'
import { isPackageBuyStored } from '@/actions/metaunity-system'
import { extractEventsFromReceipt, waitForPackageBuyEvent } from '@/contract/event-poller'
import { Package } from "@/generated/prisma/client"

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"

function formatTokenAmount(amount: ethers.BigNumber, decimals = 18): string {
    const num = Number(ethers.utils.formatUnits(amount, decimals))
    if (num === 0) return '0'
    if (num < 0.000001) return num.toExponential(4)
    if (num < 0.001) return num.toPrecision(4)
    if (num < 1) return num.toFixed(6)
    return num.toFixed(4)
}

interface PlanCardProps {
    id: number
    plan: Plan
    userPackage: Package | null
}

type PaymentMethod = 'hrs' | 'wbnb'

// ── helpers ──────────────────────────────────────────────────────────────────

async function approveHrs(
    activeAccount: Parameters<typeof horseTokenContractInstance>[0],
    amount: ethers.BigNumber
): Promise<boolean> {
    const inst = await horseTokenContractInstance(activeAccount)
    if (!inst) { toast.error('Could not connect to HRS contract'); return false }
    const tx = await inst.approve(metaunityAddress, amount)
    const receipt = await tx.wait()
    if (receipt.status !== 1) { toast.error('HRS approval failed'); return false }
    return true
}

async function approveWbnb(
    activeAccount: Parameters<typeof wbnbContractInstance>[0],
    amount: ethers.BigNumber
): Promise<boolean> {
    const inst = await wbnbContractInstance(activeAccount)
    if (!inst) { toast.error('Could not connect to WBNB contract'); return false }
    const tx = await inst.approve(metaunityAddress, amount)
    const receipt = await tx.wait()
    if (receipt.status !== 1) { toast.error('WBNB approval failed'); return false }
    return true
}

async function processTransactionResult(
    txHash: string,
    userAddress: string,
    router: ReturnType<typeof useRouter>
): Promise<void> {
    const isTranxDone = await isPackageBuyStored(txHash, userAddress)
    if (isTranxDone) { router.refresh(); return }

    const responses = await waitForPackageBuyEvent(txHash, userAddress)
    if (!responses.length) { toast.error('Transaction failed, please try again'); return }

    const has200 = responses.some((r) => r.statusCode === 200)
    const all201 = responses.every((r) => r.statusCode === 201)

    if (has200) {
        const res = await extractEventsFromReceipt(txHash, userAddress)
        if (!res) { toast.error('Event parsing failed'); return }
        toast.success('✅ Transaction completed successfully')
    } else if (all201) {
        toast.success('✅ Transaction already processed')
    } else {
        toast.success('✅ Transaction completed successfully')
    }

    router.refresh()
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PlanCard({ id, plan, userPackage }: PlanCardProps) {

    const activeAccount = useActiveAccount()
    const [isApproved, setIsApproved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [isBought, setIsBought] = useState(false)
    const [packageHrsAmount, setPackageHrsAmount] = useState<ethers.BigNumber>(ethers.BigNumber.from(0))
    const [packageWbnbAmount, setPackageWbnbAmount] = useState<ethers.BigNumber>(ethers.BigNumber.from(0))
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
    const router = useRouter()

    useEffect(() => {
        getPackageTokenPrice(id, false, 1).then(setPackageHrsAmount)
        getPackageTokenPrice(id, false, 2).then(setPackageWbnbAmount)
    }, [id])

    const handleApprove = async (method: PaymentMethod) => {
        if (!activeAccount) { toast.error('Please connect your wallet first'); return }

        setShowPaymentModal(false)
        setPaymentMethod(method)
        setIsLoading(true)
        setIsPending(true)

        try {
            const metaunityContract = await contractInstance(activeAccount)
            if (!metaunityContract) { toast.error('An error occurred while connecting...'); return }

            const userPkg: ethers.BigNumber = await metaunityContract.getPackage(activeAccount.address)
            const packageNumber = ethers.BigNumber.from(userPkg).toNumber()
            if (id !== packageNumber + 1) {
                toast.error('You need to buy the previous package first', {
                    description: `Your current package is ${packageNumber} and you are trying to buy ${plan.tier}`
                })
                return
            }

            const approved = method === 'hrs'
                ? await approveHrs(activeAccount, packageHrsAmount)
                : await approveWbnb(activeAccount, packageWbnbAmount)

            if (approved) setIsApproved(true)
            else setPaymentMethod(null)
        } catch (error: any) {
            console.log('error in handleApprove', error)
            toast.error('Approval failed')
            setPaymentMethod(null)
        } finally {
            setIsLoading(false)
            setIsPending(false)
        }
    }

    const handleBuy = async () => {
        if (!activeAccount) { toast.error('Please connect your wallet first'); return }
        if (!paymentMethod) { toast.error('Payment method not selected'); return }

        setIsPending(true)

        try {
            const contractIns = await contractInstance(activeAccount)
            if (!contractIns) { toast.error('Contract instance not found'); return }

            const isUserRegistered = await contractIns.register(activeAccount.address)
            if (!isUserRegistered) { toast.error('User is not registered'); return }

            const tokenParam = paymentMethod === 'hrs' ? 1 : 2
            const path = paymentMethod === 'hrs'
                ? [HorseTokenContractAddress, wbnbAddress, USDT_ADDRESS]
                : [wbnbAddress, USDT_ADDRESS]

            const buy = await contractIns.buyPackageUser(activeAccount.address, path, false, tokenParam)
            const result = await buy.wait()

            if (result.status === 1) {
                await processTransactionResult(result.transactionHash, activeAccount.address, router)
                setIsBought(true)
            } else {
                toast.error('Something went wrong in handleBuy')
            }
        } catch (error: any) {
            if (error?.message?.includes('SafeMath') || error?.message?.includes('sub failed')) {
                toast.error("You haven't approved enough tokens. Please approve the required amount and try again.")
            } else {
                toast.error('An error occurred while completing the transaction. Please try again.')
            }
            console.log('error', error)
        } finally {
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
                                <p className="text-neutral-500 text-xs mt-0.5">Choose how to pay for {plan.displayName}</p>
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
                                Approval required before purchase · {Number(plan.price)} USDT value
                            </p>
                        </div>
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
                <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                        background: isActivated
                            ? "linear-gradient(90deg, transparent, rgba(34,197,94,0.6), transparent)"
                            : "linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent)"
                    }}
                />

                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 opacity-10 blur-3xl pointer-events-none"
                    style={{ background: isActivated ? "#22c55e" : "#f97316", borderRadius: "50%" }}
                />

                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2.5">
                        {isActivated
                            ? <ShieldCheck className="h-4 w-4 text-green-400" />
                            : <Zap className="h-4 w-4 text-orange-400" />
                        }
                        <span
                            className="uppercase text-xs font-bold tracking-[0.15em]"
                            style={{ color: isActivated ? "#4ade80" : "#fb923c" }}
                        >
                            {plan.displayName}
                        </span>
                    </div>
                </div>

                <div className="mx-5 h-px bg-white/5" />

                <div className="relative px-5 py-5">
                    <PlanStructure
                        planName={plan.name}
                        globalCount={0}
                        highestPlanetBought={plan.tier}
                    />
                </div>

                <div className="mx-5 h-px bg-white/5" />

                <div className="px-5 py-4 flex items-center justify-between">
                    <span className="text-neutral-500 text-xs font-medium uppercase tracking-widest">Price</span>
                    <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1">
                            <span className="text-white text-lg font-semibold tracking-tight">
                                {formatTokenAmount(packageHrsAmount)}
                            </span>
                            <span className="text-neutral-500 text-sm ml-1">HRS</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <DollarSign className="h-3 w-3 text-neutral-600" />
                            <span className="text-neutral-600 text-xs">{Number(plan.price)} USDT</span>
                        </div>
                    </div>
                </div>

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
                                background: isLoading ? "rgba(234,179,8,0.1)" : "linear-gradient(135deg, #ca8a04, #a16207)",
                                border: "1px solid rgba(234,179,8,0.3)",
                                color: isLoading ? "#a16207" : "#fff",
                                boxShadow: isLoading ? "none" : "0 4px 20px rgba(202,138,4,0.25)"
                            }}
                        >
                            <span className="relative flex items-center justify-center gap-2">
                                <Zap className="h-4 w-4" />
                                {isLoading ? "Activating..." : `Activate via ${paymentMethod === 'hrs' ? 'HRS' : 'WBNB'}`}
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            disabled={isLoading}
                            className="w-full relative overflow-hidden rounded-xl py-3 text-sm font-semibold tracking-wide transition-all duration-200 active:scale-[0.98]"
                            style={{
                                background: isLoading ? "rgba(249,115,22,0.08)" : "linear-gradient(135deg, #ea580c, #c2410c)",
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
