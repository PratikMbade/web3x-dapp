"use client"

import { Clock } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  desktop: { label: "NFT Bonus", color: "var(--chart-2)" },
} satisfies ChartConfig

export function NFTIncomeChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>NFT Bonus</CardTitle>
        <CardDescription>Showing total NFT Bonus for last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={[]} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area dataKey="desktop" type="natural" fill="var(--color-desktop)" fillOpacity={0.4} stroke="var(--color-desktop)" />
          </AreaChart>
        </ChartContainer>

        {/* Coming Soon Overlay */}
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <Clock className="h-8 w-8 text-muted-foreground/50" />
          <p className="font-medium text-sm">Coming Soon</p>
          <p className="text-xs text-muted-foreground">NFT Bonus data will be available after launch.</p>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-muted-foreground text-xs">Data unavailable — launching soon</div>
      </CardFooter>
    </Card>
  )
}