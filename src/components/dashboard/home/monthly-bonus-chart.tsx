"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"

const chartData = [
    { month: "Jan", bonus: 0.85 },
    { month: "Feb", bonus: 1.2 },
    { month: "Mar", bonus: 1.45 },
    { month: "Apr", bonus: 1.1 },
    { month: "May", bonus: 1.8 },
    { month: "Jun", bonus: 2.1 },
    { month: "Jul", bonus: 1.95 },
    { month: "Aug", bonus: 2.4 },
]

const chartConfig = {
    bonus: {
        label: "Bonus (BNB)",
        color: "hsl(var(--chart-1))",
    },
}

export function MonthlyBonusChart() {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Bonus Claim</CardTitle>
                    <CardDescription>Your bonus claims over time (BNB)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line
                                    type="monotone"
                                    dataKey="bonus"
                                    stroke="var(--color-chart-1)"
                                    strokeWidth={2}
                                    dot={{ fill: "var(--color-chart-1)", r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </motion.div>
    )
}
