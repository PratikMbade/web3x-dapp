/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Card } from "@/components/ui/card"
import { icoContractAddress, icoContractInstance } from "@/contract/ico-contract/ico-contract"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useActiveAccount } from "thirdweb/react"
import { useEffect, useState } from "react"
import { formatUnits } from "ethers/lib/utils"

interface SupplyDistributionProps {
    data: any
}

export default function SupplyDistribution({ data }: SupplyDistributionProps) {

    const activeAccount = useActiveAccount()

    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        fetchICODetails()
    }, [activeAccount])

    const fetchICODetails = async () => {
        try {
            if (!activeAccount) return

            const icoContractInst = await icoContractInstance(activeAccount)

            const res = await icoContractInst.icoDetails(icoContractAddress)

            const maxIco = Number(formatUnits(res.maxIco, 18))
            const soldAmt = Number(formatUnits(res.soldAmt, 18))
            const airdropDone = Number(formatUnits(res.airdropDone, 18))
            const buyIcoDone = Number(formatUnits(res.buyIcoDone, 18))
            const remainingIco = Number(formatUnits(res.remainingIco, 18))

            setChartData([
                {
                    name: "Max ICO",
                    value: maxIco,
                    color: "#6366f1",
                },
                {
                    name: "Sold ICO",
                    value: soldAmt,
                    color: "#22c55e",
                },
                {
                    name: "Airdrop",
                    value: airdropDone,
                    color: "#eab308",
                },
                {
                    name: "Buy ICO",
                    value: buyIcoDone,
                    color: "#3b82f6",
                },
                {
                    name: "Remaining",
                    value: remainingIco,
                    color: "#f97316",
                },
            ])

        } catch (error) {
            console.error("ICO Details Error:", error)
        }
    }

    const totalSupply = chartData.reduce((a, b) => a + b.value, 0)

    return (
        <Card className="p-6 bg-card border-border/50">

            <h2 className="text-xl font-bold mb-6">
                ICO Supply Distribution
            </h2>

            <div className="h-64 w-full relative">

                <ResponsiveContainer width="100%" height="100%">

                    <PieChart>

                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                        >

                            {chartData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}

                        </Pie>

                    </PieChart>

                </ResponsiveContainer>

                {/* Center Label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

                    <div className="text-center">

                        <p className="text-2xl font-bold">
                            {(totalSupply / 1_000_000).toFixed(2)}M
                        </p>

                        <p className="text-xs text-muted-foreground">
                            Total ICO
                        </p>

                    </div>

                </div>

            </div>

            {/* Legend */}

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">

                {chartData.map((item, index) => (

                    <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                    >

                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />

                        <div>

                            <p className="text-sm text-muted-foreground">
                                {item.name}
                            </p>

                            <p className="text-lg font-bold">
                                {(item.value / 1_000_000).toFixed(2)}M
                            </p>

                            <p className="text-xs text-muted-foreground">
                                {totalSupply > 0
                                    ? ((item.value / totalSupply) * 100).toFixed(1)
                                    : 0}%
                            </p>

                        </div>

                    </div>

                ))}

            </div>

        </Card>
    )
}