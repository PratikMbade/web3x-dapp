/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Users2, DollarSign, CheckCircle2, Lock, Loader2 } from "lucide-react"
import PlanStructure from "./new-plan-structure"
import { Button } from "@/components/ui/button"
import type { Plan } from "@/types/plan"
import { useState } from "react"

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
type Package = {
    id: string;
    userId: string;
    amount: number;
    chainid: number;
    createdAt: Date;
    updatedAt: Date;
    packageNumber: number;
    packageBuyTranxHash: string;
}
interface PlanCardProps {
    id: number
    plan: Plan
    userPackage: Package | null
}

export default function PlanCard({ id, plan, userPackage }: PlanCardProps) {
    const [isApproved, setIsApproved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [isBought, setIsBought] = useState(false)
    const router = useRouter()


    const isActivated = userPackage?.packageBuyTranxHash || isBought

    return (
        <>
            {/* Loading Overlay */}
            {isPending && (
                <motion.div
                    className="fixed inset-0 z-50 bg-neutral-900 backdrop-blur-md flex flex-col items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4" />
                    <span className="text-white font-semibold text-lg text-center max-w-md">
                        Processing transaction...
                    </span>
                    <span className="text-slate-400 text-sm text-center mt-2 max-w-md">
                        Please do not refresh the page
                    </span>
                </motion.div>
            )}

            {/* Card Container */}
            <motion.div
                className="relative group w-full"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >

                {/* Main Card */}
                <div className="relative bg-neutral-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl">
                    {/* Activated Badge */}
                    {isActivated && (
                        <div className="absolute top-18 right-4 z-10">
                            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span className="text-xs font-semibold text-green-400">Active</span>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="p-6 pb-4 border-b border-slate-700/50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                                {plan.displayName}
                            </h3>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/50">
                                <Users2 className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-300">0</span>
                            </div>
                        </div>

                        {/* Tier Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <span className="text-xs font-medium text-orange-400">Tier {plan.tier}</span>
                        </div>
                    </div>

                    {/* Plan Structure Visualization */}
                    <div className="relative my-4">
                        <PlanStructure
                            planName={plan.name}
                            globalCount={0}
                            highestPlanetBought={plan.tier}
                        />
                    </div>

                    {/* Price Section */}
                    <div className="px-6 py-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-y border-slate-700/50">
                        <div className="flex items-center justify-center gap-2">
                            <DollarSign className="w-6 h-6 text-orange-400" />
                            <span className="text-3xl font-bold text-white">
                                {plan.price}
                            </span>
                            <span className="text-lg font-medium text-slate-400">WBNB</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6">
                        {isActivated ? (
                            <Button
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/30 transition-all"
                                disabled
                            >
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Activated
                            </Button>
                        ) : isApproved ? (
                            <Button
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-yellow-500/30 transition-all disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Activating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        Activate Package
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5 mr-2" />
                                        Approve WBNB
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-yellow-500/10 to-transparent rounded-full blur-2xl" />
                </div>
            </motion.div>
        </>
    )
}