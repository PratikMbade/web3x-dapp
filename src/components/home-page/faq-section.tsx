"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import { Plus, Minus, HelpCircle } from "lucide-react"

const ORANGE = "#F97316"
const ORANGE_DIM = "#F9731620"
const GOLD = "#FCD34D"

const faqs = [
  {
    question: "Is Web3X an investment platform?",
    answer:
      "No. Web3X is a decentralized Web3 ecosystem providing participation tools via smart contracts, NFTs, and utility tokens.",
    tag: "Platform",
  },
  {
    question: "Does Web3X guarantee income or returns?",
    answer:
      "No. There are no guarantees of income, profit, or appreciation.",
    tag: "Returns",
  },
  {
    question: "Is Web3X a company?",
    answer:
      "Web3X is an ecosystem and brand representing a set of decentralized protocols and community initiatives. Some components may be developed or maintained by contributors.",
    tag: "About",
  },
  {
    question: "Are users required to recruit others?",
    answer:
      "No. Participation does not require recruiting. Network growth is organic and voluntary.",
    tag: "Participation",
  },
  {
    question: "Where do rewards come from?",
    answer:
      "Rewards, if available, are derived from ecosystem activity and distributed according to smart-contract rules.",
    tag: "Rewards",
  },
  {
    question: "Can users lose money?",
    answer:
      "Yes. Participation involves risk, including the potential loss of funds.",
    tag: "Risk",
    warning: true,
  },
  {
    question: "Is Web3X compliant with regulations?",
    answer:
      "Web3X does not offer securities, investment advice, or guaranteed returns. Users are responsible for understanding their local regulations.",
    tag: "Legal",
  },
  {
    question: "Who controls Web3X?",
    answer:
      "Smart contracts define most logic. Governance is designed to evolve toward decentralized community participation.",
    tag: "Governance",
  },
  {
    question: "How much can I earn?",
    answer:
      "Web3X does not guarantee earnings. Rewards, if any, depend on ecosystem activity, participation, and market conditions. Please review the official documents for details.",
    tag: "Earnings",
    warning: true,
  },
]

function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
  isInView,
}: {
  faq: (typeof faqs)[0]
  index: number
  isOpen: boolean
  onToggle: () => void
  isInView: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden cursor-pointer group"
        style={{
          border: isOpen
            ? `1px solid ${faq.warning ? GOLD + "60" : ORANGE + "55"}`
            : "1px solid rgba(255,255,255,0.07)",
          background: isOpen
            ? faq.warning
              ? `linear-gradient(135deg, rgba(252,211,77,0.07) 0%, rgba(13,13,13,0.95) 60%)`
              : `linear-gradient(135deg, rgba(249,115,22,0.10) 0%, rgba(13,13,13,0.95) 60%)`
            : "rgba(255,255,255,0.025)",
          boxShadow: isOpen
            ? faq.warning
              ? `0 0 30px rgba(252,211,77,0.10)`
              : `0 0 30px rgba(249,115,22,0.12)`
            : "none",
          backdropFilter: "blur(16px)",
          transition: "border 0.3s, background 0.3s, box-shadow 0.3s",
        }}
        onClick={onToggle}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        {/* Active shimmer */}
        {isOpen && (
          <motion.div
            animate={{ x: ["-100%", "120%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${faq.warning ? GOLD : ORANGE}, transparent)`,
            }}
          />
        )}

        {/* Question row */}
        <div className="flex items-start justify-between gap-4 px-6 py-5">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Tag pill */}
            <span
              className="flex-shrink-0 mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: isOpen ? (faq.warning ? GOLD : ORANGE) : "#6B7280",
                background: isOpen
                  ? faq.warning
                    ? `${GOLD}18`
                    : `${ORANGE}18`
                  : "rgba(255,255,255,0.05)",
                border: `1px solid ${isOpen ? (faq.warning ? GOLD + "40" : ORANGE + "40") : "rgba(255,255,255,0.08)"}`,
                transition: "all 0.3s",
              }}
            >
              {faq.tag}
            </span>

            <span
              className="text-sm md:text-[15px] font-semibold leading-snug pt-0.5"
              style={{
                color: isOpen ? "#F9FAFB" : "#9CA3AF",
                transition: "color 0.3s",
              }}
            >
              {faq.question}
            </span>
          </div>

          {/* Toggle icon */}
          <motion.div
            animate={{ rotate: isOpen ? 0 : 0 }}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
            style={{
              background: isOpen
                ? faq.warning
                  ? `${GOLD}20`
                  : `${ORANGE}20`
                : "rgba(255,255,255,0.05)",
              border: `1px solid ${isOpen ? (faq.warning ? GOLD + "40" : ORANGE + "40") : "rgba(255,255,255,0.08)"}`,
              transition: "background 0.3s, border 0.3s",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.span
                  key="minus"
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Minus
                    className="w-3.5 h-3.5"
                    style={{ color: faq.warning ? GOLD : ORANGE }}
                  />
                </motion.span>
              ) : (
                <motion.span
                  key="plus"
                  initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="w-3.5 h-3.5 text-gray-500" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Answer */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className="px-6 pb-5 pt-0"
                style={{
                  borderTop: `1px solid ${faq.warning ? GOLD + "18" : ORANGE + "18"}`,
                }}
              >
                <motion.p
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08, duration: 0.3 }}
                  className="text-sm leading-relaxed pt-4"
                  style={{ color: "#9CA3AF" }}
                >
                  {faq.answer}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export function FAQSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section
      id="faq"
      className="relative py-28 md:py-36 overflow-hidden"
      style={{
        background: "#0D0D0D",
        fontFamily: "'Syne', 'DM Sans', sans-serif",
      }}
    >
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="faq-dots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#faq-dots)" />
        </svg>
        {/* Orange glow top-right */}
        <div
          className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full blur-[180px] opacity-[0.12]"
          style={{ background: ORANGE }}
        />
        {/* Subtle bottom left glow */}
        <div
          className="absolute -bottom-20 left-0 w-[400px] h-[400px] rounded-full blur-[140px] opacity-[0.08]"
          style={{ background: ORANGE }}
        />
      </div>

      <div ref={ref} className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-7"
            style={{
              border: `1px solid ${ORANGE}35`,
              background: `${ORANGE}0D`,
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: ORANGE }}
            />
            <span
              className="text-[11px] font-bold tracking-[0.25em] uppercase"
              style={{ color: ORANGE }}
            >
              Need Answers?
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white mb-4 leading-[1.05] tracking-tight"
          >
            Frequently Asked{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${ORANGE}, ${GOLD})` }}
            >
              Questions
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-base max-w-lg mx-auto leading-relaxed"
          >
            Straightforward answers about how Web3X works, what it is, and what to expect.
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 mx-auto h-px max-w-[120px]"
            style={{ background: `linear-gradient(90deg, transparent, ${ORANGE}, transparent)` }}
          />
        </div>

        {/* FAQ list */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Bottom disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex items-start gap-3 px-5 py-4 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: ORANGE }} />
          <p className="text-xs text-gray-500 leading-relaxed">
            This FAQ is for informational purposes only and does not constitute financial, legal, or investment advice.
            Always conduct your own due diligence before participating in any blockchain ecosystem.
          </p>
        </motion.div>
      </div>
    </section>
  )
}