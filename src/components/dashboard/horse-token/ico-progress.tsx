/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import { Card } from "@/components/ui/card"
import { icoContractInstance } from "@/contract/ico-contract/ico-contract"
import { Clock, TrendingUp } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"
import { useEffect, useState, useMemo } from "react"
import { formatUnits } from "ethers/lib/utils"

interface ICOProgressProps {
    data: any
}

export default function ICOProgress({ data }: ICOProgressProps) {
    const activeAccount = useActiveAccount()

    const [icoPhases, setIcoPhases] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const daysRemaining = Math.ceil(
        (data?.icoEnds?.getTime() || Date.now() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )

    useEffect(() => {
        fetchIcoPhases()
    }, [activeAccount])

    const fetchIcoPhases = async () => {
        try {
            if (!activeAccount) {
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            const icoContractInst = await icoContractInstance(activeAccount)

            const phasePromises = Array.from({ length: 10 }, (_, i) => 
                icoContractInst.icoPriceDetails(i + 1)
            )

            const results = await Promise.all(phasePromises)

            const phases = results.map((res, i) => {
                const tokenAmt = Number(formatUnits(res.tokenAmt, 18))
                const tokenSold = Number(formatUnits(res.tokenSold, 18))
                const price = Number(formatUnits(res.price, 18))

                const soldPercent = tokenAmt > 0 ? (tokenSold / tokenAmt) * 100 : 0

                return {
                    phase: i + 1,
                    tokenAmt,
                    tokenSold,
                    price,
                    soldPercent,
                }
            })
            console.log('phase',phases);

            setIcoPhases(phases)
            setIsLoading(false)

        } catch (err) {
            console.error("ICO Phase Fetch Error:", err)
            setIsLoading(false)
        }
    }

    const { overallProgress, currentPhase } = useMemo(() => {
        if (icoPhases.length === 0) return { overallProgress: 0, currentPhase: 1 }

        const overall = icoPhases.reduce((a, b) => a + b.soldPercent, 0) / icoPhases.length
        const active = icoPhases.find(p => p.soldPercent < 100)?.phase || 10

        return { overallProgress: overall, currentPhase: active }
    }, [icoPhases])

    return (
        <Card className="p-6 bg-card border-border/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        ICO Phase Progress
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Real-time on-chain phase tracking
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-xs text-muted-foreground">Overall</p>
                        {isLoading ? (
                            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                        ) : (
                            <p className="text-2xl font-bold text-primary">
                                {overallProgress.toFixed(1)}%
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">Current</p>
                        {isLoading ? (
                            <div className="h-8 w-12 bg-muted rounded animate-pulse" />
                        ) : (
                            <p className="text-2xl font-bold">
                                {currentPhase}/10
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden mb-6">
                {isLoading ? (
                    <div className="bg-muted-foreground/20 h-full w-full animate-pulse" />
                ) : (
                    <div
                        className="bg-primary h-full transition-all"
                        style={{ width: `${overallProgress}%` }}
                    />
                )}
            </div>

            {/* Phase Bars */}
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {isLoading ? (
                    // Skeleton loader - exact same structure as actual phases
                    Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="relative">
                            <div className="h-24 rounded-lg bg-muted relative overflow-hidden animate-pulse">
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-xs gap-1">
                                    <div className="w-4 h-4 bg-muted-foreground/20 rounded" />
                                    <div className="w-8 h-3 bg-muted-foreground/20 rounded" />
                                </div>
                            </div>
                            <div className="h-3 w-10 bg-muted rounded mx-auto mt-1 animate-pulse" />
                        </div>
                    ))
                ) : (
                    // Actual phase data
                    icoPhases.map((phase) => {
                        const progress = phase.soldPercent
                        const isActive = phase.phase === currentPhase

                        return (
                            <div key={phase.phase} className="relative">
                                <div className={`h-24 rounded-lg bg-muted relative overflow-hidden
                                    ${isActive && "ring-2 ring-primary"}`}>

                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-primary transition-all"
                                        style={{ height: `${progress}%` }}
                                    />

                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                                        <span className={`font-bold ${isActive ? "text-primary" : ""}`}>
                                            {phase.phase}
                                        </span>
                                        <span>{progress.toFixed(2)}%</span>
                                    </div>
                                </div>

                                <p className="text-[10px] text-center mt-1">
                                    ${phase.price * 2}
                                </p>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-card/50 p-4 rounded-lg">
                    <p className="text-xs">Current Price</p>
                    {isLoading ? (
                        <div className="h-7 w-16 bg-muted rounded animate-pulse mt-1" />
                    ) : (
                        <p className="text-xl font-bold text-primary">
                            ${icoPhases[currentPhase - 1]?.price * 2}
                        </p>
                    )}
                </div>

                <div className="bg-card/50 p-4 rounded-lg">
                    <p className="text-xs">Next Phase</p>
                    {isLoading ? (
                        <div className="h-7 w-16 bg-muted rounded animate-pulse mt-1" />
                    ) : (
                        <p className="text-xl font-bold">
                            {currentPhase < 10
                                ? `$${icoPhases[currentPhase]?.price * 2}`
                                : "Final"}
                        </p>
                    )}
                </div>

                <div className="bg-card/50 p-4 rounded-lg">
                    <p className="text-xs">Phase Progress</p>
                    {isLoading ? (
                        <div className="h-7 w-16 bg-muted rounded animate-pulse mt-1" />
                    ) : (
                        <p className="text-xl font-bold">
                            {icoPhases[currentPhase - 1]?.soldPercent.toFixed(1)}%
                        </p>
                    )}
                </div>

           
            </div>
        </Card>
    )
}