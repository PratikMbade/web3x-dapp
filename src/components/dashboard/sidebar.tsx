"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    MessageSquare,
    Star,
    Users,
    Settings,
    LogOut,
    TrendingUp,
    X,
    GalleryHorizontalEnd,
    Coins,
    Globe,
    Rocket,
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
import React from "react"
import Image from "next/image"

const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/dashboard/web3x-system", label: "Web3xSystem", icon: Globe },
    { href: "/dashboard/horse-token", label: "Horse Token", icon: Coins },
    { href: "/dashboard/user", label: "User", icon: Users },
    { href: "/dashboard/user-explorer", label: "User Explorer", icon: GalleryHorizontalEnd },
    { href: "/dashboard/income", label: "Income", icon: Users },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

interface AdminSidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname()


    const handleNavClick = () => {
        if (onClose) {
            onClose()
        }
    }

    const handleLogout = async () => {
        window.location.href = '/admin-signin';
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
                        <div className="flex  items-center justify-center ">
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
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
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
