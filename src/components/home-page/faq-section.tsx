"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
    {
        question: "What is Web3X?",
        answer:
            "Web3X is a decentralized platform built on BNB Smart Chain that enables peer-to-peer transactions with complete transparency. It leverages blockchain technology to eliminate intermediaries and provide users with full control over their digital assets.",
    },
    {
        question: "How do I get started with Web3X?",
        answer:
            "Getting started is simple! Create an account, complete the verification process, connect your BNB-compatible wallet (like MetaMask or Trust Wallet), and you're ready to start transacting. Our platform guides you through each step.",
    },
    {
        question: "Is Web3X secure?",
        answer:
            "Absolutely. All our smart contracts are audited by leading security firms. We use industry-standard encryption, multi-signature wallets, and have implemented comprehensive security protocols to protect user assets and data.",
    },
    {
        question: "What are the transaction fees?",
        answer:
            "Web3X offers some of the lowest fees in the industry, averaging around $0.001 per transaction. Thanks to BNB Smart Chain's efficiency, you can transact without worrying about high gas fees.",
    },
    {
        question: "What is the Royalty NFT program?",
        answer:
            "The Royalty NFT program by Web3X allows users to earn passive rewards by holding special NFTs. These NFTs provide various benefits including bonus earnings, exclusive access to features, and participation in governance decisions.",
    },
    {
        question: "Can I use Web3X on mobile?",
        answer:
            "Yes! Web3X is fully responsive and works on any mobile browser. We're also developing dedicated iOS and Android apps that will provide an even better mobile experience with push notifications and enhanced features.",
    },
    {
        question: "How does peer-to-peer transaction work?",
        answer:
            "Our P2P system connects users directly without intermediaries. Smart contracts automatically handle escrow, verification, and settlement, ensuring both parties are protected throughout the transaction process.",
    },
    {
        question: "What countries is Web3X available in?",
        answer:
            "Web3X is available globally, with localized support in multiple languages. As a decentralized platform, there are no geographical restrictions, though we recommend checking local regulations regarding cryptocurrency usage.",
    },
]

export function FAQSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section id="faq" className="py-24 md:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Frequently Asked <span className="text-primary">Questions</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Find answers to common questions about Web3X
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Accordion type="single" collapsible className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={faq.question}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.1 * index }}
                            >
                                <AccordionItem
                                    value={`item-${index}`}
                                    className="border border-border rounded-xl px-6 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all data-[state=open]:border-primary/50"
                                >
                                    <AccordionTrigger className="text-left text-foreground font-semibold hover:text-primary transition-colors py-5">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            </motion.div>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    )
}
