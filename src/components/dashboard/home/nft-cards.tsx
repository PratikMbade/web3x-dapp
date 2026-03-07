"use client"

import { Clock } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  desktop: { label: "NFT Count", color: "var(--chart-3)" },
} satisfies ChartConfig

export function NFTCardCount() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>NFT Status</CardTitle>
        <CardDescription>Each NFTs Count</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={[]}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>

        {/* Coming Soon Overlay */}
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <Clock className="h-8 w-8 text-muted-foreground/50" />
          <p className="font-medium text-sm">Coming Soon</p>
          <p className="text-xs text-muted-foreground">NFT status data will be available after launch.</p>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none text-xs">
          Data unavailable — launching soon
        </div>
      </CardFooter>
    </Card>
  )
}