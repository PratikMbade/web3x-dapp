/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Rocket, TrendingUp, User, Users, Wallet,
    AlertCircle, Loader2, DollarSign, ChevronRight, Zap, Shield, Star
} from "lucide-react"
import { useActiveAccount } from "thirdweb/react"
import { icoContractInstance } from "@/contract/ico-contract/ico-contract"
import { formatUnits, parseUnits } from "ethers/lib/utils"
import { toast } from "sonner"
import { ethers } from "ethers"
import { AirdropClaimCard } from "./claim-card"
import { useRouter } from "next/navigation"

export default function ActionCards() {
    const router = useRouter()
    const activeAccount = useActiveAccount()

    const [buyDialogOpen, setBuyDialogOpen] = useState(false)
    const [buyMode, setBuyMode] = useState<"self" | "others">("self")
    const [usdtAmount, setUsdtAmount] = useState<string>("10")
    const [recipientAddress, setRecipientAddress] = useState("")
    const [buyLimitData, setBuyLimitData] = useState<any>(null)
    const [isLoadingLimit, setIsLoadingLimit] = useState(false)
    const [icoPhase, setIcoPhase] = useState<number | null>(null)
    const [pricePerToken, setPricePerToken] = useState<number | null>(null)
    const [isLoadingPrice, setIsLoadingPrice] = useState(false)

    const minUSDT = 10
    const maxUSDT = 100000
    const usdtAmountNumber = parseFloat(usdtAmount) || 0
    const tokenAmount = pricePerToken ? usdtAmountNumber / pricePerToken : 0

    // ── Fetch phase + price ────────────────────────────────────────
    const fetchICOPhaseAndPrice = useCallback(async () => {
        try {
            if (!activeAccount) return
            setIsLoadingPrice(true)
            const ICOContractInst = await icoContractInstance(activeAccount)
            const phase = await ICOContractInst.IcoCurrentPhase()
            const phaseNumber = Number(phase)
            setIcoPhase(phaseNumber)
            const priceDetails = await ICOContractInst.HRSLiveIcoPriceDetails(phaseNumber)
            const priceInUSDT = Number(formatUnits(priceDetails.price, 18))
            setPricePerToken(priceInUSDT * 2)
        } catch (error) {
            console.error('Error fetching ICO phase and price:', error)
        } finally {
            setIsLoadingPrice(false)
        }
    }, [activeAccount])

    // ✅ Fetch on mount — card shows real data immediately, no mock values
    useEffect(() => {
        fetchICOPhaseAndPrice()
    }, [fetchICOPhaseAndPrice])

    // ✅ Re-fetch when dialog opens — always latest price
    useEffect(() => {
        if (buyDialogOpen) fetchICOPhaseAndPrice()
    }, [buyDialogOpen, fetchICOPhaseAndPrice])

    // ── Buy limit ──────────────────────────────────────────────────
    const checkICOBuyLimit = async (userAddress: string) => {
        try {
            if (!activeAccount) return null
            const ICOContractInst = await icoContractInstance(activeAccount)
            const raw = await ICOContractInst.getUserHRSBuyLimit(userAddress)
            return {
                maxLimitUSD: Number(formatUnits(raw.maxLimitUSD, 18)),
                maxLimitHorse: Number(raw.maxLimitHorse),
                purchasedUSD: Number(formatUnits(raw.purchasedUSD, 18)),
                availableUSD: Number(formatUnits(raw.availableUSD, 18)),
                availHorse: Number(formatUnits(raw.availHorse, 18)),
            }
        } catch (error) {
            console.error('checkICO buy error:', error)
            return null
        }
    }

    useEffect(() => {
        const fetchBuyLimit = async () => {
            if (!buyDialogOpen || !activeAccount) return
            setIsLoadingLimit(true)
            let targetAddress = ""
            if (buyMode === "self") targetAddress = activeAccount.address
            else if (buyMode === "others" && recipientAddress) targetAddress = recipientAddress
            if (targetAddress) {
                const limitData = await checkICOBuyLimit(targetAddress)
                setBuyLimitData(limitData)
            } else {
                setBuyLimitData(null)
            }
            setIsLoadingLimit(false)
        }
        fetchBuyLimit()
    }, [buyDialogOpen, buyMode, recipientAddress, activeAccount])

    // ── Buy handler ────────────────────────────────────────────────
    const handleBuyICOInSmartContract = async (amount: number, userAddress: string) => {
        try {
            if (!activeAccount) return
            const ICOContractInst = await icoContractInstance(activeAccount)
            const amountInWei = parseUnits(amount.toString(), 18)

            toast.loading('Approving USDT...', { id: 'buy-ico' })
            const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'
            const ICO_CONTRACT_ADDRESS = ICOContractInst.address

            const usdtContract = new ethers.Contract(
                USDT_ADDRESS,
                [
                    'function approve(address spender, uint256 amount) returns (bool)',
                    'function allowance(address owner, address spender) view returns (uint256)',
                ],
                ICOContractInst.signer
            )

            const existingAllowance = await usdtContract.allowance(activeAccount.address, ICO_CONTRACT_ADDRESS)
            if (existingAllowance.lt(amountInWei)) {
                const approveTx = await usdtContract.approve(ICO_CONTRACT_ADDRESS, amountInWei)
                toast.loading('Confirming approval...', { id: 'buy-ico' })
                await approveTx.wait()
            }

            toast.loading('Processing purchase...', { id: 'buy-ico' })
            const tx = await ICOContractInst.buyHorseIco(amountInWei, userAddress)
            await tx.wait()

            toast.success('Purchase successful 🎉', { id: 'buy-ico' })

            // ✅ Refresh on-chain data + Next.js server data after purchase
            await fetchICOPhaseAndPrice()
            router.refresh()

        } catch (error: any) {
            console.error('Error buying tokens:', error)
            if (error?.code === 'ACTION_REJECTED') {
                toast.error('Transaction cancelled', { id: 'buy-ico' })
                return
            }
            toast.error(error?.reason || error?.shortMessage || 'Transaction failed', { id: 'buy-ico' })
        }
    }

    const handleUsdtAmountChange = (value: string) => {
        if (value === "" || /^\d*\.?\d*$/.test(value)) setUsdtAmount(value)
    }

    const maxAllowed = buyLimitData ? Math.min(maxUSDT, Math.floor(buyLimitData.availableUSD)) : maxUSDT
    const exceedsLimit = buyLimitData && (usdtAmountNumber > buyLimitData.availableUSD || tokenAmount > buyLimitData.availHorse)
    const belowMinimum = usdtAmountNumber > 0 && usdtAmountNumber < minUSDT
    const isValidAmount = usdtAmountNumber >= minUSDT && usdtAmountNumber <= maxAllowed && !exceedsLimit

    const handleBuyConfirm = async () => {
        const targetAddress = buyMode === "self" ? activeAccount?.address : recipientAddress
        if (targetAddress) await handleBuyICOInSmartContract(usdtAmountNumber, targetAddress)
        setBuyDialogOpen(false)
        setUsdtAmount("10")
        setBuyMode("self")
        setRecipientAddress("")
        setBuyLimitData(null)
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

                .ico-card {
                    font-family: 'Outfit', sans-serif;
                    position: relative;
                    background: linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #080810 100%);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px;
                    padding: 28px;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .ico-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 20px;
                    padding: 1px;
                    background: linear-gradient(135deg, rgba(255,200,60,0.3), rgba(255,120,0,0.1), transparent 60%);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }

                .ico-card:hover::before { opacity: 1; }

                .ico-card:hover {
                    transform: translateY(-3px);
                    border-color: rgba(255,200,60,0.15);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
                }

                .noise-overlay {
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
                    pointer-events: none;
                    border-radius: 20px;
                }

                .glow-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(60px);
                    pointer-events: none;
                }

                .phase-badge {
                    font-family: 'Space Mono', monospace;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 100px;
                    background: rgba(255,200,60,0.1);
                    border: 1px solid rgba(255,200,60,0.25);
                    color: #ffc83c;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .live-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: #ffc83c;
                    animation: livePulse 1.5s ease-in-out infinite;
                    flex-shrink: 0;
                }

                @keyframes livePulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.7); }
                }

                .icon-wrap {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,200,60,0.1);
                    border: 1px solid rgba(255,200,60,0.2);
                }

                .card-title {
                    font-family: 'Outfit', sans-serif;
                    font-size: 22px;
                    font-weight: 700;
                    color: #f0f0f8;
                    letter-spacing: -0.02em;
                    margin: 0;
                }

                .card-desc {
                    font-size: 13px;
                    color: rgba(255,255,255,0.45);
                    line-height: 1.5;
                    margin: 0;
                }

                .price-display {
                    font-family: 'Space Mono', monospace;
                    font-size: 13px;
                    color: #ffc83c;
                    font-weight: 700;
                }

                .price-skeleton {
                    display: inline-block;
                    width: 60px;
                    height: 13px;
                    background: linear-gradient(90deg, rgba(255,200,60,0.1) 0%, rgba(255,200,60,0.2) 50%, rgba(255,200,60,0.1) 100%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 4px;
                    vertical-align: middle;
                }

                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                .stats-row {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                }

                .stat-item {
                    flex: 1;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 10px;
                    padding: 10px 12px;
                }

                .stat-label {
                    font-size: 10px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.35);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-bottom: 3px;
                }

                .stat-value {
                    font-family: 'Space Mono', monospace;
                    font-size: 12px;
                    font-weight: 700;
                    color: #f0f0f8;
                }

                .stat-skel {
                    width: 100%;
                    height: 14px;
                    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 4px;
                }

                .feature-pill {
                    font-size: 11px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.35);
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 100px;
                    padding: 3px 10px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .buy-btn {
                    font-family: 'Outfit', sans-serif;
                    font-weight: 600;
                    font-size: 14px;
                    letter-spacing: 0.02em;
                    width: 100%;
                    height: 48px;
                    border-radius: 12px;
                    border: none;
                    background: linear-gradient(135deg, #ffc83c 0%, #ff8c00 100%);
                    color: #0a0a0f;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                    margin-top: 20px;
                }

                .buy-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
                }

                .buy-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 30px rgba(255,200,60,0.35);
                }

                .premium-dialog {
                    background: linear-gradient(160deg, #0d0d18 0%, #0a0a13 100%) !important;
                    border: 1px solid rgba(255,255,255,0.08) !important;
                    border-radius: 24px !important;
                    max-width: 460px !important;
                    box-shadow: 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05) !important;
                }

                .dialog-title-text {
                    font-family: 'Outfit', sans-serif;
                    font-size: 20px;
                    font-weight: 700;
                    color: #f0f0f8;
                    letter-spacing: -0.02em;
                }

                .dialog-subtitle { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 2px; }

                .section-label {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: rgba(255,255,255,0.3);
                    margin-bottom: 10px;
                }

                .mode-btn {
                    flex: 1;
                    height: 72px;
                    border-radius: 14px;
                    border: 1px solid rgba(255,255,255,0.07);
                    background: rgba(255,255,255,0.03);
                    color: rgba(255,255,255,0.5);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    font-family: 'Outfit', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                }

                .mode-btn:hover { background: rgba(255,200,60,0.05); border-color: rgba(255,200,60,0.2); color: rgba(255,255,255,0.8); }
                .mode-btn.active { background: rgba(255,200,60,0.08); border-color: rgba(255,200,60,0.4); color: #ffc83c; }

                .premium-input {
                    background: rgba(255,255,255,0.04) !important;
                    border: 1px solid rgba(255,255,255,0.08) !important;
                    border-radius: 12px !important;
                    color: #f0f0f8 !important;
                    font-family: 'Outfit', sans-serif !important;
                    height: 48px;
                    transition: all 0.2s ease;
                }

                .premium-input:focus {
                    border-color: rgba(255,200,60,0.4) !important;
                    box-shadow: 0 0 0 3px rgba(255,200,60,0.08) !important;
                    outline: none !important;
                }

                .amount-input-wrap { position: relative; }

                .amount-input-large {
                    background: rgba(255,255,255,0.04) !important;
                    border: 1px solid rgba(255,255,255,0.08) !important;
                    border-radius: 14px !important;
                    color: #f0f0f8 !important;
                    font-family: 'Space Mono', monospace !important;
                    font-size: 20px !important;
                    font-weight: 700 !important;
                    height: 60px;
                    padding-left: 48px !important;
                    padding-right: 80px !important;
                    transition: all 0.2s ease;
                }

                .amount-input-large:focus {
                    border-color: rgba(255,200,60,0.5) !important;
                    box-shadow: 0 0 0 4px rgba(255,200,60,0.06) !important;
                    outline: none !important;
                }

                .input-currency-badge {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-family: 'Space Mono', monospace;
                    font-size: 11px;
                    font-weight: 700;
                    color: #ffc83c;
                    background: rgba(255,200,60,0.1);
                    border: 1px solid rgba(255,200,60,0.2);
                    padding: 3px 8px;
                    border-radius: 6px;
                }

                .limit-card {
                    background: rgba(255,255,255,0.025);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px;
                    padding: 14px 16px;
                }

                .limit-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; }
                .limit-row + .limit-row { border-top: 1px solid rgba(255,255,255,0.04); }
                .limit-label { font-size: 12px; color: rgba(255,255,255,0.4); }
                .limit-value { font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; color: #f0f0f8; }

                .receive-box {
                    background: linear-gradient(135deg, rgba(255,200,60,0.07) 0%, rgba(255,120,0,0.04) 100%);
                    border: 1px solid rgba(255,200,60,0.2);
                    border-radius: 14px;
                    padding: 16px 20px;
                    text-align: center;
                }

                .receive-label {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: rgba(255,200,60,0.7);
                    margin-bottom: 4px;
                }

                .receive-amount { font-family: 'Space Mono', monospace; font-size: 26px; font-weight: 700; color: #ffc83c; line-height: 1; }
                .receive-ticker { font-size: 13px; color: rgba(255,200,60,0.6); margin-left: 6px; }

                .vesting-note { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 8px; line-height: 1.4; }
                .vesting-note span { color: rgba(255,200,60,0.6); font-weight: 600; }

                .summary-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px;
                    padding: 14px 16px;
                }

                .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
                .summary-label { font-size: 12px; color: rgba(255,255,255,0.4); }
                .summary-value { font-family: 'Space Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.7); }

                .error-alert {
                    background: rgba(255,60,60,0.08);
                    border: 1px solid rgba(255,60,60,0.2);
                    border-radius: 10px;
                    padding: 10px 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 12px;
                    color: rgba(255,100,100,0.9);
                }

                .confirm-btn {
                    font-family: 'Outfit', sans-serif;
                    font-weight: 600;
                    font-size: 14px;
                    flex: 1;
                    height: 48px;
                    border-radius: 12px;
                    border: none;
                    background: linear-gradient(135deg, #ffc83c 0%, #ff8c00 100%);
                    color: #0a0a0f;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .confirm-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
                }

                .confirm-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(255,200,60,0.4); }
                .confirm-btn:disabled { opacity: 0.4; cursor: not-allowed; }

                .cancel-btn {
                    font-family: 'Outfit', sans-serif;
                    font-weight: 500;
                    font-size: 14px;
                    height: 48px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.03);
                    color: rgba(255,255,255,0.5);
                    cursor: pointer;
                    padding: 0 20px;
                    transition: all 0.2s ease;
                }

                .cancel-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }

                .loading-shimmer {
                    background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 8px;
                    height: 14px;
                }
            `}</style>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>

                {/* ── BUY ICO CARD ── */}
                <div className="ico-card">
                    <div className="noise-overlay" />
                    <div className="glow-orb" style={{ width: 200, height: 200, background: 'rgba(255,200,60,0.06)', top: -60, right: -60 }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div className="icon-wrap">
                                    <TrendingUp size={20} color="#ffc83c" />
                                </div>
                                {/* ✅ Real phase from contract — live dot pulses */}
                                <div className="phase-badge">
                                    <span className="live-dot" />
                                    {isLoadingPrice ? 'Loading...' : `Phase ${icoPhase ?? '—'} · Live`}
                                </div>
                            </div>
                            <Rocket size={20} color="rgba(255,200,60,0.3)" />
                        </div>

                        <h3 className="card-title" style={{ marginBottom: 6 }}>Buy ICO Tokens</h3>
                        <p className="card-desc">
                            Acquire HORSE tokens at{' '}
                            {isLoadingPrice
                                ? <span className="price-skeleton" />
                                : <span className="price-display">${pricePerToken?.toFixed(4) ?? '—'}</span>
                            }{' '}
                            before the next price increase
                        </p>

                        {/* ✅ Real stats — skeleton while loading */}
                        <div className="stats-row">
                            <div className="stat-item">
                                <div className="stat-label">Price</div>
                                {isLoadingPrice ? <div className="stat-skel" /> : <div className="stat-value">${pricePerToken?.toFixed(4) ?? '—'}</div>}
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Phase</div>
                                {isLoadingPrice ? <div className="stat-skel" /> : <div className="stat-value">{icoPhase ?? '—'} / 10</div>}
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Min</div>
                                <div className="stat-value">$10</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 16 }}>
                            <span className="feature-pill"><Shield size={9} /> Secure</span>
                            <span className="feature-pill"><Zap size={9} /> Instant</span>
                            <span className="feature-pill"><Star size={9} /> Early Access</span>
                        </div>

                        <AlertDialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <button className="buy-btn">
                                    <Rocket size={16} />
                                    Buy HORSE Tokens
                                    <ChevronRight size={15} />
                                </button>
                            </AlertDialogTrigger>

                            <AlertDialogContent className="premium-dialog" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                <AlertDialogHeader style={{ paddingBottom: 4 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                        <div className="icon-wrap" style={{ width: 36, height: 36 }}>
                                            <Rocket size={16} color="#ffc83c" />
                                        </div>
                                        <div>
                                            <AlertDialogTitle className="dialog-title-text">Purchase HORSE</AlertDialogTitle>
                                            <AlertDialogDescription className="dialog-subtitle">
                                                {isLoadingPrice ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <Loader2 size={12} className="animate-spin" /> Fetching price...
                                                    </span>
                                                ) : (
                                                    <>Phase {icoPhase} · <span style={{ color: '#ffc83c', fontFamily: 'Space Mono' }}>${pricePerToken?.toFixed(6)}</span> per token</>
                                                )}
                                            </AlertDialogDescription>
                                        </div>
                                    </div>
                                </AlertDialogHeader>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
                                    <div>
                                        <div className="section-label">Buying for</div>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <button className={`mode-btn ${buyMode === 'self' ? 'active' : ''}`} onClick={() => setBuyMode('self')}>
                                                <User size={18} /><span>Myself</span>
                                            </button>
                                            <button className={`mode-btn ${buyMode === 'others' ? 'active' : ''}`} onClick={() => setBuyMode('others')}>
                                                <Users size={18} /><span>Someone else</span>
                                            </button>
                                        </div>
                                    </div>

                                    {buyMode === 'others' && (
                                        <div>
                                            <div className="section-label">Recipient Address</div>
                                            <div style={{ position: 'relative' }}>
                                                <Wallet size={15} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                                <Input placeholder="0x..." value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} className="premium-input" style={{ paddingLeft: 38 }} />
                                            </div>
                                        </div>
                                    )}

                                    {isLoadingLimit ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <div className="loading-shimmer" style={{ width: '60%' }} />
                                            <div className="loading-shimmer" style={{ width: '80%' }} />
                                            <div className="loading-shimmer" style={{ width: '50%' }} />
                                        </div>
                                    ) : buyLimitData ? (
                                        <div className="limit-card">
                                            <div className="section-label" style={{ marginBottom: 8 }}>Your Allocation</div>
                                            <div className="limit-row">
                                                <span className="limit-label">Available USDT</span>
                                                <span className="limit-value">${buyLimitData.availableUSD.toFixed(2)}</span>
                                            </div>
                                            <div className="limit-row">
                                                <span className="limit-label">Available HORSE</span>
                                                <span className="limit-value">{buyLimitData.availHorse.toLocaleString()}</span>
                                            </div>
                                            <div className="limit-row">
                                                <span className="limit-label">Already Spent</span>
                                                <span className="limit-value" style={{ color: 'rgba(255,255,255,0.4)' }}>${buyLimitData.purchasedUSD.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ) : buyMode === 'others' && !recipientAddress ? (
                                        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', padding: '8px 0' }}>
                                            Enter recipient address to view limits
                                        </div>
                                    ) : null}

                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                            <div className="section-label" style={{ marginBottom: 0 }}>Amount</div>
                                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Mono' }}>max ${maxAllowed.toLocaleString()}</span>
                                        </div>
                                        <div className="amount-input-wrap">
                                            <DollarSign size={18} color="rgba(255,200,60,0.5)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={usdtAmount}
                                                onChange={(e) => handleUsdtAmountChange(e.target.value)}
                                                disabled={isLoadingPrice || isLoadingLimit || (buyMode === 'others' && !recipientAddress)}
                                                className="amount-input-large"
                                                placeholder="0.00"
                                            />
                                            <span className="input-currency-badge">USDT</span>
                                        </div>
                                    </div>

                                    {pricePerToken && usdtAmountNumber >= minUSDT && !exceedsLimit && (
                                        <div className="receive-box">
                                            <div className="receive-label">You will receive</div>
                                            <div>
                                                <span className="receive-amount">{tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                                <span className="receive-ticker">HORSE</span>
                                            </div>
                                            <div className="vesting-note">
                                                <span>30%</span> instant to your wallet · <span>70%</span> locked in vesting
                                            </div>
                                        </div>
                                    )}

                                    {belowMinimum && <div className="error-alert"><AlertCircle size={14} /> Minimum purchase is $10 USDT</div>}
                                    {exceedsLimit && (
                                        <div className="error-alert">
                                            <AlertCircle size={14} />
                                            Exceeds limit · Max ${buyLimitData.availableUSD.toFixed(2)} ({buyLimitData.availHorse.toLocaleString()} HORSE)
                                        </div>
                                    )}

                                    <div className="summary-card">
                                        <div className="summary-row">
                                            <span className="summary-label">USDT In</span>
                                            <span className="summary-value">${usdtAmountNumber.toLocaleString()}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span className="summary-label">Token Price</span>
                                            <span className="summary-value">{isLoadingPrice ? '...' : `$${pricePerToken?.toFixed(6)}`}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span className="summary-label">Phase</span>
                                            <span className="summary-value">{icoPhase ?? '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                <AlertDialogFooter style={{ gap: 10, paddingTop: 4 }}>
                                    <AlertDialogCancel asChild>
                                        <button className="cancel-btn">Cancel</button>
                                    </AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <button
                                            className="confirm-btn"
                                            onClick={handleBuyConfirm}
                                            disabled={
                                                (buyMode === 'others' && !recipientAddress) ||
                                                !isValidAmount || isLoadingLimit || isLoadingPrice ||
                                                !pricePerToken || !buyLimitData || usdtAmount === ''
                                            }
                                        >
                                            {isLoadingLimit || isLoadingPrice
                                                ? <><Loader2 size={15} className="animate-spin" /> Loading...</>
                                                : <><Rocket size={15} /> Confirm Purchase</>
                                            }
                                        </button>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* ── AIRDROP CARD ── */}
                <AirdropClaimCard />
            </div>
        </>
    )
}