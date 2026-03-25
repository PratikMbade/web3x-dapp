/* eslint-disable react-hooks/purity */
"use client"

import { useEffect, useState } from "react"
import DashboardHeader from "@/components/dashboard/horse-token/dashboard-header"
import KPICards from "@/components/dashboard/horse-token/kpi-cards"
import SupplyDistribution from "@/components/dashboard/horse-token/supply-distribution"
import ICOProgress from "@/components/dashboard/horse-token/ico-progress"
import AirdropSection from "@/components/dashboard/horse-token/airdrop-section"
import RecentEvents from "@/components/dashboard/horse-token/recent-events"
import ActionCards from "@/components/dashboard/horse-token/action-cards"
import { useActiveAccount } from "thirdweb/react"
import { horseTokenContractInstance } from "@/contract/horse-token-contract/contract-instance"
import { formatUnits } from "ethers/lib/utils"
import { icoContractAddress, icoContractInstance } from "@/contract/ico-contract/ico-contract"

export default function Page() {
    const [data, setData] = useState({
        totalSupply: 9983490,
        circulating: 1865,
        burned: 1650,
        icoProgress: 65,
        icoPrice: 0.005,
        marketCap: 1250000,
        priceChange: 12.5,
        holders: 15234,
        airdropAmount: 100,
        airdropClaimed: 45,
        airdropEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    const activeAccount = useActiveAccount()

    // Simulate polling contract data
    useEffect(() => {
        const interval = setInterval(() => {
            setData((prev) => ({
                ...prev,
                marketCap: prev.marketCap + Math.random() * 100000 - 50000,
                priceChange: prev.priceChange + (Math.random() - 0.5) * 2,
            }))
        }, 15000)
        return () => clearInterval(interval)
    }, [])
async function getHorseTokenData() {
    try {
        if (!activeAccount) return

        const horseTokenContractInst =
            await horseTokenContractInstance(activeAccount)

        // 1️⃣ totalSupply (wei → token)
        const supplyInWei = await horseTokenContractInst.totalSupply()
        const totalSupply = Number(formatUnits(supplyInWei, 18))

        const circulatingInWei = await horseTokenContractInst.totalCirculatingSupply();
        const circulating = Number(formatUnits(circulatingInWei, 18))


        // matrix gift
        const icoTokenContractInst = await icoContractInstance(activeAccount);

     // Call ONLY once
const giftDetails = await icoTokenContractInst.HRSLiveMatrixGiftDetails(icoContractAddress);

// Convert properly
const giftDone = formatUnits(giftDetails.giftDone, 18);

const remainingGift = formatUnits(giftDetails.remainingGift, 18);


        // 2️⃣ holders count (already a normal number or bigint)
        const holderCount = await horseTokenContractInst.holderCount()
        console.log('holderCount',holderCount);

        setData((prev) => ({
            ...prev,
            totalSupply,
            circulating,
            giftDone,
            remainingGift,
            holders: Number(holderCount),
        }))
    } catch (error) {
        console.error("Error fetching horse token data:", error)
    }
}


   useEffect(() => {
    getHorseTokenData()
}, [activeAccount])

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <DashboardHeader />
                <div className="space-y-6">
                    <ActionCards />

                    <KPICards data={data} />

                    <ICOProgress data={data} />

                    {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SupplyDistribution data={data} />
                        <AirdropSection data={data} />
                    </div> */}

                    {/* <RecentEvents /> */}
                </div>
            </div>
        </main>
    )
}
