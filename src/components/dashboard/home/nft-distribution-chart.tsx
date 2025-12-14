"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"

const chartData = [
    { type: "NFT Type 1", count: 12, fill: "var(--color-chart-1)" },
    { type: "NFT Type 2", count: 8, fill: "var(--color-chart-2)" },
    { type: "NFT Type 3", count: 15, fill: "var(--color-chart-3)" },
    { type: "NFT Type 4", count: 6, fill: "var(--color-chart-4)" },
    { type: "NFT Type 5", count: 10, fill: "var(--color-chart-5)" },
]

const chartConfig = {
    count: {
        label: "NFTs Owned",
    },
}

export function NftDistributionChart() {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card>
                <CardHeader>
                    <CardTitle>NFT Distribution</CardTitle>
                    <CardDescription>Your NFT portfolio breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis
                                    dataKey="type"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => value.replace("NFT Type ", "Type ")}
                                />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </motion.div>
    )
}
