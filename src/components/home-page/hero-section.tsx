"use client"

import { motion } from "framer-motion"
import { Shield, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ParticlesBackground } from "@/components/home-page/particles-background"
import { useState, useEffect } from "react"

const features = [
    { icon: Shield, text: "100% Decentralized" },
    { icon: Eye, text: "100% Transparent" },
    { icon: Users, text: "100% Peer-to-Peer" },
]

export function HeroSection() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    useEffect(() => {
        const targetDate = new Date('2025-12-27T21:00:00+05:30') // 9:00 PM IST

        const calculateTimeLeft = () => {
            const now = new Date()
            const difference = targetDate.getTime() - now.getTime()

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                })
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            }
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20" id="platform">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
            <ParticlesBackground />

            {/* Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-foreground tracking-tight"
                    >
                        Web3
                        <span className="text-primary">X</span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto"
                    >
                        Based on <span className="text-primary font-semibold">BNB Smart Chain</span> Blockchain
                    </motion.p>

                    {/* Countdown Timer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="pt-8"
                    >
                        <div className="inline-block">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="mb-4"
                            >
                                <span className="text-sm sm:text-base text-muted-foreground uppercase tracking-wider font-semibold">
                                    Launch Countdown
                                </span>
                            </motion.div>

                            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                                {[
                                    { value: timeLeft.days, label: 'Days' },
                                    { value: timeLeft.hours, label: 'Hours' },
                                    { value: timeLeft.minutes, label: 'Minutes' },
                                    { value: timeLeft.seconds, label: 'Seconds' }
                                ].map((item, index) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                                        className="flex flex-col items-center"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                                            <div className="relative bg-card/80 backdrop-blur-md border-2 border-primary/30 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 min-w-[70px] sm:min-w-[90px] shadow-lg">
                                                <motion.span
                                                    key={item.value}
                                                    initial={{ scale: 1.2, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary tabular-nums"
                                                >
                                                    {String(item.value).padStart(2, '0')}
                                                </motion.span>
                                            </div>
                                        </div>
                                        <span className="text-xs sm:text-sm text-muted-foreground mt-2 uppercase tracking-wide font-medium">
                                            {item.label}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.1 }}
                                className="text-xs sm:text-sm text-muted-foreground mt-4"
                            >
                                December 27, 2025 • 9:00 PM IST
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Key Features */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-wrap justify-center gap-4 md:gap-8 pt-8"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.text}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="flex items-center space-x-3 bg-card/50 backdrop-blur-sm border border-border rounded-full px-6 py-3"
                            >
                                <feature.icon className="w-5 h-5 text-primary" />
                                <span className="text-foreground font-medium">{feature.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="flex flex-col sm:flex-row justify-center gap-4 pt-8"
                    >
                        <Button
                            size="lg"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-full font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
                            asChild
                        >
                            <a href="https://t.me/web3x" target="_blank" rel="noopener noreferrer">
                                Join Telegram Group
                            </a>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-lg px-8 py-6 rounded-full font-semibold border-2 hover:bg-primary/10 transition-all bg-transparent"
                            asChild
                        >
                            <a href="https://whatsapp.com/channel/web3x" target="_blank" rel="noopener noreferrer">
                                Join WhatsApp Channel
                            </a>
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center pt-2"
                    >
                        <motion.div
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            className="w-1.5 h-1.5 bg-primary rounded-full"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}