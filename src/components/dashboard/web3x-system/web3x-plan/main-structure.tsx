"use client"

import PlanCard from "./plan-card"
import { PLANS } from "./data"
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Zap } from 'lucide-react'

type Package = {
    id: string;
    userId: string;
    amount: number;
    chainid: number;
    createdAt: Date;
    updatedAt: Date;
    packageNumber: number;
    packageBuyTranxHash: string;
}
type Props = {
    package: Package[] | null
}

export default function MainStructure(props: Props) {
    const totalPackages = PLANS.length
    const activePackages = props.package?.length || 0
    const completionRate = Math.round((activePackages / totalPackages) * 100)

    return (
        <div className="min-h-screen  py-12 px-4">
            {/* Hero Section */}
            <motion.div
                className=" mb-16"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Gradient Background Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-orange-500/10 via-purple-500/5 to-transparent blur-3xl -z-10" />

                {/* Header */}
                <div className="text-center mb-12">
                

                    <motion.h1
                        className="text-5xl  font-bold mb-4 bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Choose Your Package
                    </motion.h1>

                    <motion.p
                        className="text-lg text-slate-400 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Select the perfect investment tier and start your journey to financial growth
                    </motion.p>
                </div>

           
            </motion.div>

            {/* Plans Grid */}
            <motion.div
                className=" mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center">
                    {PLANS.map((plan, index) => {
                        const userPackage = props.package?.find(
                            (p) => p.packageNumber === plan.tier
                        )
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index, duration: 0.5 }}
                                whileHover={{ y: -8 }}
                                className="w-full max-w-sm"
                            >
                                <PlanCard
                                    id={plan.tier}
                                    userPackage={userPackage!}
                                    plan={plan}
                                />
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Bottom CTA Section */}
            <motion.div
                className="max-w-4xl mx-auto mt-20 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <div className="bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-orange-500/10 border border-orange-500/20 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                        Need Help Choosing?
                    </h3>
                    <p className="text-slate-400 mb-6">
                        Our team is here to help you select the perfect package for your investment goals
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all">
                            Contact Support
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold border border-slate-700 hover:bg-slate-700 transition-all">
                            View Documentation
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}