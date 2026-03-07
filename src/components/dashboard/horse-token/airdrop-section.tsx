/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/card"
import { Gift, CheckCircle2 } from "lucide-react"

interface AirdropSectionProps {
    data: any
}

export default function AirdropSection({ data }: AirdropSectionProps) {
    const claimPercentage = (data.airdropClaimed / data.airdropAmount) * 100

    return (
        <Card className="p-6 bg-card border-border/50">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Gift className="w-5 h-5 text-secondary" />
                    Community Airdrop
                </h2>
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-secondary/20 text-secondary">
                    {claimPercentage.toFixed(0)}% Claimed
                </span>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Claim Progress</span>
                        <span className="text-sm font-medium text-foreground">
                            {data.airdropClaimed} / {data.airdropAmount}
                        </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-secondary to-accent h-full transition-all duration-300"
                            style={{ width: `${claimPercentage}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div className="bg-card/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Per User</p>
                        <p className="text-xl font-bold text-foreground">1000 HORSE</p>
                    </div>
                    <div className="bg-card/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Remaining Slots</p>
                        <p className="text-xl font-bold text-secondary">{data.airdropAmount - data.airdropClaimed}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg p-4 border border-border/50">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-foreground">Airdrop Claims Active</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Connect your wallet and claim your tokens before slots run out
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}
