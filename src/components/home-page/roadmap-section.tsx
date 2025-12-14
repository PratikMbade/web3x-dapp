"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { CheckCircle2, Circle, Clock } from "lucide-react"

const roadmapItems = [
    {
        phase: "Phase 1",
        title: "Foundation",
        status: "completed",
        items: ["Platform conceptualization", "Smart contract development", "Security audits", "Initial team building"],
    },
    {
        phase: "Phase 2",
        title: "Launch",
        status: "completed",
        items: ["Mainnet deployment", "Community building", "First partnerships", "Marketing campaign"],
    },
    {
        phase: "Phase 3",
        title: "Growth",
        status: "current",
        items: ["Layer 2 integration", "NFT marketplace", "Mobile app beta", "Global expansion"],
    },
    {
        phase: "Phase 4",
        title: "Expansion",
        status: "upcoming",
        items: ["Cross-chain bridges", "DAO governance", "Enterprise solutions", "DeFi integrations"],
    },
    {
        phase: "Phase 5",
        title: "Evolution",
        status: "upcoming",
        items: ["AI-powered analytics", "Metaverse integration", "Advanced staking", "Ecosystem grants"],
    },
]

export function RoadmapSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="w-6 h-6 text-green-500" />
            case "current":
                return <Clock className="w-6 h-6 text-primary animate-pulse" />
            default:
                return <Circle className="w-6 h-6 text-muted-foreground" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "border-green-500 bg-green-500/10"
            case "current":
                return "border-primary bg-primary/10"
            default:
                return "border-border bg-card/50"
        }
    }

    return (
        <section id="roadmap" className="py-24 md:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Our <span className="text-primary">Roadmap</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Follow our journey as we build the future of decentralized finance
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted -translate-x-1/2" />

                    <div className="space-y-12">
                        {roadmapItems.map((item, index) => (
                            <motion.div
                                key={item.phase}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className={`relative flex flex-col md:flex-row items-start ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                                    }`}
                            >
                                {/* Timeline Node */}
                                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-4 border-primary z-10" />

                                {/* Content Card */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${index % 2 === 0 ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
                                        }`}
                                >
                                    <div
                                        className={`border rounded-2xl p-6 backdrop-blur-sm transition-all hover:shadow-lg ${getStatusColor(item.status)}`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <span className="text-sm text-primary font-semibold">{item.phase}</span>
                                                <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                                            </div>
                                            {getStatusIcon(item.status)}
                                        </div>
                                        <ul className="space-y-2">
                                            {item.items.map((point) => (
                                                <li key={point} className="flex items-center space-x-2 text-muted-foreground">
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
