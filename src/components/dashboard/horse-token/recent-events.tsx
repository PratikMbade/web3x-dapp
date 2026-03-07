import type React from "react"
import { Card } from "@/components/ui/card"
import { Activity, TrendingUp, Users, Zap } from "lucide-react"

interface EventItem {
    id: number
    type: "transaction" | "holder" | "listing" | "milestone"
    title: string
    description: string
    timestamp: string
    icon: React.ReactNode
}

export default function RecentEvents() {
    const events: EventItem[] = [
        {
            id: 1,
            type: "transaction",
            title: "ICO Milestone",
            description: "50,000 ETH raised",
            timestamp: "2 hours ago",
            icon: <Zap className="w-4 h-4" />,
        },
        {
            id: 2,
            type: "holder",
            title: "New Holders",
            description: "+1,234 holders joined",
            timestamp: "4 hours ago",
            icon: <Users className="w-4 h-4" />,
        },
        {
            id: 3,
            type: "listing",
            title: "Exchange Listing",
            description: "Listed on Uniswap V3",
            timestamp: "1 day ago",
            icon: <TrendingUp className="w-4 h-4" />,
        },
        {
            id: 4,
            type: "milestone",
            title: "Supply Update",
            description: "1M tokens burned",
            timestamp: "2 days ago",
            icon: <Activity className="w-4 h-4" />,
        },
    ]

    return (
        <Card className="p-6 bg-card border-border/50">
            <h2 className="text-xl font-bold text-foreground mb-6">Recent Events</h2>
            <div className="space-y-4">
                {events.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 pb-4 last:pb-0 border-b border-border/50 last:border-0">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">{event.icon}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-foreground text-sm">{event.title}</p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{event.timestamp}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}
