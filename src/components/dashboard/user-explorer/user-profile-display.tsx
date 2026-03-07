"use client"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from "next/image"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { CardContent } from "@/components/ui/card"
import { CategoryIncomePieChart } from "@/components/dashboard/home/category-income-pie-chart"

interface UserProfileDisplayProps {
    ethAddress: string
}

// Mock data - replace with actual API calls
const mockUserData = {
    activePlan: "BUILDER",
    activeNFT: "JUST CREATOR",
    nftLevel: 0,
    horseTokens: 13,
    incomeChange: 12.5,
    bonusChange: -20,
    liquidityChange: 4.5,
}

const chartData = [
    { month: "February", desktop: 186 },
    { month: "March", desktop: 305 },
    { month: "April", desktop: 237 },
    { month: "May", desktop: 73 },
    { month: "June", desktop: 209 },
    { month: "July", desktop: 214 },
]

const nftCountData = [
    { month: "Explorer", desktop: 186 },
    { month: "Builder", desktop: 305 },
    { month: "Innovator", desktop: 237 },
    { month: "Achiever", desktop: 73 },
    { month: "Leader", desktop: 209 },
    { month: "Sage", desktop: 214 },
]

const mockCategoryData = [
    { name: "Matrix Income", value: 3, fill: "var(--color-chart-1)" },
    { name: "Level Income", value: 1, fill: "var(--color-chart-2)" },
    { name: "NFT Income", value: 1, fill: "var(--color-chart-3)" },
]

const chartConfig = {
    desktop: {
        label: "Income",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

const barChartConfig = {
    desktop: {
        label: "Count",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

export function UserProfileDisplay({ ethAddress }: UserProfileDisplayProps) {
    // In production, fetch user data based on ethAddress
    // const { data, isLoading } = useQuery(['user', ethAddress], () => fetchUserData(ethAddress))

    const userData = mockUserData

    return (
        <div className="space-y-6">
            {/* User Address Header */}
            <div className="rounded-lg border bg-card p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">User Address</h3>
                <p className="text-lg font-mono break-all">{ethAddress}</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {/* Active Plan Card */}
                <Card className="w-full h-72 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30 pointer-events-none">
                        <Image
                            src="/explorer.png"
                            alt="plan-background"
                            fill
                            className="object-fill"
                        />
                    </div>

                    <CardHeader className="relative z-10">
                        <CardDescription>Active M&N Plan</CardDescription>
                        <div className="flex">
                            <CardTitle className="text-4xl uppercase font-semibold tabular-nums @[250px]/card:text-3xl">
                                {userData.activePlan}
                            </CardTitle>
                        </div>

                        <CardAction>
                            <Badge variant="outline">
                                <IconTrendingUp />
                                Income +{userData.incomeChange}%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="relative z-10 flex-1 flex-col items-start justify-end gap-1.5 text-sm">
                        <div className="text-muted-foreground">
                            Visitors for the last 6 months
                        </div>
                    </CardFooter>
                </Card>

                {/* NFT Card */}
                <Card className="w-full h-72 relative overflow-hidden">
                    <div className="absolute inset-0 left-[50%] top-[20%] right-7 opacity-50 pointer-events-none">
                        <Image
                            src="/just-creator.png"
                            alt="nft-background"
                            height={250}
                            width={250}
                            className="object-cover"
                        />
                    </div>
                    <CardHeader className="relative z-10">
                        <CardDescription>Active Highest Level NFT</CardDescription>
                        <CardTitle className="text-4xl uppercase font-semibold tabular-nums @[250px]/card:text-3xl">
                            {userData.activeNFT}
                            <span className="text-muted-foreground text-sm">
                                {" "}(Level-{userData.nftLevel})
                            </span>
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <IconTrendingDown />
                                Bonus {userData.bonusChange}%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="relative z-10 flex-1 flex-col items-start justify-end gap-1.5 text-sm">
                        <div className="text-muted-foreground">
                            Visitors for the last 6 months
                        </div>
                    </CardFooter>
                </Card>

                {/* Horse Token Card */}
                <Card className="w-full h-72 relative overflow-hidden">
                    <div className="absolute inset-0 left-[50%] top-[20%] right-7 opacity-50 pointer-events-none">
                        <Image
                            src="/horse-token-img.png"
                            alt="token-background"
                            height={250}
                            width={250}
                            className="object-cover"
                        />
                    </div>
                    <CardHeader className="relative z-10">
                        <CardDescription>Horse Token</CardDescription>
                        <CardTitle className="text-4xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {userData.horseTokens} HRT
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <IconTrendingUp />
                                Liquidity +{userData.liquidityChange}%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="relative z-10 flex-1 flex-col items-start gap-1.5 text-sm">
                        <div className="text-muted-foreground">Meets growth projections</div>
                    </CardFooter>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="w-full flex flex-col gap-4 lg:flex-row lg:items-start">
                {/* NFT Income Chart */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>NFT Bonus</CardTitle>
                        <CardDescription>
                            Showing total NFT Bonus for last 6 months
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <AreaChart
                                accessibilityLayer
                                data={chartData}
                                margin={{
                                    left: 12,
                                    right: 12,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" />}
                                />
                                <Area
                                    dataKey="desktop"
                                    type="natural"
                                    fill="var(--color-desktop)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-desktop)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter>
                        <div className="flex w-full items-start gap-2 text-sm">
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2 leading-none font-medium">
                                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                                </div>
                                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                                    Feb - July 2026
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                {/* NFT Count Chart */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>NFT Status</CardTitle>
                        <CardDescription>Each NFTs Count</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={barChartConfig}>
                            <BarChart accessibilityLayer data={nftCountData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                        <div className="flex gap-2 leading-none font-medium">
                            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-muted-foreground leading-none">
                            Showing total visitors for the last 6 months
                        </div>
                    </CardFooter>
                </Card>

                {/* Category Income Pie Chart */}
                <CategoryIncomePieChart data={mockCategoryData} />
            </div>
        </div>
    )
}