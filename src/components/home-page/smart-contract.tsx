/* eslint-disable react/jsx-no-duplicate-props */
"use client"

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import { ExternalLink, Copy, CheckCheck, GitBranch, Coins, Zap, BarChart3 } from "lucide-react"

const ORANGE = "#F97316"
const ORANGE_DEEP = "#EA580C"
const GOLD = "#FCD34D"

const contracts = [
  {
    id: "matrix",
    label: "Live",
    badge: "LIVE",
    title: "Web3X Matrix",
    symbol: "MATRIX",
    icon: GitBranch,
    description: "Core decentralised matrix smart contract powering the Web3X ecosystem logic and distribution.",
    address: "0x6eb46374b8EF7B538D17866AA7E82fcCbDa75945",
    url: "https://bscscan.com/address/0x6eb46374b8EF7B538D17866AA7E82fcCbDa75945",
    network: "BNB Smart Chain",
    accent: ORANGE,
    glow: "rgba(249,115,22,0.22)",
  },
  {
    id: "ico",
    label: "Live",
    badge: "ICO",
    title: "HRS Token ICO",
    symbol: "HRS-ICO",
    icon: BarChart3,
    description: "Live Initial Coin Offering contract for the HORSE Token — participate directly on-chain.",
    address: "0xa0F3a0128563a187499e335B7fB3E7f79c25CeC5",
    url: "https://bscscan.com/address/0xa0F3a0128563a187499e335B7fB3E7f79c25CeC5",
    network: "BNB Smart Chain",
    accent: GOLD,
    glow: "rgba(252,211,77,0.18)",
  },
  {
    id: "hrs",
    label: "Token",
    badge: "HRS",
    title: "Horse Token",
    symbol: "HRS",
    icon: Coins,
    description: "The HORSE Token (HRS) — a utility token within the Web3X ecosystem for rewards and governance.",
    address: "0x6c8986fD92227765A8a54A85DC7E168Fb530FA38",
    url: "https://bscscan.com/address/0x6c8986fD92227765A8a54A85DC7E168Fb530FA38",
    network: "BNB Smart Chain",
    accent: "#34D399",
    glow: "rgba(52,211,153,0.18)",
  },
  {
    id: "enr",
    label: "Token",
    badge: "ENR",
    title: "Web3X Energy Token",
    symbol: "ENR",
    icon: Zap,
    description: "The Energy Token (ENR) fuels Web3X ecosystem interactions and utility-based participation.",
    address: "0x9eC40A3f1a91ad370d666d58EB557E0B2C60E591",
    url: "https://bscscan.com/address/0x9eC40A3f1a91ad370d666d58EB557E0B2C60E591",
    network: "BNB Smart Chain",
    accent: "#60A5FA",
    glow: "rgba(96,165,250,0.18)",
  },
]

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`
}

function ContractCard({ contract, index }: { contract: (typeof contracts)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-80, 80], [6, -6]), { stiffness: 180, damping: 24 })
  const ry = useSpring(useTransform(mx, [-80, 80], [-6, 6]), { stiffness: 180, damping: 24 })

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(e.clientX - r.left - r.width / 2)
    my.set(e.clientY - r.top - r.height / 2)
  }
  const handleLeave = () => { mx.set(0); my.set(0); setHovered(false) }

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(contract.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const Icon = contract.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1200 }}
    >
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onMouseEnter={() => setHovered(true)}
        className="relative rounded-2xl overflow-hidden h-full"
        style={
          {
            rotateX: rx,
            rotateY: ry,
            transformStyle: "preserve-3d",
            background: hovered
              ? `linear-gradient(140deg, ${contract.accent}14 0%, rgba(13,13,13,0.97) 55%)`
              : "rgba(255,255,255,0.028)",
            border: hovered
              ? `1px solid ${contract.accent}55`
              : "1px solid rgba(255,255,255,0.08)",
            boxShadow: hovered ? `0 8px 48px ${contract.glow}` : "none",
            backdropFilter: "blur(20px)",
            transition: "background 0.35s, border 0.35s, box-shadow 0.35s",
          } as React.CSSProperties
        }
      >
        {/* Shimmer on hover */}
        {hovered && (
          <motion.div
            animate={{ x: ["-100%", "120%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear", repeatDelay: 1.2 }}
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${contract.accent}, transparent)` }}
          />
        )}

        {/* Radial glow spot on hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-[60px] pointer-events-none"
          style={{ background: contract.accent, opacity: 0.15 }}
        />

        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Top row: icon + badges */}
          <div className="flex items-start justify-between mb-5">
            {/* Icon */}
            <motion.div
              whileHover={{ scale: 1.12, rotate: 8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `${contract.accent}18`,
                border: `1px solid ${contract.accent}40`,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: contract.accent }} />
              {/* Pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                className="absolute inset-0 rounded-xl"
                style={{ background: `${contract.accent}20` }}
              />
            </motion.div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              {/* Live indicator */}
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  color: contract.accent,
                  background: `${contract.accent}18`,
                  border: `1px solid ${contract.accent}35`,
                }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: contract.accent }}
                />
                {contract.label}
              </span>
              {/* Symbol badge */}
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                style={{
                  color: "#374151",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {contract.badge}
              </span>
            </div>
          </div>

          {/* Title & description */}
          <h3 className="text-[17px] font-black text-white mb-1.5 leading-tight tracking-tight">
            {contract.title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-5 flex-1">{contract.description}</p>

          {/* Network tag */}
          <div className="flex items-center gap-1.5 mb-4">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: contract.accent }}
            />
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              {contract.network}
            </span>
          </div>

          {/* Address row */}
          <div
            className="flex items-center justify-between rounded-xl px-3.5 py-2.5 mb-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span className="font-mono text-[12px] text-gray-400 select-all">
              {truncateAddress(contract.address)}
            </span>
            <motion.button
              onClick={handleCopy}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="flex-shrink-0 ml-2 p-1 rounded-lg transition-colors"
              style={{
                color: copied ? contract.accent : "#6B7280",
              }}
              title="Copy address"
            >
              {copied ? (
                <CheckCheck className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </motion.button>
          </div>

          {/* BSCScan CTA */}
          <motion.a
            href={contract.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: hovered
                ? `linear-gradient(135deg, ${contract.accent}, ${contract.accent}CC)`
                : "rgba(255,255,255,0.05)",
              color: hovered ? "#000" : contract.accent,
              border: `1px solid ${contract.accent}40`,
              transition: "background 0.3s, color 0.3s",
            }}
          >
            <ExternalLink className="w-4 h-4" />
            View on BSCScan
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function SmartContractsSection() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" })

  return (
    <section
      id="smartcontracts"
      className="relative py-28 md:py-36 overflow-hidden"
      style={{
        background: "#0D0D0D",
        fontFamily: "'Syne', 'DM Sans', sans-serif",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="sc-dots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sc-dots)" />
        </svg>
        {/* Central orange glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[180px] opacity-[0.10]"
          style={{ background: ORANGE }}
        />
        {/* Animated floating orbs */}
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-[120px] opacity-10"
          style={{ background: ORANGE }}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px] opacity-10"
          style={{ background: GOLD }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-7"
            style={{ border: `1px solid ${ORANGE}35`, background: `${ORANGE}0D` }}
          >
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: ORANGE }}
            />
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase" style={{ color: ORANGE }}>
              On-Chain & Verified
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white mb-4 leading-[1.05] tracking-tight"
          >
            Smart{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${ORANGE}, ${GOLD})` }}
            >
              Contracts
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed"
          >
            Every Web3X contract is deployed on BNB Smart Chain and publicly verifiable on BSCScan.
            Click any card to inspect the contract.
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={headingInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 mx-auto h-px max-w-[120px]"
            style={{ background: `linear-gradient(90deg, transparent, ${ORANGE}, transparent)` }}
          />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contracts.map((contract, i) => (
            <ContractCard key={contract.id} contract={contract} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <p className="text-xs text-gray-600">
            All contracts are deployed on{" "}
            <span style={{ color: ORANGE }} className="font-semibold">BNB Smart Chain</span>.
            {" "}Always verify the contract address before interacting.
          </p>
        </motion.div>
      </div>
    </section>
  )
}