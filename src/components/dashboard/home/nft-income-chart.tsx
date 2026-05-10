"use client"

import { useEffect, useState } from "react"
import { useActiveAccount } from "thirdweb/react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { getNFTMonthlyIncome, type MonthlyNFTIncome } from "@/actions/nft"

const chartConfig = {
  income: { label: "NFT Income (USDT)", color: "var(--chart-2)" },
} satisfies ChartConfig

export function NFTIncomeChart() {
  const activeAccount = useActiveAccount()
  const [chartData, setChartData] = useState<MonthlyNFTIncome[] | null>(null)

  useEffect(() => {
    if (!activeAccount?.address) return

    getNFTMonthlyIncome(activeAccount.address).then(setChartData)
  }, [activeAccount?.address])

  const total = (chartData ?? []).reduce((sum, d) => sum + d.income, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>NFT Income</CardTitle>
        <CardDescription>Monthly claimed income for the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData === null ? (
          <div className="flex items-center justify-center h-50 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `$${v}`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Area
                dataKey="income"
                type="natural"
                fill="var(--color-income)"
                fillOpacity={0.4}
                stroke="var(--color-income)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-muted-foreground text-xs">
          {total > 0 ? `Total last 6 months: $${total.toFixed(2)} USDT` : "No income claimed yet"}
        </div>
      </CardFooter>
    </Card>
  )
}
