/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Database, Coins, Users, BarChart3 } from "lucide-react"

interface KPICardsProps {
  data: any
}

const iconMap: Record<string, any> = {
  chart: BarChart3,
  database: Database,
  coins: Coins,
  users: Users,
}

export default function KPICards({ data }: KPICardsProps) {
  const kpis = [
    {
      label: "Market Cap",
      value: `996,484 / 998,349`,
      change: data.priceChange,
      icon: "chart",
      accent: "#f59e0b",
      description: "Circulating × Price",
    },
    {
      label: "Total Supply",
      value: `${data.totalSupply.toFixed(2)}`,
      subValue: `/ 999,999.00`,
      change: 0,
      icon: "database",
      accent: "#6366f1",
      description: "Max issuance cap",
    },
    {
      label: "Circulating",
      value: `${data.circulating.toFixed(2)}`,
      subValue: `/ ${data.totalSupply.toFixed(2)}`,
      change: 5.2,
      icon: "coins",
      accent: "#10b981",
      description: "Active supply",
    },
    {
      label: "Token Holders",
      value: data.holders.toLocaleString(),
      change: 8.3,
      icon: "users",
      accent: "#ec4899",
      description: "Unique wallets",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = iconMap[kpi.icon]
        const isPositive = kpi.change >= 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown

        return (
          <Card
            key={index}
            className="relative p-5 bg-card border-border/40 overflow-hidden group hover:border-border/80 transition-all duration-300"
            style={{ boxShadow: `0 0 0 0 ${kpi.accent}00` }}
          >
            {/* Subtle gradient accent top bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
              style={{ background: `linear-gradient(90deg, ${kpi.accent}cc, ${kpi.accent}20)` }}
            />

            {/* Faint glow bg */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
              style={{ background: kpi.accent }}
            />

            <div className="relative z-10">
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground/70">
                  {kpi.label}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${kpi.accent}18`, border: `1px solid ${kpi.accent}30` }}
                >
                  <Icon className="w-4 h-4" style={{ color: kpi.accent }} />
                </div>
              </div>

              {/* Value */}
              <div className="mb-3">
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                    {kpi.value}
                  </span>
                  {kpi.subValue && (
                    <span className="text-sm text-muted-foreground/50 font-mono">
                      {kpi.subValue}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">{kpi.description}</p>
              </div>

              {/* Change badge */}
              {kpi.change !== 0 && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: isPositive ? "#10b98118" : "#ef444418",
                      color: isPositive ? "#10b981" : "#ef4444",
                      border: `1px solid ${isPositive ? "#10b98130" : "#ef444430"}`,
                    }}
                  >
                    <TrendIcon className="w-3 h-3" />
                    {Math.abs(kpi.change).toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-muted-foreground/40">24h</span>
                </div>
              )}
              {kpi.change === 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  <span className="text-[11px] text-muted-foreground/40">Fixed supply</span>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}