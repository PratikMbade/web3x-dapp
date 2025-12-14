"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { UserPlus, Wallet, ArrowRightLeft, TrendingUp } from "lucide-react"

const steps = [
    {
        icon: UserPlus,
        title: "Create Account",
        description: "Sign up with your email and complete verification in minutes",
    },
    {
        icon: Wallet,
        title: "Connect Wallet",
        description: "Link your BNB wallet to start interacting with the platform",
    },
    {
        icon: ArrowRightLeft,
        title: "Start Transacting",
        description: "Engage in peer-to-peer transactions with zero intermediaries",
    },
    {
        icon: TrendingUp,
        title: "Earn Rewards",
        description: "Participate in the ecosystem and earn through various programs",
    },
]

export function HowItWorksSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section id="how-it-works" className="py-24 md:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        How It <span className="text-primary">Works</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Get started with Web3X in four simple steps</p>
                </motion.div>

                <div className="relative">
                    {/* Timeline Line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className="relative"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {/* Step Number */}
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="relative z-10 w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30"
                                    >
                                        <step.icon className="w-9 h-9 text-primary-foreground" />
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </div>
                                    </motion.div>

                                    <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
