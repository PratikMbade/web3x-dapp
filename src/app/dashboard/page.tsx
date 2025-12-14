"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SummaryCards } from "@/components/dashboard/home/summary-card"
import { NftDistributionChart } from "@/components/dashboard/home/nft-distribution-chart"
import { MonthlyBonusChart } from "@/components/dashboard/home/monthly-bonus-chart"

export default function HomePage() {
    return (
        <DashboardLayout title="Home">
            <div className="space-y-8">
                <SummaryCards />
                <div className="grid gap-8 lg:grid-cols-2">
                    <NftDistributionChart />
                    <MonthlyBonusChart />
                </div>
            </div>
        </DashboardLayout>
    )
}
