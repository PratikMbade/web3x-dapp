"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Zap, Users, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

const stats = [
    { icon: Users, value: 50000, label: "Active Users", suffix: "+" },
    { icon: TrendingUp, value: 10, label: "Million Transactions", suffix: "M+" },
    { icon: Shield, value: 99.9, label: "Uptime", suffix: "%" },
    { icon: Zap, value: 0.001, label: "Avg. Transaction Fee", prefix: "$" },
]

function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        if (!isInView) return

        const duration = 2000
        const steps = 60
        const increment = value / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setCount(value)
                clearInterval(timer)
            } else {
                setCount(current)
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [isInView, value])

    const displayValue = Number.isInteger(value) ? Math.floor(count).toLocaleString() : count.toFixed(3)

    return (
        <span ref={ref}>
            {prefix}
            {displayValue}
            {suffix}
        </span>
    )
}

export function JoinPlatformSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section id="join" className="py-24 md:py-32 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        ref={ref}
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Join Our <span className="text-primary">Platform</span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                            Be part of the future of decentralized finance. Web3X offers unparalleled security, transparency, and
                            earning potential in the blockchain space.
                        </p>

                        <ul className="space-y-4 mb-8">
                            {[
                                "Instant peer-to-peer transactions",
                                "No intermediaries or hidden fees",
                                "Full control over your assets",
                                "24/7 global accessibility",
                            ].map((item, i) => (
                                <motion.li
                                    key={item}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex items-center space-x-3"
                                >
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                    <span className="text-foreground">{item}</span>
                                </motion.li>
                            ))}
                        </ul>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.7 }}
                        >
                            <Button
                                size="lg"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-full font-semibold shadow-lg shadow-primary/30"
                            >
                                Get Started Now
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Right - Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-2 gap-6"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-all"
                            >
                                <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                </div>
                                <p className="text-muted-foreground text-sm">{stat.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
