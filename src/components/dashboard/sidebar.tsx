"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    TrendingUp,
    X,
    GalleryHorizontalEnd,
    Coins,
    Globe,
    ChevronDown,
    ChevronRight,
    UserPlus,
    ShoppingCart,
    DollarSign,
    Grid3x3,
    ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState } from "react"
import Image from "next/image"

interface SubMenuItem {
    href: string
    label: string
    icon: React.ElementType
}

interface NavItem {
    href: string
    label: string
    icon: React.ElementType
    subItems?: SubMenuItem[]
}

const navItems: NavItem[] = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/dashboard/web3x-system", label: "Web3xSystem", icon: Globe },
    { href: "#", label: "Horse Token", icon: Coins },
    {
        href: "#dashboard-user",
        label: "User",
        icon: Users,
        subItems: [
            { href: "/dashboard/register-user", label: "Register User", icon: UserPlus },
            { href: "/dashboard/packagebuy-user", label: "Package Buy", icon: ShoppingCart },
        ]
    },
    { href: "/dashboard/user-explorer", label: "User Explorer", icon: GalleryHorizontalEnd },
    {
        href: "#",
        label: "Income",
        icon: DollarSign,
        subItems: [
            { href: "/dashboard/income/level-income", label: "Level Income", icon: TrendingUp },
            { href: "/dashboard/income/matrix-income", label: "Matrix Income", icon: Grid3x3 },
            { href: "/dashboard/income/nft-income", label: "NFT Income", icon: ImageIcon },
        ]
    },
]

interface AdminSidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname()
    const [expandedItems, setExpandedItems] = useState<string[]>([])

    const handleNavClick = () => {
        if (onClose) {
            onClose()
        }
    }

    const toggleExpanded = (href: string) => {
        setExpandedItems(prev =>
            prev.includes(href)
                ? prev.filter(item => item !== href)
                : [...prev, href]
        )
    }

    const handleLogout = async () => {
        window.location.href = '/admin-signin';
    }

    const isItemActive = (href: string) => {
        return pathname === href || pathname.startsWith(href + '/')
    }

    const isParentActive = (item: NavItem) => {
        if (pathname === item.href) return true
        if (item.subItems) {
            return item.subItems.some(subItem => pathname.startsWith(subItem.href))
        }
        return pathname.startsWith(item.href + '/')
    }

    return (
        <>
            {isOpen && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={onClose} />}

            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-border bg-sidebar transition-transform duration-300 ease-in-out",
                    // Mobile: transform based on isOpen state
                    "lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-border px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center">
                            <Image
                                src="/Web3x7.png"
                                alt="Web3X Logo"
                                width={100}
                                height={100}
                            />
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = isParentActive(item)
                        const isExpanded = expandedItems.includes(item.href)
                        const hasSubItems = item.subItems && item.subItems.length > 0

                        return (
                            <div key={item.href}>
                                {/* Main Nav Item */}
                                {hasSubItems ? (
                                    <button
                                        onClick={() => toggleExpanded(item.href)}
                                        className={cn(
                                            "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-sidebar-accent text-sidebar-primary"
                                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={cn("h-5 w-5", isActive && "text-sidebar-primary")} />
                                            {item.label}
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href}
                                        onClick={handleNavClick}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-sidebar-accent text-sidebar-primary"
                                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                        )}
                                    >
                                        <Icon className={cn("h-5 w-5", isActive && "text-sidebar-primary")} />
                                        {item.label}
                                    </Link>
                                )}

                                {/* Sub Items */}
                                {hasSubItems && isExpanded && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
                                        {item.subItems!.map((subItem) => {
                                            const SubIcon = subItem.icon
                                            const isSubActive = pathname === subItem.href

                                            return (
                                                <Link
                                                    key={subItem.href}
                                                    href={subItem.href}
                                                    onClick={handleNavClick}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                        isSubActive
                                                            ? "bg-sidebar-accent text-sidebar-primary"
                                                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                                    )}
                                                >
                                                    <SubIcon className={cn("h-4 w-4", isSubActive && "text-sidebar-primary")} />
                                                    {subItem.label}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </nav>

                {/* User Profile */}
                <div className="border-t border-border p-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-6 hover:bg-sidebar-accent">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={''} />
                                    <AvatarFallback>{"PB"}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start">
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Account Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>
        </>
    )
}