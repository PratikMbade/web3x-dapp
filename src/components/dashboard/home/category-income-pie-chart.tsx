"use client"

import { Clock } from "lucide-react"
import { PieChart, Pie } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CategoryChartProps {
  data: { name: string; value: number; fill: string }[]
}

const chartConfig = {
  LevelIncome: { label: "Level Income" },
  MatrixIncome: { label: "Matrix Income", color: "var(--chart-1)" },
  NFTIncome: { label: "NFTs Income", color: "var(--chart-2)" },
} satisfies ChartConfig

export function CategoryIncomePieChart({ data }: CategoryChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Total Income Pie Chart</CardTitle>
        <CardDescription>Level, Matrix, and NFT income distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={[]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" />
          </PieChart>
        </ChartContainer>

        {/* Coming Soon Overlay */}
        <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
          <Clock className="h-8 w-8 text-muted-foreground/50" />
          <p className="font-medium text-sm">Coming Soon</p>
          <p className="text-xs text-muted-foreground">Income distribution will be visible after launch.</p>
        </div>
      </CardContent>
    </Card>
  )
}