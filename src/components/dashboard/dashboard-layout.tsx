"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Sidebar } from "@/components/dashboard/sidebar"

interface DashboardLayoutProps {
    children: React.ReactNode
    title: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />

            <main className="">
                <div className="container mx-auto ">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
