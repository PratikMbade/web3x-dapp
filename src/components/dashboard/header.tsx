"use client"

import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {  Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import React from "react"
import { WalletSheet } from "./wallet/wallet-sheet"
import { useActiveAccount } from "thirdweb/react"

const breadcrumbLabels: Record<string, string> = {
    admin: "Dashboard",
    products: "Products",
    analytics: "Analytics",
    comments: "Comments",
    ratings: "Ratings",
    users: "Users",
    settings: "Settings",
    create: "Create Product",
    edit: "Edit Product",
}

interface AdminHeaderProps {
    onMenuClick?: () => void
}

export function Header({ onMenuClick }: AdminHeaderProps) {
    const pathname = usePathname()
    const { setTheme } = useTheme()


  

    const handleDisconnect = () => {
        // Implement your disconnect logic here
        console.log("Disconnecting wallet...");
    };


    const activeAccount = useActiveAccount()


    // Generate breadcrumbs from pathname
    const pathSegments = pathname.split("/").filter(Boolean)
    const breadcrumbs = pathSegments.map((segment, index) => ({
        label: breadcrumbLabels[segment] || segment,
        href: "/" + pathSegments.slice(0, index + 1).join("/"),
        isLast: index === pathSegments.length - 1,
    }))

    const handleLogout = async () => {
        window.location.href = '/admin-signin';
    }
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:h-16 sm:px-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>

                <nav className="hidden items-center gap-1 text-sm sm:flex">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.href} className="flex items-center gap-1">
                            {index > 0 && <span className="text-muted-foreground">/</span>}
                            <span
                                className={crumb.isLast ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}
                            >
                                {crumb.label}
                            </span>
                        </div>
                    ))}
                </nav>

                <span className="font-medium text-foreground sm:hidden">{breadcrumbs[breadcrumbs.length - 1]?.label}</span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1 sm:gap-3">


                <WalletSheet
    walletAddress={activeAccount?.address || ''}
    totalBalance=" Loading...."
    innerBalances={[
        {
            symbol: "HRS",
            name: "Horse Token",
            balance: "0.00",
            usdValue: "$0.00",
            icon: "/horse-token-img.png",
            isHorseToken: true,
        },
        {
                        symbol: "ENR",
            name: "Energy Token",
            balance: "0.00",
            usdValue: "$0.00",
            icon: "/energy-token-logo.png",
            isHorseToken: false,
        }
    ]}
    walletBalances={[
        {
            symbol: "ETH",
            name: "Ethereum",
            balance: "1.5",
            usdValue: "$3,000.00",
            icon: "⟠",
        },
    ]}
    // onIcoVestingClaim={() => console.log("ICO Vesting claimed")}
    onGiftVestingClaim={() => console.log("Gift Vesting claimed")}
    icoVestingAvailable="125.50"
    giftVestingAvailable="75.25"
    icoClaimHistory={[
        {
            type: "ico",
            amount: "226.66",
            date: "2025-12-21",
            txHash: "0xabcd1234...5678efgh",
            usdValue: "$155.84",
        },
        {
            type: "ico",
            amount: "82.81",
            date: "2025-05-11",
            txHash: "0x9876fedc...4321abcd",
            usdValue: "$56.93",
        },
    ]}
    giftClaimHistory={[
        {
            type: "gift",
            amount: "19.22",
            date: "2025-09-17",
            txHash: "0x1111aaaa...2222bbbb",
            usdValue: "$13.21",
        },
    ]}
/>



            </div>
        </header>
    )
}
