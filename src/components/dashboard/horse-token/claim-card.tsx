/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Gift, Sparkles, ChevronRight, Star, Zap, Lock, RefreshCw, Clock, Coins, TrendingUp } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { formatUnits } from "ethers/lib/utils";
import { toast } from "sonner";
import { icoContractInstance } from "@/contract/ico-contract/ico-contract";

interface GiftVestingData {
    lockedAmt: string;
    claimedAmt: string;
    package: string;
    lastClaimTime: number;
    remaining: string;
}

interface ICOVestingData {
    lockedAmt: string;
    claimedAmt: string;
    lastClaimTime: number;
    remaining: string;
}

type Tab = "gift" | "ico";

export function AirdropClaimCard() {
    const activeAccount = useActiveAccount();
    const [giftVestingData, setGiftVestingData] = useState<GiftVestingData | null>(null);
    const [icoVestingData, setIcoVestingData] = useState<ICOVestingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [claimingGift, setClaimingGift] = useState(false);
    const [claimingIco, setClaimingIco] = useState(false);
    const [unlockingGift, setUnlockingGift] = useState(false);
    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("gift");

    const CLAIM_INTERVAL = 86400;

    // ── Gift derived ───────────────────────────────────────────────
    const isGiftLocked = useMemo(() => {
        if (!giftVestingData) return true;
        return parseFloat(giftVestingData.lockedAmt) === 0;
    }, [giftVestingData]);

    const isGiftClaimAvailable = useMemo(() => {
        if (!giftVestingData || isGiftLocked) return false;
        if (parseFloat(giftVestingData.remaining) <= 0) return false;
        return (currentTime - giftVestingData.lastClaimTime) >= CLAIM_INTERVAL;
    }, [giftVestingData, currentTime, isGiftLocked]);

    const nextGiftClaimTime = useMemo(() => giftVestingData ? giftVestingData.lastClaimTime + CLAIM_INTERVAL : 0, [giftVestingData]);

    const timeUntilNextGiftClaim = useMemo(() => {
        if (!giftVestingData) return "";
        if (isGiftLocked) return "Locked";
        if (parseFloat(giftVestingData.remaining) <= 0) return "All claimed";
        const diff = nextGiftClaimTime - currentTime;
        if (diff <= 0) return "Available now";
        const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }, [giftVestingData, currentTime, nextGiftClaimTime, isGiftLocked]);

const currentGiftAvailable = useMemo(() => {
    if (!giftVestingData || isGiftLocked) return "0";
    
    const remainingNum = parseFloat(giftVestingData.remaining);
    if (remainingNum <= 0 || !isGiftClaimAvailable) return "0";
    
    const timeSinceLastClaim = currentTime - giftVestingData.lastClaimTime;
    const intervalsPassed = Math.floor(timeSinceLastClaim / CLAIM_INTERVAL);
    if (intervalsPassed < 1) return "0";
    
    const lockedAmount = parseFloat(giftVestingData.lockedAmt);
    // Always 0.5% of lockedAmt — fixed daily amount, never accumulates
    const dailyClaimable = lockedAmount * 0.005;
    const calculated = Math.min(dailyClaimable, remainingNum);
    
    return calculated.toFixed(2);
}, [giftVestingData, currentTime, isGiftClaimAvailable, isGiftLocked]);


    const giftRemainingPct = giftVestingData
        ? Math.max(0, Math.min(100, (parseFloat(giftVestingData.remaining) / parseFloat(giftVestingData.lockedAmt || "1")) * 100))
        : 0;

    // ── ICO derived ────────────────────────────────────────────────
    const isIcoClaimAvailable = useMemo(() => {
        if (!icoVestingData) return false;
        if (parseFloat(icoVestingData.remaining) <= 0) return false;
        return (currentTime - icoVestingData.lastClaimTime) >= CLAIM_INTERVAL;
    }, [icoVestingData, currentTime]);

    const nextIcoClaimTime = useMemo(() => icoVestingData ? icoVestingData.lastClaimTime + CLAIM_INTERVAL : 0, [icoVestingData]);

    const timeUntilNextIcoClaim = useMemo(() => {
        if (!icoVestingData) return "";
        if (parseFloat(icoVestingData.remaining) <= 0) return "All claimed";
        const diff = nextIcoClaimTime - currentTime;
        if (diff <= 0) return "Available now";
        const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    }, [icoVestingData, currentTime, nextIcoClaimTime]);

  const currentIcoAvailable = useMemo(() => {
    if (!icoVestingData) return "0";
    
    const remainingNum = parseFloat(icoVestingData.remaining);
    if (remainingNum <= 0 || !isIcoClaimAvailable) return "0";
    
    const timeSinceLastClaim = currentTime - icoVestingData.lastClaimTime;
    const intervalsPassed = Math.floor(timeSinceLastClaim / CLAIM_INTERVAL);
    if (intervalsPassed < 1) return "0";
    
    const lockedAmount = parseFloat(icoVestingData.lockedAmt);
    // Always 0.5% of lockedAmt — fixed daily amount, never accumulates
    const dailyClaimable = lockedAmount * 0.005;
    const calculated = Math.min(dailyClaimable, remainingNum);
    
    return calculated.toFixed(2);
}, [icoVestingData, currentTime, isIcoClaimAvailable]);

    const icoRemainingPct = icoVestingData
        ? Math.max(0, Math.min(100, (parseFloat(icoVestingData.remaining) / parseFloat(icoVestingData.lockedAmt || "1")) * 100))
        : 0;

    // ── Data fetching ──────────────────────────────────────────────
    const fetchAllData = useCallback(async () => {
        try {
            if (!activeAccount) { setLoading(false); return; }
            const icoInsta = await icoContractInstance(activeAccount);
            const [giftRaw, icoRaw] = await Promise.all([
                icoInsta.userHRSGiftLiveView(activeAccount.address),
                icoInsta.userHRSIcoLiveView(activeAccount.address),
            ]);
            setGiftVestingData({
                lockedAmt: formatUnits(giftRaw[0], 18),
                claimedAmt: formatUnits(giftRaw[1], 18),
                package: giftRaw[2].toString(),
                lastClaimTime: giftRaw[3].toNumber(),
                remaining: formatUnits(giftRaw[4], 18),
            });
            setIcoVestingData({
                lockedAmt: formatUnits(icoRaw[0], 18),
                claimedAmt: formatUnits(icoRaw[1], 18),
                lastClaimTime: icoRaw[2].toNumber(),
                remaining: formatUnits(icoRaw[3], 18),
            });
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [activeAccount]);

    // ── Actions ────────────────────────────────────────────────────
    const onUnlock = useCallback(async () => {
        try {
            if (!activeAccount) return;
            setUnlockingGift(true);
            toast.loading("Unlocking gift vesting...", { id: "unlock-gift" });
            const icoInsta = await icoContractInstance(activeAccount);
            await (await icoInsta.matrixHRSGiftLock(activeAccount.address)).wait();
            toast.success("Gift vesting unlocked 🎉", { id: "unlock-gift" });
            await fetchAllData();
        } catch (err: any) {
            toast.error(err?.code === "ACTION_REJECTED" ? "Cancelled" : err?.reason || "Failed", { id: "unlock-gift" });
        } finally { setUnlockingGift(false); }
    }, [activeAccount, fetchAllData]);

    const onClaimGift = useCallback(async () => {
        try {
            if (!activeAccount || isGiftLocked || !isGiftClaimAvailable) return;
            setClaimingGift(true);
            toast.loading("Claiming gift tokens...", { id: "claim-gift" });
            const icoInsta = await icoContractInstance(activeAccount);
            await (await icoInsta.claimMatrixGift(activeAccount.address)).wait();
            toast.success("Gift claimed 🎉", { id: "claim-gift" });
            await fetchAllData();
        } catch (err: any) {
            toast.error(err?.code === "ACTION_REJECTED" ? "Cancelled" : err?.reason || "Failed", { id: "claim-gift" });
        } finally { setClaimingGift(false); }
    }, [activeAccount, isGiftLocked, isGiftClaimAvailable, fetchAllData]);

    const onClaimIco = useCallback(async () => {
        try {
            if (!activeAccount || !isIcoClaimAvailable) return;
            setClaimingIco(true);
            toast.loading("Claiming ICO tokens...", { id: "claim-ico" });
            const icoInsta = await icoContractInstance(activeAccount);
            await (await icoInsta.claimHRSIcoLock(activeAccount.address)).wait();
            toast.success("ICO vesting claimed 🎉", { id: "claim-ico" });
            await fetchAllData();
        } catch (err: any) {
            toast.error(err?.code === "ACTION_REJECTED" ? "Cancelled" : err?.reason || "Failed", { id: "claim-ico" });
        } finally { setClaimingIco(false); }
    }, [activeAccount, isIcoClaimAvailable, fetchAllData]);

    // ── Effects ────────────────────────────────────────────────────
    useEffect(() => { fetchAllData(); }, [fetchAllData]);
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
        return () => clearInterval(t);
    }, []);
    useEffect(() => {
        const t = setInterval(() => fetchAllData(), 30000);
        return () => clearInterval(t);
    }, [fetchAllData]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
                .ad-root { font-family: 'Outfit', sans-serif; }

                .ad-card {
                    position: relative;
                    background: linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #080810 100%);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px; padding: 28px; overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); cursor: pointer;
                }
                .ad-card::before {
                    content: ''; position: absolute; inset: 0; border-radius: 20px; padding: 1px;
                    background: linear-gradient(135deg, rgba(120,80,255,0.3), rgba(60,120,255,0.1), transparent 60%);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor; mask-composite: exclude;
                    pointer-events: none; opacity: 0; transition: opacity 0.4s ease;
                }
                .ad-card:hover::before { opacity: 1; }
                .ad-card:hover {
                    transform: translateY(-3px); border-color: rgba(120,80,255,0.15);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
                }
                .ad-noise {
                    position: absolute; inset: 0; pointer-events: none; border-radius: 20px;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
                }
                .ad-glow { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; }
                .ad-badge {
                    font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700;
                    letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 10px;
                    border-radius: 100px; background: rgba(120,80,255,0.1);
                    border: 1px solid rgba(120,80,255,0.25); color: #a070ff;
                }
                .ad-icon {
                    width: 44px; height: 44px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(120,80,255,0.1); border: 1px solid rgba(120,80,255,0.2);
                }
                .ad-title { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 700; color: #f0f0f8; letter-spacing: -0.02em; margin: 0; }
                .ad-desc  { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.5; margin: 0; }
                .ad-stats { display: flex; gap: 12px; margin-top: 20px; }
                .ad-stat  { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 10px 12px; }
                .ad-stat-label { font-size: 10px; font-weight: 500; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
                .ad-stat-value { font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; color: #f0f0f8; }
                .ad-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 16px; }
                .ad-pill  { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 100px; padding: 3px 10px; display: flex; align-items: center; gap: 4px; }
                .ad-cta {
                    font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 14px;
                    width: 100%; height: 48px; border-radius: 12px; border: none;
                    background: linear-gradient(135deg, #a070ff 0%, #6040d0 100%); color: #fff;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
                    position: relative; overflow: hidden; transition: all 0.3s cubic-bezier(0.23,1,0.32,1); margin-top: 20px;
                }
                .ad-cta::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%); }
                .ad-cta:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(120,80,255,0.35); }
                .ad-cta:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

                /* Drawer */
                .ad-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 50; animation: adFI 0.2s ease; }
                .ad-drawer {
                    position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
                    width: 100%; max-width: 500px;
                    background: linear-gradient(160deg, #0d0d18 0%, #0a0a13 100%);
                    border: 1px solid rgba(255,255,255,0.08); border-bottom: none;
                    border-radius: 24px 24px 0 0; padding: 20px 24px 44px;
                    z-index: 51; box-shadow: 0 -20px 60px rgba(0,0,0,0.6);
                    animation: adSU 0.3s cubic-bezier(0.23,1,0.32,1); max-height: 90vh; overflow-y: auto;
                }
                @keyframes adFI { from{opacity:0} to{opacity:1} }
                @keyframes adSU { from{transform:translateX(-50%) translateY(100%)} to{transform:translateX(-50%) translateY(0)} }
                .ad-handle { width: 36px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 100px; margin: 0 auto 20px; }

                /* Tabs */
                .ad-tabs { display: flex; gap: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 4px; margin-bottom: 20px; }
                .ad-tab {
                    flex: 1; height: 42px; border-radius: 10px; border: none; background: transparent;
                    cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
                    color: rgba(255,255,255,0.35);
                    display: flex; align-items: center; justify-content: center; gap: 7px;
                    transition: all 0.25s ease;
                }
                .ad-tab:hover { color: rgba(255,255,255,0.6); }
                .ad-tab.t-gift {
                    background: linear-gradient(135deg, rgba(120,80,255,0.18), rgba(80,40,200,0.12));
                    border: 1px solid rgba(120,80,255,0.28); color: #a070ff;
                    box-shadow: 0 2px 12px rgba(120,80,255,0.12);
                }
                .ad-tab.t-ico {
                    background: linear-gradient(135deg, rgba(255,200,60,0.14), rgba(255,120,0,0.08));
                    border: 1px solid rgba(255,200,60,0.22); color: #ffc83c;
                    box-shadow: 0 2px 12px rgba(255,200,60,0.1);
                }

                /* Content */
                .ad-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
                .ad-cell { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 14px; }
                .ad-cell-p { background: rgba(120,80,255,0.05); border-color: rgba(120,80,255,0.15); }
                .ad-cell-g { background: rgba(255,200,60,0.05);  border-color: rgba(255,200,60,0.15); }
                .ad-cell-lbl { font-size: 10px; font-weight: 500; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
                .ad-cell-val { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; color: #f0f0f8; }

                .ad-prog-track { height: 5px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; margin: 6px 0 14px; }
                .ad-prog-p { height:100%; background: linear-gradient(90deg,#a070ff,#6040d0); border-radius:100px; transition:width 0.6s ease; }
                .ad-prog-g { height:100%; background: linear-gradient(90deg,#ffc83c,#ff8c00); border-radius:100px; transition:width 0.6s ease; }

                .ad-avail-p { background: linear-gradient(135deg,rgba(120,80,255,0.1),rgba(60,40,160,0.05)); border: 1px solid rgba(120,80,255,0.25); border-radius:14px; padding:14px 20px; text-align:center; margin-bottom:12px; }
                .ad-avail-g { background: linear-gradient(135deg,rgba(255,200,60,0.08),rgba(255,120,0,0.04)); border: 1px solid rgba(255,200,60,0.2);  border-radius:14px; padding:14px 20px; text-align:center; margin-bottom:12px; }
                .ad-avail-lbl { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px; }
                .ad-avail-amt { font-family:'Space Mono',monospace; font-size:26px; font-weight:700; line-height:1; }
                .ad-avail-tkr { font-size:12px; margin-left:6px; opacity:0.6; }

                .ad-timer { display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:10px 14px; margin-bottom:12px; font-size:12px; }
                .ad-lock-box { background:rgba(120,80,255,0.05); border:1px solid rgba(120,80,255,0.15); border-radius:14px; padding:20px; text-align:center; margin-bottom:14px; }
                .ad-hint { font-size:11px; color:rgba(255,255,255,0.22); text-align:center; margin-bottom:12px; }

                .ad-btn { font-family:'Outfit',sans-serif; font-weight:600; font-size:14px; width:100%; height:50px; border-radius:14px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; position:relative; overflow:hidden; transition:all 0.3s ease; }
                .ad-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 60%); }
                .ad-btn-p { background:linear-gradient(135deg,#a070ff 0%,#6040d0 100%); color:#fff; }
                .ad-btn-p:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px rgba(120,80,255,0.45); }
                .ad-btn-g { background:linear-gradient(135deg,#ffc83c 0%,#ff8c00 100%); color:#0a0a0f; }
                .ad-btn-g:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 28px rgba(255,200,60,0.4); }
                .ad-btn-op { background:rgba(120,80,255,0.1); border:1px solid rgba(120,80,255,0.3); color:#a070ff; }
                .ad-btn:disabled { opacity:0.4; cursor:not-allowed; transform:none !important; }

                .ad-spin { animation:adR 0.8s linear infinite; }
                @keyframes adR { to{transform:rotate(360deg)} }
            `}</style>

            <div className="ad-root">
                {/* ── Card ────────────────────────────────────── */}
                <div className="ad-card">
                    <div className="ad-noise" />
                    <div className="ad-glow" style={{ width:200, height:200, background:'rgba(120,80,255,0.06)', top:-60, right:-60 }} />

                    <div style={{ position:'relative', zIndex:1 }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                <div className="ad-icon"><Gift size={20} color="#a070ff" /></div>
                                <div className="ad-badge">
                                    {loading ? '—' : isGiftLocked ? 'Locked' : `${parseFloat(giftVestingData?.remaining||'0').toFixed(0)} Left`}
                                </div>
                            </div>
                            <Sparkles size={20} color="rgba(120,80,255,0.3)" />
                        </div>

                        <h3 className="ad-title" style={{ marginBottom:6 }}>Claim Airdrop</h3>
                        <p className="ad-desc">
                            Receive{' '}
                            <span style={{ fontFamily:'Space Mono', fontSize:13, color:'#a070ff', fontWeight:700 }}>1,000 HORSE</span>
                            {' '}tokens reserved for early community supporters
                        </p>

                        <div className="ad-stats">
                            <div className="ad-stat">
                                <div className="ad-stat-label">Gift Left</div>
                                <div className="ad-stat-value" style={{ color:'#a070ff' }}>
                                    {loading ? '—' : parseFloat(giftVestingData?.remaining||'0').toFixed(0)}
                                </div>
                            </div>
                            <div className="ad-stat">
                                <div className="ad-stat-label">ICO Left</div>
                                <div className="ad-stat-value" style={{ color:'#ffc83c' }}>
                                    {loading ? '—' : parseFloat(icoVestingData?.remaining||'0').toFixed(0)}
                                </div>
                            </div>
                            <div className="ad-stat">
                                <div className="ad-stat-label">Next</div>
                                <div className="ad-stat-value" style={{ fontSize:10 }}>
                                    {loading ? '—' : timeUntilNextGiftClaim}
                                </div>
                            </div>
                        </div>

                        <div className="ad-pills">
                            <span className="ad-pill"><Gift size={9}/> Free Tokens</span>
                            <span className="ad-pill"><Star size={9}/> Early Supporters</span>
                            <span className="ad-pill"><Zap size={9}/> Limited</span>
                        </div>

                        <button className="ad-cta" onClick={() => setDialogOpen(true)} disabled={loading}>
                            {loading
                                ? <><RefreshCw size={15} className="ad-spin"/> Loading...</>
                                : <><Sparkles size={15}/> View Vesting <ChevronRight size={14}/></>
                            }
                        </button>
                    </div>
                </div>

                {/* ── Drawer ──────────────────────────────────── */}
                {dialogOpen && (
                    <>
                        <div className="ad-backdrop" onClick={() => setDialogOpen(false)} />
                        <div className="ad-drawer">
                            <div className="ad-handle" />

                            {/* Drawer header */}
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                    <div className="ad-icon" style={{ width:36, height:36 }}>
                                        {activeTab === 'gift' ? <Gift size={16} color="#a070ff"/> : <TrendingUp size={16} color="#ffc83c"/>}
                                    </div>
                                    <div>
                                        <div style={{ fontFamily:'Outfit', fontWeight:700, fontSize:17, color:'#f0f0f8', letterSpacing:'-0.02em' }}>Token Vesting</div>
                                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>Claim your locked HORSE tokens</div>
                                    </div>
                                </div>
                                <button onClick={() => setDialogOpen(false)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, width:30, height:30, cursor:'pointer', color:'rgba(255,255,255,0.4)', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                            </div>

                            {/* ── TABS ── */}
                            <div className="ad-tabs">
                                <button className={`ad-tab ${activeTab==='gift'?'t-gift':''}`} onClick={() => setActiveTab('gift')}>
                                    <Gift size={14}/> Gift Vesting
                                </button>
                                <button className={`ad-tab ${activeTab==='ico'?'t-ico':''}`} onClick={() => setActiveTab('ico')}>
                                    <TrendingUp size={14}/> ICO Vesting
                                </button>
                            </div>

                            {/* ── GIFT PANEL ── */}
                            {activeTab === 'gift' && (
                                <>
                                    {!isGiftLocked && giftVestingData && (
                                        <>
                                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:2 }}>
                                                <span>Vested</span>
                                                <span style={{ fontFamily:'Space Mono', color:'#a070ff' }}>{(100-giftRemainingPct).toFixed(0)}%</span>
                                            </div>
                                            <div className="ad-prog-track"><div className="ad-prog-p" style={{ width:`${100-giftRemainingPct}%` }}/></div>
                                        </>
                                    )}

                                    <div className="ad-grid">
                                        <div className="ad-cell">
                                            <div className="ad-cell-lbl">Total Locked</div>
                                            <div className="ad-cell-val">{parseFloat(giftVestingData?.lockedAmt||'0').toFixed(2)}</div>
                                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:2 }}>HORSE</div>
                                        </div>
                                        <div className="ad-cell">
                                            <div className="ad-cell-lbl">Claimed</div>
                                            <div className="ad-cell-val" style={{ color:'#4ade80' }}>{parseFloat(giftVestingData?.claimedAmt||'0').toFixed(2)}</div>
                                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:2 }}>HORSE</div>
                                        </div>
                                        <div className="ad-cell ad-cell-p" style={{ gridColumn:'1 / -1' }}>
                                            <div className="ad-cell-lbl">Remaining</div>
                                            <div className="ad-cell-val" style={{ color:'#a070ff', fontSize:15 }}>{parseFloat(giftVestingData?.remaining||'0').toFixed(2)} HORSE</div>
                                        </div>
                                    </div>

                                    {isGiftLocked ? (
                                        <>
                                            <div className="ad-lock-box">
                                                <Lock size={26} color="rgba(120,80,255,0.5)" style={{ margin:'0 auto 10px' }}/>
                                                <div style={{ fontSize:14, fontWeight:600, color:'#a070ff', marginBottom:6 }}>Gift Vesting Locked</div>
                                                <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.6 }}>Unlock to start the vesting schedule and earn tokens over 100 daily intervals.</div>
                                            </div>
                                            <button className="ad-btn ad-btn-op" onClick={onUnlock} disabled={unlockingGift}>
                                                {unlockingGift ? <><RefreshCw size={14} className="ad-spin"/> Unlocking...</> : <><Lock size={14}/> Unlock Gift Vesting</>}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="ad-avail-p">
                                                <div className="ad-avail-lbl" style={{ color:'rgba(120,80,255,0.7)' }}>Available to Claim</div>
                                                <div><span className="ad-avail-amt" style={{ color:'#a070ff' }}>{currentGiftAvailable}</span><span className="ad-avail-tkr" style={{ color:'#a070ff' }}>HORSE</span></div>
                                            </div>
                                            <div className="ad-timer">
                                                <div style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.4)' }}><Clock size={13}/><span>Next unlock</span></div>
                                                <span style={{ fontFamily:'Space Mono', fontSize:12, fontWeight:700, color: isGiftClaimAvailable?'#4ade80':'#a070ff' }}>{timeUntilNextGiftClaim}</span>
                                            </div>
                                            <div className="ad-hint">Vests every 24h · 1% per interval · 100 periods total</div>
                                            <button className="ad-btn ad-btn-p" onClick={onClaimGift}
                                                disabled={!isGiftClaimAvailable || claimingGift || parseFloat(giftVestingData?.remaining||'0')===0}>
                                                {claimingGift ? <><RefreshCw size={14} className="ad-spin"/> Claiming...</>
                                                    : parseFloat(giftVestingData?.remaining||'0')===0 ? <><Coins size={14}/> All Claimed</>
                                                    : !isGiftClaimAvailable ? <><Clock size={14}/> Wait {timeUntilNextGiftClaim}</>
                                                    : <><Coins size={14}/> Claim Gift Tokens</>}
                                            </button>
                                        </>
                                    )}
                                </>
                            )}

                            {/* ── ICO PANEL ── */}
                            {activeTab === 'ico' && (
                                <>
                                    {icoVestingData && parseFloat(icoVestingData.lockedAmt) > 0 && (
                                        <>
                                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:2 }}>
                                                <span>Vested</span>
                                                <span style={{ fontFamily:'Space Mono', color:'#ffc83c' }}>{(100-icoRemainingPct).toFixed(0)}%</span>
                                            </div>
                                            <div className="ad-prog-track"><div className="ad-prog-g" style={{ width:`${100-icoRemainingPct}%` }}/></div>
                                        </>
                                    )}

                                    <div className="ad-grid">
                                        <div className="ad-cell">
                                            <div className="ad-cell-lbl">Total Locked</div>
                                            <div className="ad-cell-val">{parseFloat(icoVestingData?.lockedAmt||'0').toFixed(2)}</div>
                                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:2 }}>HORSE</div>
                                        </div>
                                        <div className="ad-cell">
                                            <div className="ad-cell-lbl">Claimed</div>
                                            <div className="ad-cell-val" style={{ color:'#4ade80' }}>{parseFloat(icoVestingData?.claimedAmt||'0').toFixed(2)}</div>
                                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:2 }}>HORSE</div>
                                        </div>
                                        <div className="ad-cell ad-cell-g" style={{ gridColumn:'1 / -1' }}>
                                            <div className="ad-cell-lbl">Remaining</div>
                                            <div className="ad-cell-val" style={{ color:'#ffc83c', fontSize:15 }}>{parseFloat(icoVestingData?.remaining||'0').toFixed(2)} HORSE</div>
                                        </div>
                                    </div>

                                    {parseFloat(icoVestingData?.lockedAmt||'0') === 0 ? (
                                        <div style={{ background:'rgba(255,200,60,0.04)', border:'1px solid rgba(255,200,60,0.12)', borderRadius:14, padding:20, textAlign:'center', marginBottom:14 }}>
                                            <TrendingUp size={26} color="rgba(255,200,60,0.4)" style={{ margin:'0 auto 10px' }}/>
                                            <div style={{ fontSize:14, fontWeight:600, color:'#ffc83c', marginBottom:6 }}>No ICO Tokens</div>
                                            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', lineHeight:1.6 }}>Purchase HORSE tokens in the ICO to start vesting.</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="ad-avail-g">
                                                <div className="ad-avail-lbl" style={{ color:'rgba(255,200,60,0.7)' }}>Available to Claim</div>
                                                <div><span className="ad-avail-amt" style={{ color:'#ffc83c' }}>{currentIcoAvailable}</span><span className="ad-avail-tkr" style={{ color:'#ffc83c' }}>HORSE</span></div>
                                            </div>
                                            <div className="ad-timer">
                                                <div style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.4)' }}><Clock size={13}/><span>Next unlock</span></div>
                                                <span style={{ fontFamily:'Space Mono', fontSize:12, fontWeight:700, color: isIcoClaimAvailable?'#4ade80':'#ffc83c' }}>{timeUntilNextIcoClaim}</span>
                                            </div>
                                            <div className="ad-hint">Vests every 24h · 1% per interval · 100 periods total</div>
                                            <button className="ad-btn ad-btn-g" onClick={onClaimIco}
                                                disabled={!isIcoClaimAvailable || claimingIco || parseFloat(icoVestingData?.remaining||'0')===0}>
                                                {claimingIco ? <><RefreshCw size={14} className="ad-spin"/> Claiming...</>
                                                    : parseFloat(icoVestingData?.remaining||'0')===0 ? <><Coins size={14}/> All Claimed</>
                                                    : !isIcoClaimAvailable ? <><Clock size={14}/> Wait {timeUntilNextIcoClaim}</>
                                                    : <><Coins size={14}/> Claim ICO Tokens</>}
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}