/* eslint-disable react-hooks/purity */
"use client"

import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { ShieldCheck, Network, Globe, Zap, Compass, AlertTriangle, CheckCircle2 } from "lucide-react"

// ─── Color palette matching homepage ──────────────────────────────────────────
const ORANGE = "#F97316"
const ORANGE_BRIGHT = "#FB923C"
const ORANGE_DEEP = "#EA580C"
const GOLD = "#FCD34D"

const steps = [
  {
    number: "01",
    icon: ShieldCheck,
    title: "Prepare a Self-Custody Wallet",
    subtitle: "Own Your Keys",
    description:
      "You will need a self-custody Web3 wallet that allows you to control your private keys.",
    wallets: ["MetaMask", "SafePal", "TokenPocket"],
    note: "Web3X does not own, control, or endorse any third-party wallet.",
  },
  {
    number: "02",
    icon: Network,
    title: "Connect to the Blockchain Network",
    subtitle: "Go On-Chain",
    description:
      "Web3X operates on a supported blockchain network that enables smart contracts and decentralised applications.",
    bullets: [
      "Ensure your wallet supports the network",
      "Keep a small amount of native token for transaction fees",
    ],
  },
  {
    number: "03",
    icon: Globe,
    title: "Access Web3X",
    subtitle: "Enter the Ecosystem",
    description:
      "Users may access Web3X directly via the official platform or through an invitation link shared by a community member.",
    bullets: [
      "Directly via the official platform",
      "Via an invitation link from a community member",
    ],
    note: "Using an invitation link is optional and does not guarantee outcomes.",
  },
  {
    number: "04",
    icon: Zap,
    title: "Activate Participation",
    subtitle: "If Applicable",
    description:
      "Some ecosystem modules may require an initial on-chain interaction and confirmation of a smart-contract transaction.",
    bullets: [
      "An initial on-chain interaction",
      "Confirmation of a smart-contract transaction",
    ],
    note: "This process activates access to available ecosystem features.",
  },
  {
    number: "05",
    icon: Compass,
    title: "Explore the Ecosystem",
    subtitle: "Your Journey Begins",
    description:
      "Once activated, users may explore available modules, learn how smart contracts operate, and choose how and whether to participate.",
    bullets: [
      "Explore available modules",
      "Learn how smart contracts operate",
      "Choose how and whether to participate",
    ],
    note: "Participation levels vary by user choice.",
  },
]

// ─── Dot particle background ──────────────────────────────────────────────────
function ParticleField() {
  const particles = Array.from({ length: 55 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.8,
    delay: Math.random() * 6,
    dur: Math.random() * 8 + 6,
    opacity: Math.random() * 0.45 + 0.1,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Orange radial glow – centre */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 55%, rgba(249,115,22,0.13) 0%, transparent 70%)",
        }}
      />
      {/* Subtle corner glow */}
      <div
        className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full blur-[160px] opacity-20"
        style={{ background: ORANGE }}
      />
      {/* Dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.055]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: ORANGE,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -24, 0],
            opacity: [p.opacity, p.opacity * 2.2, p.opacity],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// ─── Single step card ─────────────────────────────────────────────────────────
function StepCard({
  step,
  index,
  isActive,
  isCompleted,
  onClick,
}: {
  step: (typeof steps)[0]
  index: number
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-60px" })

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-70, 70], [5, -5]), { stiffness: 180, damping: 22 })
  const ry = useSpring(useTransform(mx, [-70, 70], [-5, 5]), { stiffness: 180, damping: 22 })

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(e.clientX - r.left - r.width / 2)
    my.set(e.clientY - r.top - r.height / 2)
  }
  const handleLeave = () => { mx.set(0); my.set(0) }

  const Icon = step.icon
  const isLeft = index % 2 === 0

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: isLeft ? -50 : 50, scale: 0.93 }}
      animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
      transition={{ duration: 0.75, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1200 }}
      className="w-full cursor-pointer"
      onClick={onClick}
    >
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="relative rounded-2xl overflow-hidden transition-shadow duration-500"
        style={
          {
            rotateX: rx,
            rotateY: ry,
            transformStyle: "preserve-3d",
            background: isActive
              ? "linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(17,17,17,0.95) 60%)"
              : "rgba(255,255,255,0.03)",
            border: isActive
              ? `1px solid rgba(249,115,22,0.55)`
              : isCompleted
              ? `1px solid rgba(249,115,22,0.25)`
              : "1px solid rgba(255,255,255,0.07)",
            boxShadow: isActive
              ? `0 0 40px rgba(249,115,22,0.18), inset 0 0 40px rgba(249,115,22,0.05)`
              : "none",
            backdropFilter: "blur(20px)",
          } as React.CSSProperties
        }
      >
        {/* Top shimmer on active */}
        {isActive && (
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${ORANGE}, transparent)` }}
          />
        )}

        {/* Completed check overlay */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-4 right-4 z-20"
            >
              <CheckCircle2 className="w-5 h-5" style={{ color: ORANGE }} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 lg:p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <motion.div
                animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 1.8, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
                className="relative flex-shrink-0 w-[52px] h-[52px] rounded-xl flex items-center justify-center"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${ORANGE}30, ${ORANGE_DEEP}15)`
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isActive || isCompleted ? ORANGE + "55" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                <Icon
                  className="w-6 h-6"
                  style={{ color: isActive || isCompleted ? ORANGE : "#6B7280" }}
                />
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `${ORANGE}25` }}
                  />
                )}
              </motion.div>

              <div>
                <p
                  className="text-[10px] font-bold tracking-[0.22em] uppercase mb-1"
                  style={{ color: isActive || isCompleted ? ORANGE : "#6B7280" }}
                >
                  {step.subtitle}
                </p>
                <h3
                  className="text-[15px] font-bold leading-snug"
                  style={{ color: isActive ? "#FFFFFF" : isCompleted ? "#D1D5DB" : "#9CA3AF" }}
                >
                  {step.title}
                </h3>
              </div>
            </div>

            {/* Step number */}
            <span
              className="text-[48px] font-black leading-none select-none flex-shrink-0 tabular-nums"
              style={{
                color: isActive ? `${ORANGE}30` : "rgba(255,255,255,0.05)",
                textShadow: isActive ? `0 0 30px ${ORANGE}40` : "none",
              }}
            >
              {step.number}
            </span>
          </div>

          {/* Animated content on active */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{step.description}</p>

                {step.wallets && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {step.wallets.map((w: string, wi: number) => (
                      <motion.span
                        key={w}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: wi * 0.07 + 0.15 }}
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          color: ORANGE,
                          border: `1px solid ${ORANGE}40`,
                          background: `${ORANGE}12`,
                        }}
                      >
                        {w}
                      </motion.span>
                    ))}
                  </div>
                )}

                {step.bullets && (
                  <ul className="space-y-2 mb-4">
                    {step.bullets.map((b: string, bi: number) => (
                      <motion.li
                        key={bi}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: bi * 0.08 + 0.2 }}
                        className="flex items-start gap-2.5 text-sm text-gray-300"
                      >
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: bi * 0.08 + 0.2, type: "spring" }}
                          className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: ORANGE }}
                        />
                        {b}
                      </motion.li>
                    ))}
                  </ul>
                )}

                {step.note && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-xs text-gray-500 italic border-t pt-3"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    {step.note}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed preview when not active */}
          {!isActive && (
            <p className="text-xs text-gray-600 line-clamp-1 mt-1">{step.description}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────
export function HowItWorksSection() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" })
  const [activeStep, setActiveStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  // Auto-advance through steps
  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3400)
    return () => clearInterval(timer)
  }, [autoPlay])

  const handleStepClick = (i: number) => {
    setAutoPlay(false)
    setActiveStep(i)
  }

  const progressPct = ((activeStep + 1) / steps.length) * 100

  return (
    <section
      id="howitworks"
      className="relative py-28 md:py-36 overflow-hidden"
      style={{
        background: "#0D0D0D",
        fontFamily: "'Syne', 'DM Sans', sans-serif",
      }}
    >
      <ParticleField />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div ref={headingRef} className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
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
              Getting Started
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-5 leading-[1.04] tracking-tight"
          >
            How To Get Started
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${ORANGE_BRIGHT}, ${GOLD})`,
              }}
            >
              With Web3X
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Five clear steps to enter the decentralised ecosystem — own your keys, connect your wallet, and start exploring.
          </motion.p>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={headingInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-8 max-w-xs mx-auto"
          >
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${ORANGE}, ${GOLD})`,
                }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.55, ease: "easeInOut" }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Step {activeStep + 1} of {steps.length}
            </p>
          </motion.div>
        </div>

        {/* ── Two-column layout: timeline left + cards right ── */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Left: vertical stepper nav */}
          <div className="flex-shrink-0 lg:w-64">
            <div className="relative flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">

              {/* Vertical connector line (desktop) */}
              <div
                className="hidden lg:block absolute left-[19px] top-10 bottom-10 w-px"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <motion.div
                className="hidden lg:block absolute left-[19px] top-10 w-px origin-top"
                style={{ background: `linear-gradient(180deg, ${ORANGE}, ${GOLD})` }}
                animate={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.55, ease: "easeInOut" }}
              />

              {steps.map((step, i) => {
                const Icon = step.icon
                const done = i < activeStep
                const active = i === activeStep
                return (
                  <motion.button
                    key={step.number}
                    onClick={() => handleStepClick(i)}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex items-center gap-3 flex-shrink-0 lg:flex-shrink text-left"
                  >
                    {/* Circle node */}
                    <motion.div
                      animate={
                        active
                          ? {
                              scale: [1, 1.15, 1],
                              boxShadow: [
                                `0 0 0px ${ORANGE}00`,
                                `0 0 16px ${ORANGE}80`,
                                `0 0 0px ${ORANGE}00`,
                              ],
                            }
                          : { scale: 1 }
                      }
                      transition={active ? { duration: 1.8, repeat: Infinity } : {}}
                      className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-400"
                      style={{
                        background: active
                          ? `linear-gradient(135deg, ${ORANGE}, ${ORANGE_DEEP})`
                          : done
                          ? `${ORANGE}22`
                          : "rgba(255,255,255,0.04)",
                        borderColor: active || done ? ORANGE : "rgba(255,255,255,0.1)",
                      }}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4" style={{ color: ORANGE }} />
                      ) : (
                        <Icon
                          className="w-4 h-4"
                          style={{ color: active ? "#fff" : "#6B7280" }}
                        />
                      )}
                    </motion.div>

                    {/* Label (desktop only) */}
                    <div className="hidden lg:block">
                      <p
                        className="text-[11px] font-bold uppercase tracking-wider leading-none mb-0.5"
                        style={{ color: active || done ? ORANGE : "#4B5563" }}
                      >
                        Step {step.number}
                      </p>
                      <p
                        className="text-xs font-medium leading-snug"
                        style={{ color: active ? "#F3F4F6" : done ? "#9CA3AF" : "#4B5563" }}
                      >
                        {step.subtitle}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Auto-play toggle */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={() => setAutoPlay((v) => !v)}
              className="hidden lg:flex items-center gap-2 mt-8 text-xs font-semibold transition-colors"
              style={{ color: autoPlay ? ORANGE : "#4B5563" }}
            >
              <motion.span
                animate={autoPlay ? { rotate: 360 } : { rotate: 0 }}
                transition={autoPlay ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
                className="w-3.5 h-3.5 border-2 rounded-full border-current border-t-transparent inline-block"
              />
              {autoPlay ? "Auto-playing" : "Auto-play off"}
            </motion.button>
          </div>

          {/* Right: step cards */}
          <div className="flex-1 space-y-4">
            {steps.map((step, i) => (
              <StepCard
                key={step.number}
                step={step}
                index={i}
                isActive={i === activeStep}
                isCompleted={i < activeStep}
                onClick={() => handleStepClick(i)}
              />
            ))}
          </div>
        </div>

        {/* ── Important Reminder ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 relative rounded-2xl overflow-hidden"
          style={{
            border: `1px solid ${GOLD}35`,
            background: `linear-gradient(135deg, ${GOLD}0A, rgba(13,13,13,0.9))`,
          }}
        >
          {/* Shimmer */}
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
          />
          {/* Corner accent */}
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-20"
            style={{ background: GOLD }}
          />

          <div className="relative z-10 flex items-start gap-5 p-7 md:p-8">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mt-0.5"
              style={{
                background: `${GOLD}15`,
                border: `1px solid ${GOLD}35`,
              }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: GOLD }} />
            </motion.div>
            <div>
              <p
                className="text-xs font-black uppercase tracking-[0.2em] mb-2"
                style={{ color: GOLD }}
              >
                Important Reminder
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Always review transaction details carefully before confirming on-chain actions. Smart contract interactions are{" "}
                <span className="font-semibold text-white">irreversible</span> — verify every detail including network, token amount, and recipient address before proceeding.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}