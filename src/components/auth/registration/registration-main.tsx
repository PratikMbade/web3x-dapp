/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type React from 'react';
import { FadeLoader } from 'react-spinners';
import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ArrowRight,
  Zap,
  Globe,
  Lock,
  ArrowLeft,
  Users,
  TrendingUp,
  CheckCircle2,
  Coins,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useActiveAccount, useConnect } from 'thirdweb/react';
import { contractInstance } from '@/contract/contract';
import { ethers5Adapter } from 'thirdweb/adapters/ethers5';
import { chainId, client, MainnetChain } from '@/lib/client';
import WalletConnect from '../../web3-wallet/wallet-connect';
import { ethers } from 'ethers';
import { createWallet } from 'thirdweb/wallets';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { verifyRegisteredUser, verifySponsor } from '@/actions/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegisterUserByAddType, saveUserInDB } from '@/actions/user';
import Link from 'next/link';
import { ParticlesBackground } from '@/components/home-page/particles-background';

// ─── Feature Card ──────────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="group flex items-start gap-3 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-orange-500/30 rounded-xl p-4 transition-all duration-300"
  >
    <div className="shrink-0 mt-0.5 p-2 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-lg group-hover:from-orange-500/30 transition-all duration-300">
      <Icon className="w-4 h-4 text-orange-400" />
    </div>
    <div>
      <h3 className="text-white text-sm font-semibold mb-0.5">{title}</h3>
      <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

// ─── Trust Badge ───────────────────────────────────────────────────────────────
const TrustBadge = ({ icon: Icon, label, color }: any) => (
  <div className="flex items-center gap-1.5 text-slate-400">
    <Icon className={`w-3.5 h-3.5 ${color}`} />
    <span className="text-xs">{label}</span>
  </div>
);

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface RegisterTypes {
  wallet_address: string;
  sponser_address: string;
  registeredTime: number;
}

export interface RegisterInputType {
  referral_address: string;
}

function isSuccessResponse(response: SigninResponse): response is SuccessResponse {
  return 'success' in response && response.success;
}

interface SuccessResponse { success: boolean; }
interface ErrorResponse { error: any; }
type SigninResponse = SuccessResponse | ErrorResponse;

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RegistrationMain() {
  const params = useSearchParams();
  const url = params.get('rr');
  const [queryUrl, setQueryUrl] = useState<string>();
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');
  const [registerInputValue, setRegisterInputValue] = useState<RegisterInputType>({ referral_address: '' });
  const activeAccount = useActiveAccount();
  const [isPending, setIsPending] = useState(false);
  const { connect, isConnecting } = useConnect();
  const [error, setError] = useState<string | null>();
  const [success, setSuccess] = useState<string | null>();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [hasUpline, setHasUpline] = useState<boolean | null>(null);

  const router = useRouter();

  // ─── Logic (unchanged) ──────────────────────────────────────────────────────
  const getProperCaseAddress = async (currentAddress: string) => {
    try {
      if (!activeAccount?.address) { toast('Connect your wallet', { icon: 'ℹ️' }); return; }
      const contractInst = await contractInstance(activeAccount);
      const regIdRes = await contractInst.RegisterUserByAdd(currentAddress);
      const regId = regIdRes.toString();
      const res = await contractInst.RegisterUerById(regId);
      const formattedUser = ethers.utils.getAddress(res._user);
      const formattedResponse: RegisterUserByAddType = {
        regId: Number(regId),
        user: formattedUser,
        upline: ethers.utils.getAddress(res._upline),
        uplineId: res._uplineid.toString(),
        teamCount: res._teamcount.toString(),
      };
      return formattedResponse.user;
    } catch (error) {
      console.log('error in getProperCaseAddress: ', error);
      return null;
    }
  };

  const isReferralAvalibale = async (wallet_address: string) => {
    try {
      const res = await verifySponsor(wallet_address);
      if (res.success == true) { setSuccess(res.msg); setError(null); return true; }
      toast.error(res.msg);
      setError(res.msg);
      setSuccess(null);
      return false;
    } catch (error) {
      setError('something went wrong');
      setSuccess(null);
      return false;
    }
  };

  const handleNoSponser = async () => {
    try {
      setIsPending(true);
      const developerSponser: RegisterInputType = { referral_address: '0x2C7f4dB6A0B1df04EA8550c219318C7f2FF3D34C'.toLowerCase() };
      setRegisterInputValue(developerSponser);
      await registerInSmartContract(developerSponser.referral_address);
    } catch (error) { setIsPending(false); } finally { setIsPending(false); }
  };

  const registerInSmartContract = async (properAddress: string) => {
    try {
      if (!activeAccount?.address) { toast('Connect your wallet', { icon: 'ℹ️' }); return false; }
      setIsFormSubmitted(true);
      const contractInst = await contractInstance(activeAccount);
      const isRegistered = await contractInst.register(activeAccount.address);
      if (isRegistered) { toast.error('User Already Registered!'); return false; }
      if (properAddress.toLowerCase() !== '0x07a132a5F132619A9EA0A97e650F30d760C96b53'.toLowerCase()) {
        const isReferralExist = await contractInst.register(properAddress);
        if (!isReferralExist) { toast.error('Referral Not Registered!'); return false; }
      }
      const signer = await ethers5Adapter.signer.toEthers({ client, chain: MainnetChain, account: activeAccount! });
      if (!signer) { toast.error('Signer not available'); return false; }

      // Get registration fee (in BNB/wei)
      const regFee = await contractInst.regFee();
      console.log('regFee (BNB):', ethers.utils.formatUnits(regFee, 18));

      // ✅ Check native BNB balance
      const bnbBalance = await signer.provider.getBalance(activeAccount.address);
      console.log('BNB balance:', ethers.utils.formatUnits(bnbBalance, 18));

      if (bnbBalance.lt(regFee)) {
        const required = ethers.utils.formatUnits(regFee, 18);
        const current = ethers.utils.formatUnits(bnbBalance, 18);
        toast.error(`Insufficient BNB. You have ${parseFloat(current).toFixed(4)} BNB but need ${parseFloat(required).toFixed(4)} BNB.`);
        return false;
      }

      // ✅ Estimate gas with BNB value
      const gasEstimate = await contractInst.estimateGas.registerUserByToken(activeAccount.address, properAddress, { value: regFee });
      const gasLimit = gasEstimate.mul(110).div(100);
      const feeData = await signer.provider.getFeeData();
      toast('Registering... Please confirm in your wallet', { icon: 'ℹ️' });

      // ✅ Send registration tx with BNB as value
      const tx = await contractInst.registerUserByToken(activeAccount.address, properAddress, {
        value: regFee,
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas!,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!,
      });
      const receipt = await tx.wait();
      if (receipt && receipt.status === 1) {
        const regIdRes = await contractInst.RegisterUserByAdd(activeAccount.address);
        const regId = regIdRes.toString();
        const res = await contractInst.RegisterUerById(regId);
        const formattedUser = ethers.utils.getAddress(res._user);
        const formattedResponse: RegisterUserByAddType = {
          regId: regId,
          user: formattedUser,
          upline: ethers.utils.getAddress(res._upline),
          uplineId: res._uplineid.toString(),
          teamCount: res._teamcount.toString(),
        };
        await registerUser(formattedResponse);
      }
      return true;
    } catch (error) {
      console.error('registerInSmartContract error:', error);
      setIsPending(false);
      const lower = String((error as any)?.message || '').toLowerCase();
      if (lower.includes('insufficient funds')) {
        toast.error('Insufficient BNB for gas fees. You need a small amount of BNB to pay gas.');
      } else if (lower.includes('user rejected') || lower.includes('denied')) {
        toast.error('Transaction rejected.');
      } else if ((error as any)?.reason) {
        toast.error((error as any).reason);
      } else {
        toast.error('Registration failed. Please try again.');
      }
      return false;
    }
  };

  const registerUser = async (data: RegisterUserByAddType) => {
    try {
      const res = await saveUserInDB(data);
      if (res.status === 200) {
        setIsPending(false);
        await createSessionAndRedirect();
        toast.success('User registered successfully');
      } else {
        toast.error(`Backend error: ${res.msg}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setIsPending(false);
      if (error instanceof Error) { toast.error(`Registration failed: ${error.message}`); }
      else { toast.error('Registration failed: Unknown error'); }
    } finally { setIsPending(false); }
  };

  const createSessionAndRedirect = async () => {
    try {
      if (!activeAccount?.address) return;
      const message = `Sign in to Web3x\nWallet: ${activeAccount.address}\nTimestamp: ${Date.now()}`;
      const signature = await activeAccount.signMessage({ message });
      const authRes = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeAccount.address, signature, message }),
      });
      const authData = await authRes.json();
      if (authData.success) { toast.success('Registration successful! Redirecting...'); router.push('/dashboard'); }
      else { toast.error('Session creation failed. Please log in manually.'); router.push('/login'); }
    } catch (error) {
      console.error('Session creation error:', error);
      toast.error('Could not create session. Please log in manually.');
      router.push('/login');
    }
  };

  const handleBelieverRegistration = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setRegisterInputValue((prev: RegisterInputType) => ({ ...prev, [id]: value }));
  };

  const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const properAddress = await getProperCaseAddress(registerInputValue.referral_address);
    try {
      if (!properAddress) { toast.error('Sponsor address invalid'); return; }
      const isSponserVerified = await isReferralAvalibale(properAddress!);
      if (!isSponserVerified) return;
      await registerInSmartContract(properAddress!);
    } catch (error) { setIsPending(false); } finally { setIsPending(false); }
  };

  useEffect(() => {
    if (url) { setQueryUrl(url); setRegisterInputValue({ referral_address: url }); setHasUpline(true); }
  }, [url]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 relative overflow-hidden">
      <ParticlesBackground />

      {/* ── Loading Overlay ── */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center gap-5 px-6"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl scale-150" />
              <FadeLoader color="#f97316" />
            </div>
            <div className="text-center max-w-sm">
              <p className="text-white font-semibold text-base mb-1">Processing Registration</p>
              <p className="text-slate-400 text-sm">
                Your transaction is being confirmed on the blockchain. Please don&#39;t close this window.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 gap-1.5 text-sm">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-slate-400 text-xs hidden sm:block">BNB Smart Chain</span>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">

            {/* ── Left: Brand & Info ── */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-7"
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Image src="/Web3x7.png" alt="Web3x Logo" width={100} height={100} className="drop-shadow-lg" />
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-orange-400 text-xs font-semibold tracking-widest uppercase mb-3">
                  Decentralized Ecosystem
                </p>
                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
                  Welcome to{' '}
                  <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-600 bg-clip-text text-transparent">
                    Web3x
                  </span>
                </h1>
                <p className="text-slate-400 text-base leading-relaxed max-w-md">
                  The flagship of decentralized systems, offering a wide range of innovative blockchain products and services.
                </p>
              </motion.div>

              {/* Feature cards — hidden on mobile */}
              <div className="hidden lg:flex flex-col gap-3">
                <FeatureCard icon={Users} title="Team & Sponsor" description="Register with a referral link and build your network with engaged members." delay={0.3} />
                <FeatureCard icon={TrendingUp} title="Royalty Program" description="Participate and earn rewards while maintaining the balance of our ecosystem." delay={0.4} />
                <FeatureCard icon={Coins} title="Horse Token" description="Experience seamless transactions with our native token, designed for efficiency and speed." delay={0.5} />
              </div>

              {/* Trust row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4 pt-1"
              >
                <TrustBadge icon={Shield} label="Secure & Audited" color="text-green-400" />
                <TrustBadge icon={Globe} label="BNB Smart Chain" color="text-blue-400" />
                <TrustBadge icon={Zap} label="Instant Processing" color="text-yellow-400" />
              </motion.div>
            </motion.div>

            {/* ── Right: Registration Card ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="w-full"
            >
              <Card className="bg-neutral-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 rounded-2xl overflow-hidden">
                {/* Card top accent */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

                <CardContent className="p-6 sm:p-8">
                  {/* Card header */}
                  <div className="mb-7">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 text-xs font-medium tracking-wide uppercase">New Registration</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      Join Web3x
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      {queryUrl ? 'Complete your registration with your sponsor' : 'Do you already have an upline?'}
                    </p>
                  </div>

                  {/* ── Step: Choose upline or not ── */}
                  {!queryUrl && hasUpline === null ? (
                    <div className="space-y-3">
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          onClick={() => setHasUpline(true)}
                          className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold border-0 shadow-lg shadow-orange-500/20"
                        >
                          Yes, I have a sponsor
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          onClick={() => setHasUpline(false)}
                          variant="outline"
                          className="w-full h-12 text-base border border-white/15 hover:bg-white/5 hover:border-white/25 text-slate-300 hover:text-white bg-transparent"
                        >
                          No, register without sponsor
                        </Button>
                      </motion.div>

                      <p className="text-xs text-slate-600 text-center pt-3">
                        By registering, you agree to our terms and conditions
                      </p>
                    </div>

                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={hasUpline ? 'with-upline' : 'no-upline'}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{ duration: 0.25 }}
                      >
                        {/* ── With Sponsor Form ── */}
                        {(hasUpline || queryUrl) ? (
                          <form onSubmit={onSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                              <Label htmlFor="referral_address" className="text-slate-300 text-sm font-medium">
                                Sponsor Wallet Address
                              </Label>
                              <Input
                                id="referral_address"
                                placeholder="0x742d35Cc6634C0532925a3b8D404d..."
                                value={queryUrl?.toLowerCase() || registerInputValue.referral_address}
                                onChange={handleBelieverRegistration}
                                disabled={!!queryUrl}
                                className="h-11 bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 rounded-xl text-sm transition-all disabled:opacity-60"
                                required
                              />
                              <p className="text-xs text-slate-500 flex items-center gap-1 pt-0.5">
                                <Lock className="w-3 h-3" />
                                Enter your sponsor&apos;s wallet address
                              </p>
                            </div>

                            {/* Fee notice */}
                            <div className="flex items-start gap-2.5 bg-orange-500/5 border border-orange-500/15 rounded-xl px-4 py-3">
                              <Coins className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Registration fee is paid in <span className="text-orange-400 font-medium">USDT</span>. You&apos;ll be prompted to approve USDT and confirm the transaction.
                              </p>
                            </div>

                            {activeAccount?.address ? (
                              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                <Button
                                  type="submit"
                                  disabled={isPending}
                                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/20 border-0 text-sm"
                                >
                                  {isPending ? (
                                    <span className="flex items-center gap-2">
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      Processing...
                                    </span>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Verify & Register
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            ) : (
                              <WalletConnect />
                            )}

                            {!queryUrl && (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setHasUpline(null)}
                                className="w-full text-slate-500 hover:text-slate-300 hover:bg-white/5 text-sm gap-1.5"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Go back
                              </Button>
                            )}
                          </form>

                        ) : (
                          /* ── Without Sponsor ── */
                          <div className="space-y-5">
                            <div className="bg-white/4 border border-white/8 rounded-xl p-4">
                              <p className="text-slate-300 text-sm leading-relaxed">
                                You&rsquo;ll be registered under the default developer sponsor address. The registration fee still applies.
                              </p>
                            </div>

                            {/* Fee notice */}
                            <div className="flex items-start gap-2.5 bg-orange-500/5 border border-orange-500/15 rounded-xl px-4 py-3">
                              <Coins className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Registration fee is paid in <span className="text-orange-400 font-medium">USDT</span>. Ensure you have sufficient USDT balance.
                              </p>
                            </div>

                            {activeAccount?.address ? (
                              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                <Button
                                  onClick={handleNoSponser}
                                  disabled={isPending}
                                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/20 border-0 text-sm"
                                >
                                  {isPending ? (
                                    <span className="flex items-center gap-2">
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      Processing...
                                    </span>
                                  ) : (
                                    <>
                                      Register Now
                                      <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            ) : (
                              <WalletConnect />
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setHasUpline(null)}
                              className="w-full text-slate-500 hover:text-slate-300 hover:bg-white/5 text-sm gap-1.5"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              Go back
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}

                  {/* Card footer */}
                  <div className="mt-7 pt-5 border-t border-white/8">
                    <p className="text-xs text-slate-600 text-center">
                      Need help?{' '}
                      <Link
                        href="https://t.me/Web3XSpaceOfficial"
                        target="_blank"
                        className="text-orange-400/80 hover:text-orange-400 transition-colors"
                      >
                        Contact Support on Telegram
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile feature cards */}
              <div className="lg:hidden mt-5 grid sm:grid-cols-2 gap-3">
                <FeatureCard icon={Users} title="Team & Sponsor" description="Build your network with engaged members" delay={0.3} />
                <FeatureCard icon={TrendingUp} title="Royalty Program" description="Earn rewards in our ecosystem" delay={0.4} />
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 text-center py-5 px-4"
      >
        <p className="text-slate-600 text-xs">
          © 2026 Web3X · Built on BNB Smart Chain ·{' '}
          <span className="text-slate-500">All rights reserved</span>
        </p>
      </motion.footer>
    </div>
  );
}