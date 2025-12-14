/* eslint-disable react-hooks/static-components */
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Coins, ShoppingCart, Network, DollarSign, Users, Menu, X } from "lucide-react"

const menuItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Horse Token", href: "/horse-token", icon: Coins },
    { name: "Buy / Register User Package", href: "/buy-package", icon: ShoppingCart },
    { name: "Web3X System", href: "/web3x-system", icon: Network },
    { name: "Income", href: "/income", icon: DollarSign },
    { name: "User Explorer", href: "/user-explorer", icon: Users },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
        <div className="flex h-full flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <Network className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Web3X</h2>
                        <p className="text-xs text-muted-foreground">Dashboard</p>
                    </div>
                </motion.div>
                {mobile && (
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="lg:hidden">
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <nav className="flex flex-1 flex-col gap-2">
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                href={item.href}
                                onClick={() => mobile && setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground",
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-balance">{item.name}</span>
                            </Link>
                        </motion.div>
                    )
                })}
            </nav>

            <div className="mt-auto border-t pt-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                </div>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40 lg:hidden">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                    <SidebarContent mobile />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r bg-sidebar lg:block"
            >
                <SidebarContent />
            </motion.aside>
        </>
    )
}
