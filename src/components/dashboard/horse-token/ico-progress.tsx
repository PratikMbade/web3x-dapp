/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import { icoContractInstance } from "@/contract/ico-contract/ico-contract"
import { TrendingUp, Zap, Activity } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"
import { useEffect, useState, useMemo } from "react"
import { formatUnits } from "ethers/lib/utils"

interface ICOProgressProps {
    data?: any
}

export default function ICOProgress({ data }: ICOProgressProps) {
    const activeAccount = useActiveAccount()
    const [icoPhases, setIcoPhases] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => { fetchIcoPhases() }, [activeAccount])

    const fetchIcoPhases = async () => {
        try {
            if (!activeAccount) { setIsLoading(false); return }
            setIsLoading(true)
            const icoContractInst = await icoContractInstance(activeAccount)
            const results = await Promise.all(
                Array.from({ length: 10 }, (_, i) => icoContractInst.HRSLiveIcoPriceDetails(i + 1))
            )
            setIcoPhases(results.map((res, i) => {
                const tokenAmt = Number(formatUnits(res.tokenAmt, 18))
                const tokenSold = Number(formatUnits(res.tokenSold, 18))
                const price = Number(formatUnits(res.price, 18))
                return { phase: i + 1, tokenAmt, tokenSold, price, soldPercent: tokenAmt > 0 ? (tokenSold / tokenAmt) * 100 : 0 }
            }))
            setIsLoading(false)
        } catch (err) {
            console.error("ICO Phase Fetch Error:", err)
            setIsLoading(false)
        }
    }

    const { overallProgress, currentPhase } = useMemo(() => {
        if (icoPhases.length === 0) return { overallProgress: 0, currentPhase: 1 }
        const overall = icoPhases.reduce((a, b) => a + b.soldPercent, 0) / icoPhases.length
        const active = icoPhases.find(p => p.soldPercent < 100)?.phase || 10
        return { overallProgress: overall, currentPhase: active }
    }, [icoPhases])

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

                .ico-prog-root {
                    font-family: 'Outfit', sans-serif;
                    position: relative;
                    background: linear-gradient(135deg, #0a0a0f 0%, #0c0c18 60%, #080810 100%);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 24px;
                    padding: 32px;
                    overflow: hidden;
                }

                .ico-prog-root::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 24px;
                    padding: 1px;
                    background: linear-gradient(135deg, rgba(255,200,60,0.25), rgba(255,120,0,0.1), transparent 55%);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                }

                .noise-bg {
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
                    pointer-events: none;
                    border-radius: 24px;
                }

                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    pointer-events: none;
                }

                /* Header */
                .prog-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 28px;
                    position: relative;
                    z-index: 1;
                }

                .prog-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #f0f0f8;
                    letter-spacing: -0.02em;
                    margin: 0 0 4px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .prog-subtitle {
                    font-size: 12px;
                    color: rgba(255,255,255,0.35);
                    margin: 0;
                }

                .title-icon-wrap {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: rgba(255,200,60,0.1);
                    border: 1px solid rgba(255,200,60,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .header-stats {
                    display: flex;
                    gap: 24px;
                    align-items: center;
                }

                .hstat {
                    text-align: right;
                }

                .hstat-label {
                    font-size: 10px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: rgba(255,255,255,0.3);
                    margin-bottom: 2px;
                }

                .hstat-value {
                    font-family: 'Space Mono', monospace;
                    font-size: 22px;
                    font-weight: 700;
                    color: #ffc83c;
                    line-height: 1;
                }

                .hstat-value-white {
                    color: #f0f0f8;
                }

                /* Overall progress bar */
                .overall-track {
                    position: relative;
                    width: 100%;
                    height: 8px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 100px;
                    overflow: hidden;
                    margin-bottom: 32px;
                    z-index: 1;
                }

                .overall-fill {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    background: linear-gradient(90deg, #ffc83c, #ff8c00);
                    border-radius: 100px;
                    transition: width 1.5s cubic-bezier(0.23, 1, 0.32, 1);
                    box-shadow: 0 0 12px rgba(255,200,60,0.5);
                }

                .overall-fill::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    width: 40px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
                    animation: shimmerSlide 2s ease-in-out infinite;
                }

                @keyframes shimmerSlide {
                    0% { opacity: 0; transform: translateX(-100%); }
                    50% { opacity: 1; }
                    100% { opacity: 0; transform: translateX(100%); }
                }

                /* Phase grid */
                .phase-grid {
                    display: grid;
                    grid-template-columns: repeat(10, 1fr);
                    gap: 8px;
                    position: relative;
                    z-index: 1;
                    margin-bottom: 28px;
                }

                @media (max-width: 640px) {
                    .phase-grid { grid-template-columns: repeat(5, 1fr); }
                }

                /* Individual phase bar */
                .phase-col { display: flex; flex-direction: column; align-items: center; gap: 6px; }

                .phase-bar-wrap {
                    position: relative;
                    width: 100%;
                    height: 100px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: border-color 0.3s ease, transform 0.2s ease;
                }

                .phase-bar-wrap:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255,200,60,0.25);
                }

                .phase-bar-wrap.active {
                    border-color: rgba(255,200,60,0.4);
                    box-shadow: 0 0 20px rgba(255,200,60,0.1), inset 0 0 20px rgba(255,200,60,0.03);
                }

                .phase-bar-wrap.complete {
                    border-color: rgba(74,222,128,0.2);
                }

                /* Water fill */
                .water-fill {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    transition: height 1.8s cubic-bezier(0.23, 1, 0.32, 1);
                    overflow: hidden;
                }

                .water-surface {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 300%;
                    height: 20px;
                    animation: waveMove 3s linear infinite;
                }

                .water-body {
                    position: absolute;
                    top: 10px;
                    left: 0;
                    right: 0;
                    bottom: 0;
                }

                @keyframes waveMove {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(33.33%); }
                }

                /* Active phase pulse ring */
                .active-pulse {
                    position: absolute;
                    inset: 0;
                    border-radius: 11px;
                    animation: pulseBorder 2s ease-in-out infinite;
                    pointer-events: none;
                }

                @keyframes pulseBorder {
                    0%, 100% { box-shadow: inset 0 0 0 1px rgba(255,200,60,0.3); }
                    50% { box-shadow: inset 0 0 0 2px rgba(255,200,60,0.6); }
                }

                /* Phase labels */
                .phase-number {
                    position: absolute;
                    top: 7px;
                    left: 0;
                    right: 0;
                    text-align: center;
                    font-family: 'Space Mono', monospace;
                    font-size: 10px;
                    font-weight: 700;
                    color: rgba(255,255,255,0.4);
                    z-index: 2;
                    transition: color 0.3s;
                }

                .phase-bar-wrap.active .phase-number { color: #ffc83c; }
                .phase-bar-wrap.complete .phase-number { color: #4ade80; }

                .phase-pct {
                    position: absolute;
                    bottom: 7px;
                    left: 0;
                    right: 0;
                    text-align: center;
                    font-family: 'Space Mono', monospace;
                    font-size: 15px;
                    font-weight: 700;
                    color: white;
                    z-index: 2;
                }

                .phase-price-label {
                    font-family: 'Space Mono', monospace;
                    font-size: 12px;
                    font-weight: 700;
                    color: white;
                    text-align: center;
                }

                .phase-bar-wrap.active .phase-price-label { color: rgba(255,200,60,0.7); }

                /* Bottom stats */
                .bottom-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    position: relative;
                    z-index: 1;
                }

                @media (max-width: 480px) {
                    .bottom-stats { grid-template-columns: repeat(2, 1fr); }
                }

                .bstat {
                    background: rgba(255,255,255,0.025);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px;
                    padding: 14px 16px;
                    transition: border-color 0.3s ease;
                }

                .bstat:hover { border-color: rgba(255,200,60,0.15); }

                .bstat-label {
                    font-size: 10px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: rgba(255,255,255,0.3);
                    margin-bottom: 6px;
                }

                .bstat-value {
                    font-family: 'Space Mono', monospace;
                    font-size: 18px;
                    font-weight: 700;
                    color: #f0f0f8;
                }

                .bstat-value.gold { color: #ffc83c; }
                .bstat-value.green { color: #4ade80; }

                /* Skeleton */
                .skel {
                    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%);
                    background-size: 200% 100%;
                    animation: skelShimmer 1.5s ease-in-out infinite;
                    border-radius: 8px;
                }

                @keyframes skelShimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                /* Live dot */
                .live-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #ffc83c;
                    display: inline-block;
                    animation: livePulse 1.5s ease-in-out infinite;
                    margin-right: 5px;
                }

                @keyframes livePulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.7); }
                }

                .live-badge {
                    display: inline-flex;
                    align-items: center;
                    font-family: 'Space Mono', monospace;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #ffc83c;
                    background: rgba(255,200,60,0.08);
                    border: 1px solid rgba(255,200,60,0.2);
                    border-radius: 100px;
                    padding: 3px 8px;
                }
            `}</style>

            <div className="ico-prog-root">
                <div className="noise-bg" />
                <div className="orb" style={{ width: 300, height: 300, background: 'rgba(255,200,60,0.04)', top: -100, right: -80 }} />
                <div className="orb" style={{ width: 200, height: 200, background: 'rgba(120,80,255,0.03)', bottom: -60, left: -40 }} />

                {/* Header */}
                <div className="prog-header">
                    <div>
                        <h2 className="prog-title">
                            <div className="title-icon-wrap">
                                <TrendingUp size={17} color="#ffc83c" />
                            </div>
                            ICO Phase Progress
                        </h2>
                        <p className="prog-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <span className="live-badge"><span className="live-dot" />Live on-chain</span>
                            Real-time phase tracking across 10 rounds
                        </p>
                    </div>

                    <div className="header-stats">
                        <div className="hstat">
                            <div className="hstat-label">Overall</div>
                            {isLoading
                                ? <div className="skel" style={{ width: 64, height: 28, marginTop: 2 }} />
                                : <div className="hstat-value">{overallProgress.toFixed(1)}%</div>
                            }
                        </div>
                        <div className="hstat">
                            <div className="hstat-label">Phase</div>
                            {isLoading
                                ? <div className="skel" style={{ width: 52, height: 28, marginTop: 2 }} />
                                : <div className="hstat-value hstat-value-white">{currentPhase}<span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/10</span></div>
                            }
                        </div>
                    </div>
                </div>

                {/* Overall bar */}
                <div className="overall-track">
                    {isLoading
                        ? <div className="skel" style={{ width: '100%', height: '100%', borderRadius: 100 }} />
                        : <div className="overall-fill" style={{ width: `${overallProgress}%` }} />
                    }
                </div>

                {/* Phase bars */}
                <div className="phase-grid">
                    {isLoading
                        ? Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="phase-col">
                                <div className="skel" style={{ width: '100%', height: 100, borderRadius: 12 }} />
                                <div className="skel" style={{ width: '70%', height: 10 }} />
                            </div>
                        ))
                        : icoPhases.map((phase) => {
                            const pct = phase.soldPercent;
                            const isActive = phase.phase === currentPhase;
                            const isComplete = pct >= 100;

                            // Color logic
                            const fillColor = isComplete
                                ? 'rgba(74,222,128,0.7)'
                                : isActive
                                    ? 'rgba(255,200,60,0.65)'
                                    : 'rgba(255,200,60,0.35)';

                            const waveColor = isComplete
                                ? 'rgba(74,222,128,0.5)'
                                : isActive
                                    ? 'rgba(255,180,30,0.5)'
                                    : 'rgba(255,200,60,0.3)';

                            const waveCrest = isComplete
                                ? 'rgba(74,222,128,0.8)'
                                : isActive
                                    ? 'rgba(255,220,80,0.9)'
                                    : 'rgba(255,200,60,0.6)';

                            return (
                                <div key={phase.phase} className="phase-col">
                                    <div className={`phase-bar-wrap ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}>

                                        {/* Water fill */}
                                        <div className="water-fill" style={{ height: `${pct}%` }}>
                                            {/* Animated wave surface */}
                                            <svg
                                                className="water-surface"
                                                viewBox="0 0 300 20"
                                                preserveAspectRatio="none"
                                                style={{ height: 12 }}
                                            >
                                                <path
                                                    d="M0,10 C25,0 50,20 75,10 C100,0 125,20 150,10 C175,0 200,20 225,10 C250,0 275,20 300,10 L300,20 L0,20 Z"
                                                    fill={waveCrest}
                                                />
                                            </svg>

                                            {/* Solid body */}
                                            <div className="water-body" style={{ background: fillColor }} />

                                            {/* Inner shimmer for active */}
                                            {isActive && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
                                                    pointerEvents: 'none',
                                                }} />
                                            )}
                                        </div>

                                        {/* Active pulse ring */}
                                        {isActive && <div className="active-pulse" />}

                                        {/* Labels */}
                                        <div className="phase-number">{phase.phase}</div>
                                        <div className="phase-pct">{pct.toFixed(0)}%</div>
                                    </div>

                                    <div className={`phase-price-label ${isActive ? 'active' : ''}`}>
                                        ${(phase.price * 2).toFixed(4)}
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>

                {/* Bottom stats */}
                <div className="bottom-stats">
                    <div className="bstat">
                        <div className="bstat-label">
                            <Activity size={10} style={{ display: 'inline', marginRight: 4 }} />
                            Current Price
                        </div>
                        {isLoading
                            ? <div className="skel" style={{ width: 80, height: 24, marginTop: 4 }} />
                            : <div className="bstat-value gold">${(icoPhases[currentPhase - 1]?.price * 2).toFixed(4)}</div>
                        }
                    </div>

                    <div className="bstat">
                        <div className="bstat-label">
                            <Zap size={10} style={{ display: 'inline', marginRight: 4 }} />
                            Next Phase Price
                        </div>
                        {isLoading
                            ? <div className="skel" style={{ width: 80, height: 24, marginTop: 4 }} />
                            : <div className="bstat-value">
                                {currentPhase < 10 ? `$${(icoPhases[currentPhase]?.price * 2).toFixed(4)}` : '—'}
                            </div>
                        }
                    </div>

                    <div className="bstat">
                        <div className="bstat-label">Phase Fill</div>
                        {isLoading
                            ? <div className="skel" style={{ width: 60, height: 24, marginTop: 4 }} />
                            : <div className="bstat-value green">
                                {icoPhases[currentPhase - 1]?.soldPercent.toFixed(1)}%
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}