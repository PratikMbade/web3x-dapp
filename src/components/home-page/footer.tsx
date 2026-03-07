"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useState } from "react"
import { Twitter, Github, Send, MessageCircle, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const footerLinks = {
    about: [
        { name: "Our Story", href: "#" },
        { name: "Team", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Press Kit", href: "#" },
    ],
    quickLinks: [
        { name: "Platform", href: "#platform" },
        { name: "Features", href: "#features" },
        { name: "Roadmap", href: "#roadmap" },
        { name: "FAQ", href: "#faq" },
    ],
    community: [
        { name: "Telegram", href: "#", icon: Send },
        { name: "Twitter", href: "#", icon: Twitter },
        { name: "Discord", href: "#", icon: MessageCircle },
        { name: "GitHub", href: "#", icon: Github },
    ],
    contact: [
        { icon: Mail, text: "support@web3x.io" },
        { icon: MapPin, text: "Global, Decentralized" },
        { icon: Phone, text: "24/7 Support" },
    ],
}

export function Footer() {
    const [email, setEmail] = useState("")
    const [subscribed, setSubscribed] = useState(false)

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault()
        if (email) {
            setSubscribed(true)
            setEmail("")
        }
    }

    return (
        <footer className="relative pt-24 pb-12 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/50 via-background to-background" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              

                {/* Bottom Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">W</span>
                        </div>
                        <span className="text-foreground font-semibold">Web3X</span>
                    </div>

                    <p className="text-muted-foreground text-sm text-center">
                        © {new Date().getFullYear()} Web3X. All rights reserved. Built on BNB Smart Chain.
                    </p>

                    
                </motion.div>
            </div>
        </footer>
    )
}
