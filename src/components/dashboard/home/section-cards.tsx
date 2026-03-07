'use client';

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
import { Clock } from "lucide-react"
import { useHorseTokenBalance } from "@/hooks/useHorseTokenBalance"

export function SectionCards() {
    const { balance, loading } = useHorseTokenBalance();

    return (
        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">

            {/* Active M&N Plan */}
            <Card className="w-full h-72 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <Image src="/explorer.png" alt="explorer" fill className="object-fill" />
                </div>
                <CardHeader className="relative z-10">
                    <CardDescription>Active M&N Plan</CardDescription>
                    <CardTitle className="text-4xl uppercase font-semibold tabular-nums @[250px]/card:text-3xl text-muted-foreground/50">
                        —
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="text-muted-foreground border-dashed">
                            <Clock className="w-3 h-3 mr-1" />
                            Coming Soon
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="relative z-10 flex-col items-start justify-end gap-1 text-sm">
                    <p className="font-medium text-sm text-muted-foreground">No active package</p>
                    <p className="text-xs text-muted-foreground/60">Package purchase will be available soon</p>
                </CardFooter>
            </Card>

            {/* Active Highest Level NFT */}
            <Card className="w-full relative overflow-hidden">
                <div className="absolute inset-0 left-[50%] top-[20%] right-7 opacity-20 pointer-events-none">
                    <Image src="/just-creator.png" alt="just-creator" height={250} width={250} className="object-cover" />
                </div>
                <CardHeader className="relative z-10">
                    <CardDescription>Active Highest Level NFT</CardDescription>
                    <CardTitle className="text-4xl uppercase font-semibold tabular-nums @[250px]/card:text-3xl text-muted-foreground/50">
                        —
                        <span className="text-muted-foreground text-sm"> (No NFT)</span>
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="text-muted-foreground border-dashed">
                            <Clock className="w-3 h-3 mr-1" />
                            Coming Soon
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start justify-end gap-1 text-sm">
                    <p className="font-medium text-sm text-muted-foreground">No NFT active</p>
                    <p className="text-xs text-muted-foreground/60">Royalty NFTs will be available soon</p>
                </CardFooter>
            </Card>

            {/* Horse Token */}
            <Card className="w-full relative overflow-hidden">
                <div className="absolute inset-0 left-[50%] top-[20%] right-7 opacity-30 pointer-events-none">
                    <Image src="/horse-token-img.png" alt="horse-token" height={250} width={250} className="object-cover" />
                </div>
                <CardHeader className="relative z-10">
                    <CardDescription>Horse Token</CardDescription>
                    <CardTitle className="text-4xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {loading ? (
                            <span className="text-muted-foreground/50 text-2xl">Loading...</span>
                        ) : (
                            `${balance} HRT`
                        )}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="text-muted-foreground border-dashed">
                            <Clock className="w-3 h-3 mr-1" />
                            Coming Soon
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <p className="font-medium text-sm text-muted-foreground">Token price: $0.00</p>
                    <p className="text-xs text-muted-foreground/60">Liquidity will be available after launch</p>
                </CardFooter>
            </Card>

        </div>
    )
}