"use client"


import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { NFTCardCount } from "@/components/dashboard/home/nft-cards"
import { NFTIncomeChart } from "@/components/dashboard/home/nft-income-chart"
import { SectionCards } from "@/components/dashboard/home/section-cards"


export default function HomePage() {
    return (
        <DashboardLayout title="Home">
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <SectionCards />
                        <div className="px-4 w-full  flex flex-col gap-4 py-4 md:px-6 md:py-6 lg:flex-row lg:items-center lg:justify-between">
                            <NFTIncomeChart />
                            <NFTCardCount />
                            <NFTIncomeChart />

                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

