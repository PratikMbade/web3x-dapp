"use client"

import { useEffect, useState } from "react"
import { useActiveAccount } from "thirdweb/react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { getUserEachNFTCount } from "@/actions/nft"

const NFT_NAMES = ["Just", "Genesis", "Unity", "Legacy", "Infinity", "Crown"]

const chartConfig = {
  count: { label: "NFT Count", color: "var(--chart-3)" },
} satisfies ChartConfig

export function NFTCardCount() {
  const activeAccount = useActiveAccount()
  const [chartData, setChartData] = useState<{ nft: string; count: number }[] | null>(null)

  useEffect(() => {
    if (!activeAccount?.address) return

    getUserEachNFTCount(activeAccount.address).then((counts) => {
      // skip index 0 (Just NFT), show indices 1–5
      const data = counts.slice(1).map((count, i) => ({
        nft: NFT_NAMES[i + 1],
        count,
      }))
      setChartData(data)
    })
  }, [activeAccount?.address])

  const total = (chartData ?? []).reduce((sum, d) => sum + d.count, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>NFT Status</CardTitle>
        <CardDescription>Count of each NFT type you hold</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData === null ? (
          <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
            Loading…
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="nft" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel={false} />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none text-xs">
          {total > 0 ? `${total} NFT${total !== 1 ? "s" : ""} total` : "No NFTs found"}
        </div>
      </CardFooter>
    </Card>
  )
}
