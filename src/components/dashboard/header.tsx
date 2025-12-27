"use client"

import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Bell, Moon, Search, Sun, Monitor, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import React from "react"

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
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search... (⌘K)" className="w-48 bg-secondary pl-9 lg:w-64" />
                </div>

                <Button variant="ghost" size="icon" className="md:hidden">
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="mr-2 h-4 w-4" />
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="mr-2 h-4 w-4" />
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            <Monitor className="mr-2 h-4 w-4" />
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 sm:w-80">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                            <span className="font-medium">New comment on Polymarket</span>
                            <span className="text-xs text-muted-foreground">2 minutes ago</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                            <span className="font-medium">5-star rating received</span>
                            <span className="text-xs text-muted-foreground">1 hour ago</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                            <span className="font-medium">Product published successfully</span>
                            <span className="text-xs text-muted-foreground">3 hours ago</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User avatar */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            {/* <Avatar className="h-8 w-8">
                                <AvatarImage src={session.data?.user.image || ''} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar> */}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
