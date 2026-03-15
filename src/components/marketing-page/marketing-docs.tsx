"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import {
  Globe, Grid3X3, Gem, Coins, FileText,
  X, ChevronRight, Download, ExternalLink,
  BookOpen, Shield, AlertTriangle, CheckCircle2,
  ArrowRight
} from "lucide-react"

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const ORANGE = "#F97316"
const GOLD = "#FCD34D"
const ORANGE_DEEP = "#EA580C"

// ─── Document data ────────────────────────────────────────────────────────────
const documents = [
  {
    id: "overview",
    number: "01",
    icon: Globe,
    tag: "Ecosystem",
    title: "Web3X Overview",
    subtitle: "WEB3X — A Decentralized Web3 Ecosystem",
    accent: ORANGE,
    glow: "rgba(249,115,22,0.20)",
    description: "A full introduction to the Web3X ecosystem — its principles, components, and participation model.",
    readTime: "3 min read",
    version: "v1.0",
    sections: [
      {
        heading: "Introduction",
        body: "Web3X is a decentralized Web3 ecosystem designed to enable digital ownership, participation, and community-driven value creation through blockchain technology. Web3X focuses on transparency, modular products, and progressive decentralization, offering users the ability to interact with Web3 tools without centralized profit guarantees.",
      },
      {
        heading: "What Is Web3X?",
        body: "Web3X is not an investment platform. It is a Web3 participation ecosystem composed of smart-contract-based modules, NFTs, and utility tokens that enable users to engage with decentralized digital infrastructure. Participation may involve NFTs, tokens, or other on-chain mechanisms depending on the module.",
      },
      {
        heading: "Core Principles",
        bullets: [
          "Decentralization through smart contracts",
          "Transparency by on-chain logic",
          "Community participation",
          "No guaranteed returns",
          "Progressive governance evolution",
        ],
      },
      {
        heading: "Ecosystem Components",
        body: "Web3X consists of multiple interconnected modules:",
        bullets: [
          "Matrix & NFT (M&N) participation system",
          "Royalty NFT module",
          "HORSE utility token",
          "Future DAO governance framework",
        ],
        note: "Each module operates under predefined smart-contract logic.",
      },
      {
        heading: "Participation & Rewards",
        body: "Participants may receive rewards depending on ecosystem activity, network participation, smart-contract distribution rules, and market conditions. Rewards are not guaranteed and may vary.",
      },
      {
        heading: "Important Notice",
        body: "Web3X does not offer financial advice, guaranteed income, or fixed returns. All participation involves risk. Users should only engage with funds they can afford to lose.",
        warning: true,
      },
    ],
  },
  {
    id: "mn",
    number: "02",
    icon: Grid3X3,
    tag: "System",
    title: "M&N System Explainer",
    subtitle: "Web3X M&N System — Explained Simply",
    accent: "#34D399",
    glow: "rgba(52,211,153,0.18)",
    description: "How the Matrix & NFT participation structure works — smart-contract logic, positions, and automated distribution.",
    readTime: "4 min read",
    version: "v1.0",
    sections: [
      {
        heading: "What Is the M&N System?",
        body: "The M&N system is a smart-contract-based participation structure within the Web3X ecosystem. It organizes NFT-activated positions into algorithmic matrices that allow for automated reward distribution based on predefined logic and ecosystem activity.",
      },
      {
        heading: "What M&N Is NOT",
        bullets: [
          "Not an investment",
          "Not a job",
          "Not a guaranteed income system",
          "Not controlled manually by admins",
        ],
        warning: true,
      },
      {
        heading: "How the M&N System Works",
        bullets: [
          "Users activate participation using NFTs",
          "Smart contracts place positions into matrices",
          "Network activity determines distribution flow",
          "Rewards, if any, are distributed automatically",
        ],
        note: "All operations are executed by smart contracts.",
      },
      {
        heading: "Why the M&N System Exists",
        bullets: [
          "Encourage early ecosystem participation",
          "Support network growth",
          "Provide transparent reward logic",
          "Avoid centralized decision-making",
        ],
      },
      {
        heading: "Rewards & Risk Disclosure",
        body: "Rewards depend on overall ecosystem participation and activity. There is no guarantee of earnings or recovery of funds. Users participate at their own discretion.",
        warning: true,
      },
      {
        heading: "Final Notice",
        body: "Always understand the system mechanics before participating. Never participate with borrowed or essential funds.",
        warning: true,
      },
    ],
  },
  {
    id: "royalty",
    number: "03",
    icon: Gem,
    tag: "NFT",
    title: "Web3X Royalty NFT",
    subtitle: "Understanding Royalty NFTs in the Web3X Ecosystem",
    accent: "#A78BFA",
    glow: "rgba(167,139,250,0.18)",
    description: "Everything about Web3X Royalty NFTs — what they are, how royalty distributions work, and what they are not.",
    readTime: "3 min read",
    version: "v1.0",
    sections: [
      {
        heading: "What Is a Royalty NFT?",
        body: "A Web3X Royalty NFT is a digital asset that may entitle its holder to participate in royalty distributions generated from specific ecosystem activities. Royalty NFTs do not represent ownership, equity, or guaranteed income.",
      },
      {
        heading: "Sources of Royalty Distributions",
        body: "Royalty distributions, if available, may originate from:",
        bullets: [
          "Ecosystem platform activity",
          "NFT marketplace interactions",
          "Protocol-defined allocation rules",
        ],
        note: "Distributions depend on smart-contract logic and availability.",
      },
      {
        heading: "Important Clarifications",
        bullets: [
          "Royalty distributions are variable",
          "Not guaranteed",
          "May be paused or modified by protocol rules",
          "Subject to market conditions",
        ],
        warning: true,
      },
      {
        heading: "Utility & Participation",
        body: "Royalty NFTs are designed to:",
        bullets: [
          "Incentivize long-term participation",
          "Align user interests with ecosystem activity",
          "Provide transparent distribution mechanisms",
        ],
      },
      {
        heading: "Risk Disclaimer",
        body: "Holding a Royalty NFT does not guarantee returns. Participation involves risk, including possible loss of value.",
        warning: true,
      },
    ],
  },
  {
    id: "horse",
    number: "04",
    icon: Coins,
    tag: "Token",
    title: "HORSE Token",
    subtitle: "HORSE — Web3X Utility Token",
    accent: GOLD,
    glow: "rgba(252,211,77,0.18)",
    description: "The purpose, utilities, and mechanics of the HORSE utility token inside the Web3X ecosystem.",
    readTime: "3 min read",
    version: "v1.0",
    sections: [
      {
        heading: "Purpose of HORSE",
        body: "HORSE is a utility token used within the Web3X ecosystem to enable access, interaction, and participation in various modules. HORSE does not represent equity, ownership rights, or guaranteed appreciation.",
      },
      {
        heading: "Primary Utilities",
        body: "HORSE may be used for:",
        bullets: [
          "Accessing ecosystem features",
          "Participating in Web3X modules",
          "Internal transactional logic",
          "Incentive alignment",
        ],
      },
      {
        heading: "Token Characteristics",
        bullets: [
          "Blockchain-based utility token",
          "Subject to market demand",
          "No guaranteed value or price stability",
        ],
      },
      {
        heading: "Token Supply & Mechanics",
        body: "Supply, distribution, and token mechanics are governed by smart-contract logic and may evolve as the ecosystem grows. Any changes are subject to protocol rules.",
      },
      {
        heading: "Important Notice",
        body: "HORSE is not an investment product. Price fluctuations are market-driven and unpredictable.",
        warning: true,
      },
    ],
  },
  {
    id: "whitepaper",
    number: "05",
    icon: FileText,
    tag: "Whitepaper",
    title: "Web3X Whitepaper",
    subtitle: "Web3X Whitepaper v1.0",
    accent: "#60A5FA",
    glow: "rgba(96,165,250,0.18)",
    description: "The comprehensive technical and conceptual document covering the full Web3X ecosystem architecture, ICO phases, and roadmap.",
    readTime: "Coming Soon",
    version: "v1.0 — Updating",
    comingSoon: true,
    sections: [
      {
        heading: "Status",
        body: "The Web3X Whitepaper v1.0 is currently being updated to reflect all recent changes, including the latest ICO Phase pricing and ecosystem module revisions. It will be published here upon completion.",
        warning: false,
      },
    ],
  },
]

// ─── Document Modal ───────────────────────────────────────────────────────────
function DocumentModal({
  doc,
  onClose,
}: {
  doc: (typeof documents)[0]
  onClose: () => void
}) {
  const Icon = doc.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 32 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-2xl flex flex-col"
        style={{
          background: "#111111",
          border: `1px solid ${doc.accent}45`,
          boxShadow: `0 0 80px ${doc.glow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Shimmer top line */}
        <motion.div
          animate={{ x: ["-100%", "120%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
          style={{ background: `linear-gradient(90deg, transparent, ${doc.accent}, transparent)` }}
        />

        {/* Modal header */}
        <div
          className="flex-shrink-0 flex items-start justify-between px-7 pt-7 pb-5"
          style={{ borderBottom: `1px solid rgba(255,255,255,0.07)` }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${doc.accent}18`, border: `1px solid ${doc.accent}40` }}
            >
              <Icon className="w-5 h-5" style={{ color: doc.accent }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: doc.accent }}
                >
                  {doc.tag}
                </span>
                <span className="text-[10px] text-gray-600">·</span>
                <span className="text-[10px] text-gray-600 font-medium">{doc.version}</span>
              </div>
              <h3 className="text-lg font-black text-white leading-tight">{doc.title}</h3>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>

        {/* Modal body — scrollable */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-7 custom-scroll">
          {doc.sections.map((section, si) => (
            <motion.div
              key={si}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.06, duration: 0.4 }}
            >
              {/* Section heading */}
              <div className="flex items-center gap-2.5 mb-3">
                <span
                  className="w-1 h-4 rounded-full flex-shrink-0"
                  style={{ background: section.warning ? "#FACC15" : doc.accent }}
                />
                <h4
                  className="text-sm font-black uppercase tracking-wider"
                  style={{ color: section.warning ? "#FACC15" : doc.accent }}
                >
                  {section.heading}
                </h4>
              </div>

              {/* Body text */}
              {section.body && (
                <p
                  className={`text-sm leading-relaxed mb-3 ${section.warning ? "text-amber-200/70" : "text-gray-400"}`}
                >
                  {section.body}
                </p>
              )}

              {/* Bullets */}
              {"bullets" in section && section.bullets && (
                <ul className="space-y-2 mb-3">
                  {(section.bullets as string[]).map((b, bi) => (
                    <motion.li
                      key={bi}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: si * 0.06 + bi * 0.05 + 0.15 }}
                      className="flex items-start gap-2.5 text-sm"
                      style={{ color: section.warning ? "#FDE68A" : "#9CA3AF" }}
                    >
                      <span
                        className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: section.warning ? "#FACC15" : doc.accent }}
                      />
                      {b}
                    </motion.li>
                  ))}
                </ul>
              )}

              {/* Note */}
              {"note" in section && section.note && (
                <p className="text-xs text-gray-600 italic mt-2">{section.note}</p>
              )}

              {/* Warning box */}
              {section.warning && (
                <div
                  className="flex items-start gap-2.5 mt-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(252,211,77,0.06)",
                    border: "1px solid rgba(252,211,77,0.18)",
                  }}
                >
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
                  <p className="text-xs text-amber-200/60 italic">
                    Risk disclosure — read carefully before participating.
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-7 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-xs text-gray-600">
            Web3X · {doc.version} · For informational purposes only
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold"
            style={{
              background: `${doc.accent}18`,
              color: doc.accent,
              border: `1px solid ${doc.accent}35`,
            }}
          >
            Close <X className="w-3 h-3" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Document Card ────────────────────────────────────────────────────────────
function DocumentCard({
  doc,
  index,
  onClick,
}: {
  doc: (typeof documents)[0]
  index: number
  onClick: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const [hovered, setHovered] = useState(false)
  const Icon = doc.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        className="relative rounded-2xl overflow-hidden cursor-pointer h-full"
        style={{
          background: hovered
            ? `linear-gradient(140deg, ${doc.accent}12 0%, rgba(13,13,13,0.97) 55%)`
            : "rgba(255,255,255,0.028)",
          border: hovered ? `1px solid ${doc.accent}50` : "1px solid rgba(255,255,255,0.08)",
          boxShadow: hovered ? `0 12px 48px ${doc.glow}` : "none",
          backdropFilter: "blur(16px)",
          transition: "background 0.35s, border 0.35s, box-shadow 0.35s",
        }}
      >
        {/* Shimmer on hover */}
        {hovered && (
          <motion.div
            animate={{ x: ["-100%", "120%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${doc.accent}, transparent)` }}
          />
        )}

        {/* Corner number watermark */}
        <span
          className="absolute bottom-4 right-5 text-7xl font-black leading-none select-none pointer-events-none"
          style={{ color: `${doc.accent}09` }}
        >
          {doc.number}
        </span>

        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Top row */}
          <div className="flex items-start justify-between mb-5">
            <motion.div
              animate={hovered ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1.6, repeat: hovered ? Infinity : 0 }}
              className="relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `${doc.accent}18`,
                border: `1px solid ${doc.accent}40`,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: doc.accent }} />
              <motion.div
                animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.3 }}
                className="absolute inset-0 rounded-xl"
                style={{ background: `${doc.accent}20` }}
              />
            </motion.div>

            <div className="flex items-center gap-2">
              {doc.comingSoon ? (
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: "#6B7280",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Coming Soon
                </span>
              ) : (
                <span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: doc.accent,
                    background: `${doc.accent}18`,
                    border: `1px solid ${doc.accent}35`,
                  }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Published
                </span>
              )}
            </div>
          </div>

          {/* Doc number + tag */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black text-gray-600 tabular-nums">DOC {doc.number}</span>
            <span className="text-[10px] text-gray-700">·</span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: doc.accent }}
            >
              {doc.tag}
            </span>
          </div>

          <h3 className="text-[17px] font-black text-white mb-2 leading-tight tracking-tight">
            {doc.title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-5 flex-1">{doc.description}</p>

          {/* Meta row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" style={{ color: doc.accent }} />
              <span className="text-[11px] text-gray-600">{doc.readTime}</span>
            </div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{doc.version}</span>
          </div>

          {/* CTA */}
          <motion.div
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold transition-all"
            animate={{
              background: hovered ? `linear-gradient(135deg, ${doc.accent}, ${doc.accent}CC)` : "rgba(255,255,255,0.05)",
              color: hovered ? "#000000" : doc.accent,
            }}
            transition={{ duration: 0.3 }}
            style={{ border: `1px solid ${doc.accent}40` }}
          >
            {doc.comingSoon ? (
              <>Coming Soon <ArrowRight className="w-3.5 h-3.5" /></>
            ) : (
              <>Read Document <ChevronRight className="w-3.5 h-3.5" /></>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" })
  const [activeDoc, setActiveDoc] = useState<(typeof documents)[0] | null>(null)

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "#0D0D0D", fontFamily: "'Syne', 'DM Sans', sans-serif" }}
    >
      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="doc-dots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#doc-dots)" />
        </svg>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[200px] opacity-[0.10]"
          style={{ background: ORANGE }}
        />
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full blur-[130px] opacity-[0.08]"
          style={{ background: ORANGE }}
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 8 }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[120px] opacity-[0.07]"
          style={{ background: GOLD }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">

        {/* ── Hero header ── */}
        <div ref={headingRef} className="text-center mb-20">
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
              Official Documents
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-5 leading-[1.0] tracking-tight"
          >
            Web3X
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${ORANGE}, ${GOLD})` }}
            >
              Knowledge Base
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            All official Web3X documents — ecosystem overviews, technical explainers, NFT guides,
            and tokenomics — published transparently for our community.
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={headingInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-10 mx-auto h-px max-w-[140px]"
            style={{ background: `linear-gradient(90deg, transparent, ${ORANGE}, transparent)` }}
          />
        </div>

        {/* ── Stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 mb-16"
        >
          {[
            { label: "Documents", value: "5", note: "4 published · 1 pending" },
            { label: "Last Updated", value: "2025", note: "Ongoing revisions" },
            { label: "Network", value: "BSC", note: "BNB Smart Chain" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center px-6 py-3 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <span className="text-2xl font-black text-white">{stat.value}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider mt-0.5" style={{ color: ORANGE }}>
                {stat.label}
              </span>
              <span className="text-[10px] text-gray-600 mt-0.5">{stat.note}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {documents.slice(0, 3).map((doc, i) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              index={i}
              onClick={() => !doc.comingSoon && setActiveDoc(doc)}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:w-2/3 lg:mx-auto">
          {documents.slice(3).map((doc, i) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              index={i + 3}
              onClick={() => !doc.comingSoon && setActiveDoc(doc)}
            />
          ))}
        </div>

        {/* ── Disclaimer strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 flex items-start gap-4 px-6 py-5 rounded-2xl"
          style={{
            background: "rgba(252,211,77,0.05)",
            border: "1px solid rgba(252,211,77,0.15)",
          }}
        >
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
          <p className="text-xs text-gray-500 leading-relaxed">
            All documents are published for informational purposes only and do not constitute financial, legal, or investment advice.
            Web3X does not guarantee returns or earnings. Participation involves risk. Always conduct your own research.{" "}
            <span style={{ color: ORANGE }} className="font-semibold">
              Never invest more than you can afford to lose.
            </span>
          </p>
        </motion.div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {activeDoc && (
          <DocumentModal doc={activeDoc} onClose={() => setActiveDoc(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}