"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="lg:ml-[280px]">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="min-h-[calc(100vh-3.5rem)] p-4 sm:min-h-[calc(100vh-4rem)] sm:p-6">{children}</main>
            </div>
        </div>
    )
}
