"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Layers, Shield, BarChart3, Globe, Crown, Fingerprint } from "lucide-react"

const features = [
    {
        icon: Layers,
        title: "Layer 2 Scaling",
        description: "Leverage BNB's Layer 2 solution for faster and cheaper transactions",
    },
    {
        icon: Shield,
        title: "Secure Smart Contracts",
        description: "Smart contracts ensuring the highest level of security for your assets",
    },
    {
        icon: BarChart3,
        title: "Advanced Analytics",
        description: "Real-time data and insights to make informed decisions",
    },
    {
        icon: Globe,
        title: "Global Accessibility",
        description: "Available worldwide with localized support and resources",
    },
    {
        icon: Crown,
        title: "Royalty NFT",
        description: "Royalty NFT program by Web3x, rewarding with bonus",
    },
    {
        icon: Fingerprint,
        title: "Decentralized Identity",
        description: "Secure and private identity management for users and applications",
    },
]

export function FeaturesSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section id="features" className="py-24 md:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Powerful <span className="text-primary">Features</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Built on the robust BNB Smart Chain with cutting-edge blockchain technology
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 h-full hover:border-primary/50 transition-all duration-300">
                                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                    <feature.icon className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
