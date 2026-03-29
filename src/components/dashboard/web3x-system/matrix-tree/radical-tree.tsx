/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getRadialTreeData } from "@/actions/matrix/radial-tree"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TreeNode {
  id: string
  chainId: number
  regId: number
  directSponsor: string
  nodeColor: 'blue' | 'green' | 'pink'
  wallet_address: string
  upline_address: string
  amount: string
  position: string
  userId: string
  packageNumber?: number
  label?: string
  children?: TreeNode[]
}

interface ApiResponse {
  matrixTrees: TreeNode[]
  downlineTrees: TreeNode[]
  metadata: {
    wallet_address: string
    chainId: number
    packageNumber: number
    matrixCount: number
    downlineCount: number
    yourRegId: number
  }
}

interface RadialMatrixTreeProps {
  walletAddress: string
}

interface TooltipData {
  regId: number
  wallet: string
  sponsor: string
  nodeColor: string
  amount: string
}

interface PackageSliderProps {
  selectedPackage: number
  totalPackages: number
  onSelect: (pkg: number) => void
  disabled?: boolean
}

// ─── SVG canvas constants (viewBox units) ────────────────────────────────────
//
//  THE FIX: The entire canvas is one <svg viewBox="0 0 580 580"> element with
//  width="100%" height="auto". The browser scales every coordinate and radius
//  proportionally so it always fills its container — on a 320px phone, on a
//  1440px desktop, at any orientation, on first paint, with zero JS, zero
//  ResizeObserver, zero flash. No window.innerWidth, no useState, no hooks.

const VB = 580
const CX = VB / 2
const CY = VB / 2
const R1 = VB * 0.205   // inner ring (~119)
const R2 = VB * 0.375   // outer ring (~217)
const CENTER_R = 44
const L1_R = 29
const L2_R = 22

const posOnCircle = (idx: number, total: number, r: number, offset = -90) => {
  const rad = ((360 / total) * idx + offset) * Math.PI / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

const L1_POS = Array.from({ length: 3 }, (_, i) => posOnCircle(i, 3, R1))
const L2_POS = Array.from({ length: 9 }, (_, i) => posOnCircle(i, 9, R2))

// ─── SVG Defs (gradients + filters) ──────────────────────────────────────────

const SVGDefs: React.FC = () => (
  <defs>
    <radialGradient id="grad-center" cx="38%" cy="32%" r="70%">
      <stop offset="0%" stopColor="#fde68a" />
      <stop offset="50%" stopColor="#f59e0b" />
      <stop offset="100%" stopColor="#92400e" />
    </radialGradient>
    <radialGradient id="grad-blue" cx="38%" cy="32%" r="70%">
      <stop offset="0%" stopColor="#7dd3fc" />
      <stop offset="50%" stopColor="#0ea5e9" />
      <stop offset="100%" stopColor="#075985" />
    </radialGradient>
    <radialGradient id="grad-green" cx="38%" cy="32%" r="70%">
      <stop offset="0%" stopColor="#86efac" />
      <stop offset="50%" stopColor="#22c55e" />
      <stop offset="100%" stopColor="#14532d" />
    </radialGradient>
    <radialGradient id="grad-pink" cx="38%" cy="32%" r="70%">
      <stop offset="0%" stopColor="#f9a8d4" />
      <stop offset="50%" stopColor="#ec4899" />
      <stop offset="100%" stopColor="#831843" />
    </radialGradient>
    <radialGradient id="grad-empty" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stopColor="#1e293b" />
      <stop offset="100%" stopColor="#0f172a" />
    </radialGradient>
    <radialGradient id="gloss" cx="40%" cy="20%" r="60%">
      <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
    </radialGradient>
    <filter id="glow-center" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="glow-node" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="glow-ambient" x="-150%" y="-150%" width="400%" height="400%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="32" />
    </filter>
  </defs>
)

// ─── SVG Node ────────────────────────────────────────────────────────────────

interface SVGNodeProps {
  x: number
  y: number
  r: number
  label?: string | number
  isEmpty?: boolean
  isCenter?: boolean
  nodeColor?: 'blue' | 'green' | 'pink'
  animDelay?: number
  onClick?: () => void
}

const SVGNode: React.FC<SVGNodeProps> = ({
  x, y, r, label = '', isEmpty = false, isCenter = false,
  nodeColor, animDelay = 0, onClick,
}) => {
  const gradId = isCenter ? 'grad-center'
    : isEmpty ? 'grad-empty'
    : `grad-${nodeColor ?? 'blue'}`

  const stroke = isCenter ? 'rgba(253,230,138,0.6)'
    : isEmpty ? 'rgba(51,65,85,0.5)'
    : nodeColor === 'blue' ? 'rgba(125,211,252,0.55)'
    : nodeColor === 'green' ? 'rgba(134,239,172,0.55)'
    : 'rgba(249,168,212,0.55)'

  const pulseColor = nodeColor === 'blue' ? 'rgba(14,165,233,0.3)'
    : nodeColor === 'green' ? 'rgba(34,197,94,0.3)'
    : 'rgba(236,72,153,0.3)'

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: animDelay, type: 'spring', stiffness: 200, damping: 20 }}
      style={{ transformOrigin: `${x}px ${y}px`, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.1 } : undefined}
    >
      {/* Pulse ring for filled non-center */}
      {!isEmpty && !isCenter && (
        <motion.circle cx={x} cy={y} r={r + 5}
          fill="none" stroke={pulseColor} strokeWidth="1"
          animate={{ r: [r + 4, r + 9, r + 4], opacity: [0.6, 0.1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: animDelay + 0.8 }}
        />
      )}

      {/* Center halo */}
      {isCenter && <circle cx={x} cy={y} r={r + 10} fill="rgba(245,158,11,0.07)" />}

      {/* Main fill */}
      <circle
        cx={x} cy={y} r={r}
        fill={`url(#${gradId})`}
        stroke={stroke} strokeWidth={isCenter ? 1.5 : 1}
        filter={isCenter ? 'url(#glow-center)' : (!isEmpty ? 'url(#glow-node)' : 'none')}
      />

      {/* Gloss */}
      {!isEmpty && <circle cx={x} cy={y} r={r} fill="url(#gloss)" />}

      {/* Label */}
      {!isEmpty && (
        <text
          x={x} y={y}
          textAnchor="middle" dominantBaseline="central"
          fill="#fff"
          fontSize={isCenter ? r * 0.55 : r * 0.62}
          fontFamily="'DM Mono','Courier New',monospace"
          fontWeight="600"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {label}
        </text>
      )}
    </motion.g>
  )
}

// ─── Orbital SVG Canvas ───────────────────────────────────────────────────────

interface OrbitalCanvasProps {
  walletAddress: string
  level1Nodes: TreeNode[]
  level2Nodes: { parentIndex: number; node: TreeNode | null; slotIndex: number }[]
  onNodeClick: (data: TooltipData) => void
  animKey: string
}

const OrbitalCanvas: React.FC<OrbitalCanvasProps> = ({
  walletAddress, level1Nodes, level2Nodes, onNodeClick, animKey,
}) => (
  <motion.div
    key={animKey}
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.96 }}
    transition={{ duration: 0.35 }}
    style={{ width: '100%', maxWidth: 580, margin: '0 auto' }}
  >
    {/*
      viewBox makes all coordinates relative to a 580×580 space.
      width="100%" + height="auto" (default) = scales to fit container.
      Works at 320px or 1440px with identical proportions, zero JS.
    */}
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      style={{ display: 'block', width: '100%', height: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <SVGDefs />

      {/* Ambient center glow */}
      <circle cx={CX} cy={CY} r={80} fill="rgba(245,158,11,0.18)" filter="url(#glow-ambient)" />

      {/* Inner orbital ring */}
      <circle cx={CX} cy={CY} r={R1} fill="none" stroke="rgba(245,158,11,0.06)" strokeWidth="10" />
<motion.circle
  cx={CX}
  cy={CY}
  r={R1}
  fill="none"
  stroke="rgba(245,158,11,0.18)"
  strokeWidth="1"
  strokeDasharray="5 10"
  animate={{ rotate: 360 }}
  transition={{
    repeat: Infinity,
    duration: 20,
    ease: "linear"
  }}
  style={{
    transformOrigin: `${CX}px ${CY}px`
  }}
/>      {/* <circle cx={CX} cy={CY} r={R1} fill="none" stroke="rgba(245,158,11,0.45)" strokeWidth="1.5" strokeDasharray="30 1000" strokeDashoffset="-60" /> */}

      {/* Outer orbital ring */}
      <circle cx={CX} cy={CY} r={R2} fill="none" stroke="rgba(245,158,11,0.04)" strokeWidth="10" />
<motion.circle
  cx={CX}
  cy={CY}
  r={R2}
  fill="none"
  stroke="rgba(245,158,11,0.14)"
  strokeWidth="1"
  strokeDasharray="5 10"
  animate={{ rotate: -360 }}
  transition={{
    repeat: Infinity,
    duration: 35,
    ease: "linear"
  }}
  style={{
    transformOrigin: `${CX}px ${CY}px`
  }}
/>      {/* <circle cx={CX} cy={CY} r={R2} fill="none" stroke="rgba(245,158,11,0.38)" strokeWidth="1.5" strokeDasharray="30 1000" strokeDashoffset="-80" /> */}

      {/* Center → L1 connectors */}
      {L1_POS.map((pos, i) => (
        <line key={`c-l1-${i}`}
          x1={CX} y1={CY} x2={pos.x} y2={pos.y}
          stroke="rgba(251,191,36,0.18)" strokeWidth="1" strokeDasharray="4 7"
        />
      ))}

      {/* L1 → L2 connectors */}
      {level2Nodes.map((slot, i) => {
        const p = L1_POS[slot.parentIndex]
        const c = L2_POS[i]
        if (!p || !c) return null
        return (
          <line key={`l1-l2-${i}`}
            x1={p.x} y1={p.y} x2={c.x} y2={c.y}
            // stroke="rgba(100,116,139,0.15)" strokeWidth="4" strokeDasharray="3 2"
          />
        )
      })}

      {/* L2 nodes */}
      {Array.from({ length: 9 }).map((_, i) => {
        const slot = level2Nodes[i]
        const node = slot?.node
        const pos = L2_POS[i]
        return (
          <SVGNode key={`l2-${i}`}
            x={pos.x} y={pos.y} r={L2_R}
            label={node?.regId}
            isEmpty={!node}
            nodeColor={node?.nodeColor}
            animDelay={0.5 + i * 0.045}
            onClick={node ? () => onNodeClick({
              regId: node.regId, wallet: node.wallet_address,
              sponsor: node.directSponsor, nodeColor: node.nodeColor, amount: node.amount,
            }) : undefined}
          />
        )
      })}

      {/* L1 nodes */}
      {Array.from({ length: 3 }).map((_, i) => {
        const node = level1Nodes[i]
        const pos = L1_POS[i]
        return (
          <SVGNode key={`l1-${i}`}
            x={pos.x} y={pos.y} r={L1_R}
            label={node?.regId}
            isEmpty={!node}
            nodeColor={node?.nodeColor}
            animDelay={0.3 + i * 0.1}
            onClick={node ? () => onNodeClick({
              regId: node.regId, wallet: node.wallet_address,
              sponsor: node.directSponsor, nodeColor: node.nodeColor, amount: node.amount,
            }) : undefined}
          />
        )
      })}

      {/* Center node */}
      <SVGNode x={CX} y={CY} r={CENTER_R} label="YOU" isCenter animDelay={0} />

      {/* Wallet label */}
      {walletAddress && (
        <motion.text
          x={CX} y={CY + CENTER_R + 16}
          textAnchor="middle"
          fill="rgba(100,116,139,0.55)"
          fontSize={10}
          fontFamily="'DM Mono',monospace"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {`${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`}
        </motion.text>
      )}
    </svg>
  </motion.div>
)

// ─── Premium Package Slider ───────────────────────────────────────────────────

const PackageSlider: React.FC<PackageSliderProps> = ({
  selectedPackage, totalPackages, onSelect, disabled = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const packages = Array.from({ length: totalPackages }, (_, i) => i + 1)

  const scrollToPackage = useCallback((pkg: number) => {
    const el = scrollRef.current
    if (!el) return
    const target = el.querySelector(`[data-pkg="${pkg}"]`) as HTMLElement
    if (target) el.scrollTo({ left: target.offsetLeft - el.offsetWidth / 2 + target.offsetWidth / 2, behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToPackage(selectedPackage) }, [selectedPackage, scrollToPackage])

  const step = (dir: 1 | -1) => { if (!disabled) onSelect(Math.max(1, Math.min(totalPackages, selectedPackage + dir))) }
  const canPrev = selectedPackage > 1
  const canNext = selectedPackage < totalPackages

  const arrowBase: React.CSSProperties = {
    width: 36, height: 36, flexShrink: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, border: 'none', position: 'relative',
    transition: 'all 0.2s',
  }

  return (
    <div className="w-full max-w-lg mx-auto mb-8 select-none">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-amber-500/40" />
        <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-amber-500/70 px-1">Package Level</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/20 to-amber-500/40" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* ← arrow */}
        <motion.button
          onClick={() => step(-1)}
          disabled={disabled || !canPrev}
          whileTap={canPrev && !disabled ? { scale: 0.88 } : {}}
          aria-label="Previous package"
          style={{
            ...arrowBase,
            cursor: canPrev && !disabled ? 'pointer' : 'not-allowed',
            opacity: canPrev && !disabled ? 1 : 0.3,
            background: canPrev && !disabled
              ? 'linear-gradient(135deg,rgba(251,191,36,0.14),rgba(234,88,12,0.10))'
              : 'rgba(15,23,42,0.5)',
            boxShadow: canPrev && !disabled ? '1px solid rgba(251,191,36,0.30)' : '1px solid rgba(51,65,85,0.35)',
          }}
        >
          <ChevronLeft style={{ width: 16, height: 16, color: canPrev && !disabled ? '#fbbf24' : 'rgba(71,85,105,0.6)' }} />
        </motion.button>

        {/* Track */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 36, background: 'linear-gradient(to right,#050810,transparent)', zIndex: 10, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 36, background: 'linear-gradient(to left,#050810,transparent)', zIndex: 10, pointerEvents: 'none' }} />
          <div ref={scrollRef} style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', padding: '8px 24px', scrollbarWidth: 'none' }}>
            {packages.map((pkg) => {
              const isSelected = pkg === selectedPackage
              const isAdjacent = Math.abs(pkg - selectedPackage) === 1
              return (
                <motion.button
                  key={pkg}
                  data-pkg={pkg}
                  onClick={() => !disabled && onSelect(pkg)}
                  disabled={disabled}
                  whileTap={{ scale: 0.9 }}
                  style={{ flexShrink: 0, width: 52, height: 68, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative', border: 'none', background: 'none', padding: 0, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="pkg-sel"
                      style={{ position: 'absolute', inset: 0, borderRadius: 16, background: 'linear-gradient(160deg,rgba(251,191,36,0.16),rgba(234,88,12,0.10))', border: '1px solid rgba(251,191,36,0.38)', boxShadow: '0 0 20px rgba(251,191,36,0.12)' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <motion.span
                    animate={{ color: isSelected ? '#fbbf24' : isAdjacent ? 'rgba(148,163,184,0.6)' : 'rgba(71,85,105,0.4)' }}
                    style={{ position: 'relative', zIndex: 1, fontSize: isSelected ? 22 : 17, fontFamily: "'DM Mono',monospace", fontWeight: 300, textShadow: isSelected ? '0 0 16px rgba(251,191,36,0.5)' : 'none', lineHeight: 1 }}
                  >
                    {pkg}
                  </motion.span>
                  <motion.div
                    animate={{ scale: isSelected ? 1 : 0, opacity: isSelected ? 1 : 0 }}
                    style={{ position: 'relative', zIndex: 1, width: 4, height: 4, borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px rgba(251,191,36,0.9)' }}
                  />
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* → arrow */}
        <motion.button
          onClick={() => step(1)}
          disabled={disabled || !canNext}
          whileTap={canNext && !disabled ? { scale: 0.88 } : {}}
          aria-label="Next package"
          style={{
            ...arrowBase,
            cursor: canNext && !disabled ? 'pointer' : 'not-allowed',
            opacity: canNext && !disabled ? 1 : 0.3,
            background: canNext && !disabled
              ? 'linear-gradient(135deg,rgba(251,191,36,0.14),rgba(234,88,12,0.10))'
              : 'rgba(15,23,42,0.5)',
            boxShadow: canNext && !disabled ? '1px solid rgba(251,191,36,0.30)' : '1px solid rgba(51,65,85,0.35)',
          }}
        >
          <ChevronRight style={{ width: 16, height: 16, color: canNext && !disabled ? '#fbbf24' : 'rgba(71,85,105,0.6)' }} />
        </motion.button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <motion.div
          key={selectedPackage}
          initial={{ opacity: 0, y: 4, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 12px', borderRadius: 999, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.16)' }}
        >
          <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,158,11,0.55)' }}>Selected</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24', fontFamily: "'DM Mono',monospace" }}>Pkg {selectedPackage}</span>
          <span style={{ fontSize: 9, color: 'rgba(71,85,105,0.7)' }}>of {totalPackages}</span>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Color Legend ─────────────────────────────────────────────────────────────

const ColorLegend: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
    className="flex items-center justify-center gap-5 sm:gap-8 mb-6 flex-wrap"
  >
    {[
      { color: '#0ea5e9', glow: 'rgba(14,165,233,0.5)', label: 'Direct Referral', desc: 'You are the sponsor' },
      { color: '#22c55e', glow: 'rgba(34,197,94,0.5)', label: 'Spill from Below', desc: 'Sponsor joined after you' },
      { color: '#ec4899', glow: 'rgba(236,72,153,0.5)', label: 'Spill from Above', desc: 'Sponsor joined before you' },
    ].map(({ color, glow, label, desc }) => (
      <div key={label} className="flex items-center gap-2.5">
        <div className="relative flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${glow}` }} />
          <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: color }} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[11px] font-semibold text-white/90 tracking-wide">{label}</span>
          <span className="text-[10px] text-slate-500">{desc}</span>
        </div>
      </div>
    ))}
  </motion.div>
)

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar: React.FC<{ metadata?: ApiResponse['metadata'] }> = ({ metadata }) => {
  if (!metadata) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
      className="flex items-center justify-center gap-4 mb-5 flex-wrap"
    >
      {[
        { label: 'Direct', value: metadata.matrixCount },
        { label: 'Downline', value: metadata.downlineCount },
        { label: 'Your ID', value: `#${metadata.yourRegId}` },
      ].map(({ label, value }) => (
        <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(51,65,85,0.6)', backdropFilter: 'blur(8px)' }}>
          <span className="text-[10px] text-slate-500 tracking-widest uppercase">{label}</span>
          <span className="text-xs font-semibold text-amber-400" style={{ fontFamily: "'DM Mono',monospace" }}>{value}</span>
        </div>
      ))}
    </motion.div>
  )
}

// ─── Node Tooltip ─────────────────────────────────────────────────────────────

const NodeTooltip: React.FC<{ data: TooltipData; onClose: () => void }> = ({ data, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.92, y: 8 }} transition={{ duration: 0.2 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}
  >
    <div
      className="relative rounded-2xl p-5 max-w-xs w-full"
      style={{ background: 'linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.98))', border: '1px solid rgba(51,65,85,0.8)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{
            background: data.nodeColor === 'blue' ? '#0ea5e9' : data.nodeColor === 'green' ? '#22c55e' : '#ec4899',
            boxShadow: `0 0 8px ${data.nodeColor === 'blue' ? 'rgba(14,165,233,0.7)' : data.nodeColor === 'green' ? 'rgba(34,197,94,0.7)' : 'rgba(236,72,153,0.7)'}`,
          }} />
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">Node Info</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-lg leading-none">×</button>
      </div>
      {[
        { label: 'Reg ID', value: `#${data.regId}` },
        { label: 'Wallet', value: `${data.wallet.slice(0, 8)}…${data.wallet.slice(-6)}` },
        { label: 'Sponsor', value: `${data.sponsor.slice(0, 8)}…${data.sponsor.slice(-6)}` },
        { label: 'Amount', value: `${parseFloat(data.amount).toFixed(4)} ETH` },
      ].map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
          <span className="text-[11px] text-slate-500 tracking-wide">{label}</span>
          <span className="text-[11px] font-medium text-white/90" style={{ fontFamily: "'DM Mono',monospace" }}>{value}</span>
        </div>
      ))}
    </div>
  </motion.div>
)

// ─── Main Component ───────────────────────────────────────────────────────────

export const RadialMatrixTree: React.FC<RadialMatrixTreeProps> = ({ walletAddress }) => {
  const [selectedPackage, setSelectedPackage] = useState(1)
  const [selectedChain, setSelectedChain] = useState("1")
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)

  const fetchMatrixData = async (wallet: string, chainId: string, pkg: number) => {
    setLoading(true); setError(null)
    try {
      const result = await getRadialTreeData(wallet, pkg, parseInt(chainId))
      if (!result.success) throw new Error(result.error)
      setApiData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      setApiData(null)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (walletAddress) fetchMatrixData(walletAddress, selectedChain, selectedPackage)
  }, [walletAddress, selectedChain, selectedPackage])

  const { level1Nodes, level2Nodes } = useMemo(() => {
    if (!apiData) return { level1Nodes: [] as TreeNode[], level2Nodes: [] as { parentIndex: number; node: TreeNode | null; slotIndex: number }[] }
    const posOrder: Record<string, number> = { left: 0, middle: 1, right: 2 }
    const sorted = [...apiData.matrixTrees].sort((a, b) => (posOrder[a.position] ?? 99) - (posOrder[b.position] ?? 99))
    const byUpline: Record<string, TreeNode[]> = {}
    apiData.downlineTrees.forEach(d => { if (!byUpline[d.upline_address]) byUpline[d.upline_address] = []; byUpline[d.upline_address].push(d) })
    const level2: { parentIndex: number; node: TreeNode | null; slotIndex: number }[] = []
    sorted.forEach((parent, pi) => { const ch = byUpline[parent.wallet_address] || []; for (let i = 0; i < 3; i++) level2.push({ parentIndex: pi, node: ch[i] || null, slotIndex: pi * 3 + i }) })
    for (let i = sorted.length; i < 3; i++) for (let j = 0; j < 3; j++) level2.push({ parentIndex: i, node: null, slotIndex: i * 3 + j })
    return { level1Nodes: sorted, level2Nodes: level2 }
  }, [apiData])

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');`}</style>

      <div className="w-full min-h-screen text-white p-3 sm:p-5" style={{ background: 'radial-gradient(ellipse 120% 80% at 50% -10%,rgba(120,80,20,0.12) 0%,transparent 60%),linear-gradient(180deg,#050810 0%,#080e1a 50%,#050810 100%)', fontFamily: "'Syne',sans-serif" }}>
        <div className="max-w-3xl mx-auto">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5 text-slate-400 hover:text-amber-400 rounded-xl text-xs">
              <ChevronLeft className="h-3.5 w-3.5" />Back
            </Button>
            <div className="flex flex-col items-center">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight" style={{ background: 'linear-gradient(90deg,#fbbf24 0%,#f97316 50%,#fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Matrix Tree
              </h1>
              <span className="text-[9px] tracking-[0.25em] uppercase text-slate-600 mt-0.5">Orbital View</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.6)', backdropFilter: 'blur(8px)' }}>
              <span className="text-[9px] tracking-widest uppercase text-slate-500">Cycle</span>
              <Select value={selectedChain} onValueChange={setSelectedChain} disabled={loading}>
                <SelectTrigger className="w-[80px] h-6 bg-transparent border-0 text-[11px] text-amber-400 p-0 focus:ring-0"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {[1, 2, 3].map(n => <SelectItem key={n} value={String(n)} className="text-xs text-slate-300 focus:bg-slate-800">Recycle {n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <PackageSlider selectedPackage={selectedPackage} totalPackages={12} onSelect={setSelectedPackage} disabled={loading} />
          <StatsBar metadata={apiData?.metadata} />
          <ColorLegend />

          {error && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-sm rounded-2xl p-4 mb-6 text-center" style={{ background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <p className="text-red-400 text-sm font-medium">Error loading data</p>
              <p className="text-red-400/60 text-xs mt-1">{error}</p>
            </motion.div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="relative">
                <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
                <div className="absolute inset-0 blur-md bg-amber-400/30 rounded-full animate-pulse" />
              </div>
              <p className="text-slate-500 text-xs tracking-widest uppercase">Loading matrix</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!loading && !error && (
              <OrbitalCanvas
                key={`${selectedPackage}-${selectedChain}`}
                animKey={`${selectedPackage}-${selectedChain}`}
                walletAddress={walletAddress}
                level1Nodes={level1Nodes}
                level2Nodes={level2Nodes}
                onNodeClick={setTooltip}
              />
            )}
          </AnimatePresence>

          {!loading && !error && level1Nodes.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
              <div className="text-3xl mb-3 opacity-30">◎</div>
              <p className="text-slate-600 text-sm">No nodes for Package {selectedPackage} · Recycle {selectedChain}</p>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {tooltip && <NodeTooltip data={tooltip} onClose={() => setTooltip(null)} />}
      </AnimatePresence>
    </>
  )
}

export default RadialMatrixTree