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
                {/* Newsletter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-3xl p-8 md:p-12 mb-16"
                >
                    <div className="max-w-2xl mx-auto text-center">
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Stay Updated</h3>
                        <p className="text-muted-foreground mb-6">
                            Subscribe to our newsletter for the latest updates, features, and news from Web3X.
                        </p>
                        {subscribed ? (
                            <motion.p
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-primary font-semibold"
                            >
                                Thank you for subscribing! 🎉
                            </motion.p>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 bg-background/50 border-border"
                                    required
                                />
                                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                                    Subscribe
                                </Button>
                            </form>
                        )}
                    </div>
                </motion.div>

                {/* Footer Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* About */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <h4 className="text-foreground font-semibold mb-4">About</h4>
                        <ul className="space-y-3">
                            {footerLinks.about.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <h4 className="text-foreground font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            {footerLinks.quickLinks.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Community */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <h4 className="text-foreground font-semibold mb-4">Community</h4>
                        <ul className="space-y-3">
                            {footerLinks.community.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-muted-foreground hover:text-primary transition-colors flex items-center space-x-2"
                                    >
                                        <link.icon className="w-4 h-4" />
                                        <span>{link.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                    >
                        <h4 className="text-foreground font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3">
                            {footerLinks.contact.map((item) => (
                                <li key={item.text} className="flex items-center space-x-2 text-muted-foreground">
                                    <item.icon className="w-4 h-4 text-primary" />
                                    <span>{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

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

                    <div className="flex space-x-4">
                        {[Twitter, Send, MessageCircle, Github].map((Icon, i) => (
                            <motion.a
                                key={i}
                                href="#"
                                whileHover={{ scale: 1.1, y: -2 }}
                                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                aria-label={`Social link ${i + 1}`}
                            >
                                <Icon className="w-5 h-5" />
                            </motion.a>
                        ))}
                    </div>
                </motion.div>
            </div>
        </footer>
    )
}
