"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, Award, Coins } from "lucide-react"

const cardData = [
    {
        title: "Current Package Bought",
        value: "Premium NFT Package",
        badge: "Active",
        icon: Package,
        color: "text-blue-500",
    },
    {
        title: "Total Income",
        value: "12.45 BNB",
        icon: TrendingUp,
        color: "text-green-500",
    },
    {
        title: "Highest NFT Owned",
        value: "Legendary Horse #42",
        icon: Award,
        color: "text-yellow-500",
    },
    {
        title: "Horse Token Balance",
        value: "8,542 HORSE",
        icon: Coins,
        color: "text-primary",
    },
]

export function SummaryCards() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cardData.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                >
                    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-balance text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                <div className="text-2xl font-bold">{card.value}</div>
                                {card.badge && (
                                    <Badge variant="secondary" className="w-fit text-xs">
                                        {card.badge}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}
