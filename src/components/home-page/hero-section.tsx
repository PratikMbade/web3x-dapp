"use client"

import { motion } from "framer-motion"
import { Shield, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ParticlesBackground } from "@/components/home-page/particles-background"
import { useState, useEffect } from "react"
import Link from "next/link"

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
        const targetDate = new Date('2026-01-04T21:00:00+05:30') // 9:00 PM IST

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

       <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="flex flex-row items-center justify-center sm:flex-row justify-center gap-4 pt-8"
                    >
                       <Button className="w-fit">
                        <Link href="/registration" >
                        Register
                        </Link>
                    </Button>

                    <Button variant="outline" className="w-fit">
                        <Link href="/login">
                        Login
                        </Link>
                    </Button>





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
                            <a href="https://t.me/Web3XSpaceOfficial" target="_blank" rel="noopener noreferrer">
                                Join Telegram Group
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