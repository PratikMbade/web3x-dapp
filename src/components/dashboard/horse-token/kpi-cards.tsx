/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/card"

interface KPICardsProps {
    data: any
}

export default function KPICards({ data }: KPICardsProps) {
    const kpis = [
        {
            label: "Market Cap",
            value: `996,484/998,349`,
            change: data.priceChange,
            icon: "chart",
        },
        {
            label: "Total Supply",
            value: `${data.totalSupply.toFixed(2)}/999999.00`,
            change: 0,
            icon: "database",
        },
        {
            label: "Circulating",
            value: `${data.circulating.toFixed(2)}/${data.totalSupply.toFixed(2)}`,
            change: 5.2,
            icon: "coins",
        },
        {
            label: "Token Holders",
            value: data.holders,
            change: 8.3,
            icon: "users",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => (
                <Card key={index} className="p-6 bg-card border-border/50 hover:bg-card/80 transition-colors">
                    <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-xl font-bold text-foreground">{kpi.value}</h3>
                       
                    </div>
                </Card>
            ))}
        </div>
    )
}
