'use client';

import Image from "next/image"
import { Clock, Copy, Check, Users, Network, Coins, Package } from "lucide-react"
import { useHorseTokenBalance } from "@/hooks/useHorseTokenBalance"
import { useActiveAccount } from "thirdweb/react"
import { useState, useEffect } from "react"
import { getUserTeamStats } from "@/actions/user/index"
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────
interface TeamStats {
    directTeam: number;
    totalTema: number;
}

// ── Component ────────────────────────────────────────────────────────────────
export function SectionCards() {
    const { balance, loading } = useHorseTokenBalance();
    const activeAccount = useActiveAccount();
    const [copied, setCopied] = useState(false);
    const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
    const [teamLoading, setTeamLoading] = useState(false);

    const referralLink = activeAccount?.address
        ? `https://web3x.space/registration?rr=${activeAccount.address}`
        : "https://web3x.space/registration";

    // Fetch team stats whenever the connected wallet changes
    useEffect(() => {
        if (!activeAccount?.address) {
            setTeamStats(null);
            return;
        }

        const fetchStats = async () => {
            setTeamLoading(true);
            try {
                const stats = await getUserTeamStats(activeAccount.address);
                setTeamStats(stats);
            } catch (err) {
                console.error("Failed to load team stats:", err);
                setTeamStats(null);
            } finally {
                setTeamLoading(false);
            }
        };

        fetchStats();
    }, [activeAccount?.address]);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Link copied to clipboard!");
    };

    // ── Helpers ──────────────────────────────────────────────────────────────
    const StatValue = ({ value, loading }: { value: number | undefined; loading: boolean }) => {
        if (loading) return (
            <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-pulse" />
                <span className="font-mono text-[10px] text-white/25">Loading…</span>
            </div>
        );
        return (
            <span className="font-bold text-[1.25rem] leading-none text-white/80" style={{ fontFamily: 'Syne, sans-serif' }}>
                {value ?? 0}
            </span>
        );
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-4 xl:px-6">

            {/* ── Active M&N Plan ── */}
            <div
                className="relative overflow-hidden rounded-[20px] p-[22px] flex flex-col gap-4 min-h-[230px] border transition-all duration-300 hover:-translate-y-1"
                style={{
                    background: 'linear-gradient(145deg, #0d0b1a 0%, #120f22 100%)',
                    borderColor: 'rgba(124,80,255,0.22)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(124,80,255,0.5)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6), 0 0 60px rgba(124,80,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(124,80,255,0.22)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)';
                }}
            >
                {/* Radial glow */}
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(124,80,255,0.18) 0%, transparent 70%)' }} />

                {/* Shimmer */}
                <div className="absolute top-0 h-px w-[55%] pointer-events-none animate-[shimmer_5s_ease-in-out_infinite]"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-[10px] p-2 flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(124,80,255,0.15)', border: '1px solid rgba(124,80,255,0.3)' }}>
                            <Package size={16} color="rgba(160,120,255,0.9)" />
                        </div>
                        <div>
                            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-white/30">Active Plan</p>
                            <p className="font-bold text-[15px] text-white/[0.82] m-0" style={{ fontFamily: 'Syne, sans-serif' }}>M&amp;N Package</p>
                        </div>
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.06em] bg-white/[0.04] text-white/30 rounded-full px-[10px] py-[3px] inline-flex items-center gap-1 whitespace-nowrap"
                        style={{ border: '1px dashed rgba(255,255,255,0.14)' }}>
                        <Clock size={10} />
                        Coming Soon
                    </div>
                </div>

                {/* Empty state */}
                <div className="relative z-10">
                    <div className="font-mono text-[2.6rem] leading-none tracking-tight text-white/[0.13]">—</div>
                    <p className="font-mono text-[11px] text-white/25 mt-1">No active package</p>
                </div>

                {/* Team stats */}
                <div className="relative z-10 flex gap-[10px]">
                    {/* Direct Team */}
                    <div className="flex-1 rounded-xl px-[14px] py-[10px]"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center gap-[5px] mb-[6px]">
                            <Users size={11} color="rgba(160,120,255,0.65)" />
                            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-white/30">Direct Team</span>
                        </div>
                        <StatValue value={teamStats?.directTeam} loading={teamLoading} />
                    </div>

                    {/* Vertical divider */}
                    <div className="w-px self-stretch shrink-0"
                        style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)' }} />

                    {/* Total Team */}
                    <div className="flex-1 rounded-xl px-[14px] py-[10px]"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center gap-[5px] mb-[6px]">
                            <Network size={11} color="rgba(160,120,255,0.65)" />
                            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-white/30">Total Team</span>
                        </div>
                        <StatValue value={teamStats?.totalTema} loading={teamLoading} />
                    </div>
                </div>

                {/* Referral link */}
                <div className="relative z-10 rounded-xl px-3 py-[9px] flex items-center gap-2"
                    style={{ background: 'rgba(124,80,255,0.07)', border: '1px solid rgba(124,80,255,0.18)' }}>
                    <span
                                                onClick={handleCopy}

                        className="font-mono text-[15px] overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0 transition-colors duration-200 no-underline"
                        style={{ color: 'rgba(160,120,255,0.75)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(190,160,255,1)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(160,120,255,0.75)')}
                    >
                        Copy Referral Link
                    </span>
                    <button
                        onClick={handleCopy}
                        title="Copy referral link"
                        className="shrink-0 flex items-center justify-center rounded-[7px] px-[7px] py-[5px] transition-all duration-200 cursor-pointer"
                        style={{ background: 'rgba(124,80,255,0.15)', border: '1px solid rgba(124,80,255,0.3)' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(124,80,255,0.28)';
                            e.currentTarget.style.borderColor = 'rgba(124,80,255,0.5)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(124,80,255,0.15)';
                            e.currentTarget.style.borderColor = 'rgba(124,80,255,0.3)';
                        }}
                    >
                        {copied
                            ? <Check size={12} color="#10b981" />
                            : <Copy size={12} color="rgba(160,120,255,0.85)" />
                        }
                    </button>
                </div>
            </div>

            {/* ── Active Highest Level NFT ── */}
            <div
                className="relative overflow-hidden rounded-[20px] p-[22px] flex flex-col gap-4 min-h-[230px] border transition-all duration-300 hover:-translate-y-1"
                style={{
                    background: 'linear-gradient(145deg, #0d0b18 0%, #180b1f 100%)',
                    borderColor: 'rgba(236,72,153,0.2)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(236,72,153,0.5)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6), 0 0 60px rgba(236,72,153,0.1), inset 0 1px 0 rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(236,72,153,0.2)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)';
                }}
            >
                {/* Radial glow */}
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(236,72,153,0.15) 0%, transparent 70%)' }} />

                {/* Shimmer */}
                <div className="absolute top-0 h-px w-[55%] pointer-events-none animate-[shimmer_5s_ease-in-out_1.6s_infinite]"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />

                {/* BG art */}
                <div className="absolute right-3 top-[12%] opacity-10 pointer-events-none z-0">
                    <Image src="/just-creator.png" alt="" height={170} width={170} className="object-cover" />
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-[10px] p-2 flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(236,100,168,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-white/30">Highest Level</p>
                            <p className="font-bold text-[15px] text-white/[0.82] m-0" style={{ fontFamily: 'Syne, sans-serif' }}>Royalty NFT</p>
                        </div>
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.06em] bg-white/[0.04] text-white/30 rounded-full px-[10px] py-[3px] inline-flex items-center gap-1 whitespace-nowrap"
                        style={{ border: '1px dashed rgba(255,255,255,0.14)' }}>
                        <Clock size={10} />
                        Coming Soon
                    </div>
                </div>

                {/* Empty state */}
                <div className="relative z-10 flex-1">
                    <div className="font-mono text-[2.6rem] leading-none tracking-tight text-white/[0.13]">—</div>
                    <p className="font-mono text-[11px] text-white/25 mt-1 flex items-center gap-[5px]">
                        No NFT active
                        <span className="font-mono text-[10px] text-white/20">(wallet empty)</span>
                    </p>
                </div>

                {/* Info box */}
                <div className="relative z-10 rounded-xl px-[14px] py-[11px]"
                    style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.14)' }}>
                    <p className="text-[12px] text-white/40 leading-relaxed m-0" style={{ fontFamily: 'Syne, sans-serif' }}>
                        Royalty NFTs unlock passive income streams and will be available after the official launch.
                    </p>
                </div>
            </div>

            {/* ── Horse Token ── */}
         {/* ── Horse Token ── */}
            <div
                className="relative overflow-hidden rounded-[20px] p-[22px] flex flex-col gap-4 min-h-[230px] border transition-all duration-300 hover:-translate-y-1"
                style={{
                    background: 'linear-gradient(145deg, #120d04 0%, #1a1004 100%)',
                    borderColor: 'rgba(251,146,60,0.2)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(251,146,60,0.5)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6), 0 0 60px rgba(251,146,60,0.1), inset 0 1px 0 rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(251,146,60,0.2)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)';
                }}
            >
                {/* Radial glow — orange-yellow mix */}
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(251,146,60,0.18) 0%, rgba(234,179,8,0.08) 50%, transparent 70%)' }} />

                {/* Shimmer */}
                <div className="absolute top-0 h-px w-[55%] pointer-events-none animate-[shimmer_5s_ease-in-out_3.2s_infinite]"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.35), transparent)' }} />

                {/* BG art */}
                <div className="absolute right-[10px] top-[8%] opacity-[0.13] pointer-events-none z-0">
                    <Image src="/horse-token-img.png" alt="" height={175} width={175} className="object-cover" />
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-[10px] p-2 flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)' }}>
                            <Coins size={16} color="rgba(251,146,60,0.95)" />
                        </div>
                        <div>
                            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-white/30">Wallet Balance</p>
                            <p className="font-bold text-[15px] text-white/[0.82] m-0" style={{ fontFamily: 'Syne, sans-serif' }}>Horse Token</p>
                        </div>
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.06em] bg-white/[0.04] text-white/30 rounded-full px-[10px] py-[3px] inline-flex items-center gap-1 whitespace-nowrap"
                        style={{ border: '1px dashed rgba(255,255,255,0.14)' }}>
                        <Clock size={10} />
                        Coming Soon
                    </div>
                </div>

                {/* Balance */}
                <div className="relative z-10 flex-1">
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-[7px] h-[7px] rounded-full animate-pulse"
                                style={{ background: 'rgba(251,146,60,0.9)' }} />
                            <span className="font-mono text-[13px] text-white/[0.28]">Fetching balance…</span>
                        </div>
                    ) : (
                        <>
                            <div
                                className="font-mono text-[2.2rem] font-medium leading-none tracking-tight"
                                style={{ color: '#fb923c' }}
                            >
                                {balance}
                            </div>
                            <div className="font-mono text-[12px] mt-[3px]" style={{ color: 'rgba(251,146,60,0.45)' }}>HRS</div>
                        </>
                    )}
                </div>

                {/* Price / liquidity */}
                <div className="relative z-10 rounded-xl px-[14px] py-[11px]"
                    style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.14)' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-white/30">Token Price</p>
                            <p className="font-mono font-medium text-[16px] text-white/55 mt-[3px]">Soon Update</p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-white/30">Liquidity</p>
                            <p className="font-mono text-[12px] mt-[3px]" style={{ color: 'rgba(234,179,8,0.6)' }}>Post-launch</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}