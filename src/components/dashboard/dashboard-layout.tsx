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

            <main className="lg:pl-72">
                <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <h1 className="mb-8 text-balance text-3xl font-bold tracking-tight lg:text-4xl">{title}</h1>
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
