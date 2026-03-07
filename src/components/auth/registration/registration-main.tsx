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
  Sparkles,
  Users,
  TrendingUp,
  CheckCircle2,
  Coins,
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

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/50 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/60 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};

// Feature cards for the left side
const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-orange-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3 hover:bg-orange-500/20 transition-all duration-300"
  >
    <div className="flex items-start gap-4">
      <div className="p-2 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  </motion.div>
);

export interface RegisterTypes {
  wallet_address: string;
  sponser_address: string;
  registeredTime: number;
}

export interface RegisterInputType {
  referral_address: string;
}

function isSuccessResponse(
  response: SigninResponse
): response is SuccessResponse {
  return 'success' in response && response.success;
}

interface SuccessResponse {
  success: boolean;
}

interface ErrorResponse {
  error: any;
}

interface ValueTypes {
  publicAddress: string;
}
type SigninResponse = SuccessResponse | ErrorResponse;

export default function RegistrationMain() {
  const params = useSearchParams();
  const url = params.get('rr');
  const [queryUrl, setQueryUrl] = useState<string>();
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');
  const [registerInputValue, setRegisterInputValue] =
    useState<RegisterInputType>({ referral_address: '' });
  const activeAccount = useActiveAccount();
  const [isPending, setIsPending] = useState(false);
  const { connect, isConnecting } = useConnect();
  const [error, setError] = useState<string | null>();
  const [success, setSuccess] = useState<string | null>();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [hasUpline, setHasUpline] = useState<boolean | null>(null);

  const router = useRouter();

  const getProperCaseAddress = async (currentAddress: string) => {
    try {
      if (!activeAccount?.address) {
        toast('Connect your wallet', { icon: 'ℹ️' });
        return;
      }
      console.log('currentAddress', currentAddress);

      const contractInst = await contractInstance(activeAccount);

      const regIdRes = await contractInst.RegisterUserByAdd(currentAddress);

      const regId = regIdRes.toString();

      console.log('regIdRes', regId);

      const res = await contractInst.RegisterUerById(regId);
      const formattedUser = ethers.utils.getAddress(res._user);
      const formattedResponse: RegisterUserByAddType = {
        regId: Number(regId),
        user: formattedUser,
        upline: ethers.utils.getAddress(res._upline),
        uplineId: res._uplineid.toString(),
        teamCount: res._teamcount.toString(),
      };
      console.log('formattedResponse', formattedResponse);

      console.log('new address proper', formattedResponse.user);
      return formattedResponse.user;
    } catch (error) {
      console.log('error in getProperCaseAddress: ', error);
      return null;
    }
  };





  const isReferralAvalibale = async (wallet_address: string) => {
    try {
      console.log('wallet addrss', wallet_address);
      const res = await verifySponsor(wallet_address);

      if (res.success == true) {
        console.log('yes irs verified');
        setSuccess(res.msg);
        setError(null);

        return true;
      }

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
      const developerSponser: RegisterInputType = {
        referral_address: '0x2C7f4dB6A0B1df04EA8550c219318C7f2FF3D34C'.toLowerCase(),
      };

      setRegisterInputValue(developerSponser);

      const isProcessed = await registerInSmartContract(
        developerSponser.referral_address
      );
    } catch (error) {
      setIsPending(false);
    } finally {
      setIsPending(false);
    }
  };

const registerInSmartContract = async (properAddress: string) => {
  try {
    if (!activeAccount?.address) {
      toast('Connect your wallet', { icon: 'ℹ️' });
      return false;
    }

    setIsFormSubmitted(true);

    const contractInst = await contractInstance(activeAccount);

    // Check if user already registered
    const isRegistered = await contractInst.register(activeAccount.address);
    if (isRegistered) {
      toast.error('User Already Registered!');
      return false;
    }

    // Check referral exists
    if (properAddress.toLowerCase() !== '0x07a132a5F132619A9EA0A97e650F30d760C96b53'.toLowerCase()) {
      const isReferralExist = await contractInst.register(properAddress);
      if (!isReferralExist) {
        toast.error('Referral Not Registered!');
        return false;
      }
    }

    const signer = await ethers5Adapter.signer.toEthers({
      client,
      chain: MainnetChain,
      account: activeAccount!,
    });

    if (!signer) {
      toast.error('Signer not available');
      return false;
    }

    // Get USDT token address from contract
    const usdtAddress = "0x55d398326f99059fF775485246999027B3197955"
    console.log('Fee Token (USDT) address:', usdtAddress);

    // Get registration fee
    const regFee = await contractInst.regFee();
    console.log('regFee:', ethers.utils.formatUnits(regFee, 18));

    // Create USDT contract instance
    const usdtAbi = [
      'function balanceOf(address) view returns (uint256)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function decimals() view returns (uint8)',
    ];
    const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, signer);

    const decimals = await usdtContract.decimals();
    console.log('USDT decimals:', decimals);

    // Check USDT balance
    const usdtBalance = await usdtContract.balanceOf(activeAccount.address);
    console.log('USDT balance:', ethers.utils.formatUnits(usdtBalance, decimals));

    if (usdtBalance.lt(regFee)) {
      const required = ethers.utils.formatUnits(regFee, decimals);
      const current = ethers.utils.formatUnits(usdtBalance, decimals);
      toast.error(`Insufficient USDT. You have ${parseFloat(current).toFixed(2)} USDT but need ${required} USDT.`);
      return false;
    }

    // Check current allowance
    const contractAddress = contractInst.address;
    const allowance = await usdtContract.allowance(activeAccount.address, contractAddress);

    // Approve if needed
    if (allowance.lt(regFee)) {
      toast('Approving USDT... Please confirm in your wallet', { icon: 'ℹ️' });

      const approveTx = await usdtContract.approve(contractAddress, regFee);
      console.log('Approve tx sent:', approveTx.hash);

      const approveReceipt = await approveTx.wait();
      if (!approveReceipt || approveReceipt.status !== 1) {
        toast.error('USDT approval failed. Please try again.');
        return false;
      }

      console.log('USDT approved successfully');
      toast.success('USDT approved! Now registering...');
    }

    // Estimate gas for registration
    // registerUserByToken is payable but fee is in USDT so value = 0
    const gasEstimate = await contractInst.estimateGas.registerUserByToken(
      activeAccount.address,
      properAddress,
      { value: 0 }
    );

    const gasLimit = gasEstimate.mul(110).div(100);
    const feeData = await signer.provider.getFeeData();

    // Send registration tx
    toast('Registering... Please confirm in your wallet', { icon: 'ℹ️' });

    const tx = await contractInst.registerUserByToken(
      activeAccount.address,
      properAddress,
      {
        value: 0,                               // ✅ No BNB needed, fee is USDT
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas!,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!,
      }
    );

    console.log('Registration tx sent:', tx.hash);
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
      const json = res;

      if (json.status === 200) {
        setIsPending(false);
         await createSessionAndRedirect();
        toast.success('User registered successfully ');
      } else {
        toast.error(`Backend error: ${json.msg}`);
      }

      return;
    } catch (error) {
      console.error('Registration error:', error);
      setIsPending(false);

      if (error instanceof Error) {
        toast.error(`Registration failed: ${error.message}`);
      } else {
        toast.error('Registration failed: Unknown error');
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleBelieverRegistration = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setRegisterInputValue((prev: RegisterInputType) => ({
      ...prev,
      [id]: value,
    }));
  };

    const createSessionAndRedirect = async () => {
  try {
    if (!activeAccount?.address) return;

    // Sign a message to authenticate
    const message = `Sign in to Web3x\nWallet: ${activeAccount.address}\nTimestamp: ${Date.now()}`;

    const signature = await activeAccount.signMessage({ message });

    // Call wallet auth endpoint to create session
    const authRes = await fetch('/api/auth/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: activeAccount.address,
        signature,
        message,
      }),
    });

    const authData = await authRes.json();

    if (authData.success) {
      toast.success('Registration successful! Redirecting...');
      router.push('/dashboard');
    } else {
      toast.error('Session creation failed. Please log in manually.');
      router.push('/login');
    }
  } catch (error) {
    console.error('Session creation error:', error);
    toast.error('Could not create session. Please log in manually.');
    router.push('/login');
  }
};

  const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    console.log('registerInputValue', registerInputValue);

    const properAddress = await getProperCaseAddress(
      registerInputValue.referral_address
    );

    try {
      console.log('proper', properAddress);

      if (!properAddress) {
        toast.error('Sponsor address invalid');
        return;
      }

      const isSponserVerified = await isReferralAvalibale(properAddress!);

      if (!isSponserVerified) {
        return;
      }

      const isProcessed = await registerInSmartContract(properAddress!);
    } catch (error) {
      setIsPending(false);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (url) {
      setQueryUrl(url);
      setRegisterInputValue({ referral_address: url });
      setHasUpline(true);
      console.log('url', url);
    }
  }, [url]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 relative overflow-hidden">
            <ParticlesBackground />

      {/* Loading Overlay */}
      {isPending && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <FadeLoader color="#3b82f6" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white font-medium text-center mt-6 max-w-md text-sm md:text-base"
          >
            Processing your registration on the blockchain. Please don&#39;t close this window.
          </motion.p>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6">
        <Link href="/">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 border border-white/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-[calc(80vh-200px)] flex items-center justify-center p-2">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left Side - Information */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Logo & Title */}
              <div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className=""
                >
                  <Image
                    src="/Web3x7.png"
                    alt="web3x Logo"
                    width={120}
                    height={120}
                    className=""
                  />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-4xl lg:text-4xl font-bold text-white mb-4"
                >
                  Welcome to
                  <span className="block bg-gradient-to-r from-orange-500 to-amber-800 bg-clip-text text-transparent">
                    Web3x
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-300 text-lg max-w-xl"
                >
                  The flagship of decentralized systems, offering a wide range of innovative blockchain products and services.
                </motion.p>
              </div>

              {/* Feature Cards - Hidden on mobile */}
              <div className="hidden lg:block space-y-4">
                <FeatureCard
                  icon={Users}
                  title="Team & Sponsor"
                  description="Register with a referral link and build your network with engaged members."
                  delay={0.5}
                />
                <FeatureCard
                  icon={TrendingUp}
                  title="Royalty Program"
                  description="Participate and earn rewards while maintaining the balance of our ecosystem."
                  delay={0.6}
                />
                <FeatureCard
                  icon={Coins}
                  title="Horse Token"
                  description="Experience seamless transactions with our native token, designed for efficiency and speed."
                  delay={0.7}
                />
              </div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap items-center gap-6 pt-4"
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Secure & Audited</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">BNB Smart Chain</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm">Instant Processing</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Registration Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full"
            >
              <Card className="bg-neutral-800/50 backdrop-blur-xl border border-white/10 shadow-2xl">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Register for Web3x
                    </h2>
                    <p className="text-slate-400">
                      {queryUrl ? 'Complete your registration with your sponsor' : 'Do you already have an Upline?'}
                    </p>
                  </div>

                  {!queryUrl && hasUpline === null ? (
                    // Initial choice buttons
                    <div className="space-y-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => setHasUpline(true)}
                          className="w-full h-14 text-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 border-0"
                        >
                          Yes, I have a sponsor
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => setHasUpline(false)}
                          variant="outline"
                          className="w-full h-14 text-lg border-white/20 hover:bg-white/5 text-white"
                        >
                          No, register without sponsor
                        </Button>
                      </motion.div>

                      <p className="text-xs text-slate-500 text-center mt-6">
                        By registering, you agree to our terms and conditions
                      </p>
                    </div>
                  ) : (
                    // Form content
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={hasUpline ? 'with-upline' : 'no-upline'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {(hasUpline || queryUrl) ? (
                          // With sponsor form
                          <form onSubmit={onSubmit} className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor="referral_address" className="text-white text-sm">
                                Sponsor Wallet Address
                              </Label>
                              <Input
                                id="referral_address"
                                placeholder="0x742d35Cc6634C0532925a3b8D404d..."
                                value={queryUrl?.toLowerCase() || registerInputValue.referral_address}
                                onChange={handleBelieverRegistration}
                                disabled={!!queryUrl}
                                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                required
                              />
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Enter your sponsor&apos;s wallet address
                              </p>
                            </div>

                            {activeAccount?.address ? (
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                  type="submit"
                                  disabled={isPending}
                                  className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold"
                                >
                                  {isPending ? (
                                    <span className="flex items-center gap-2">
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      Processing...
                                    </span>
                                  ) : (
                                    <>
                                      Verify & Register
                                      <CheckCircle2 className="ml-2 w-5 h-5" />
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
                                className="w-full text-slate-400 hover:text-white hover:bg-white/5"
                              >
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Go back
                              </Button>
                            )}
                          </form>
                        ) : (
                          // Without sponsor
                          <div className="space-y-6">
                            <div className="bg-neutral-800/90 border border-neutral-500/20 rounded-xl p-4">
                              <p className="text-sm text-white">
                                You&rsquo;ll be registered with the default developer sponsor address.
                              </p>
                            </div>

                            {activeAccount?.address ? (
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                  onClick={handleNoSponser}
                                  disabled={isPending}
                                  className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold"
                                >
                                  {isPending ? 'Processing...' : 'Register Now'}
                                  <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                              </motion.div>
                            ) : (
                              <WalletConnect />
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setHasUpline(null)}
                              className="w-full text-slate-400 hover:text-white hover:bg-white/5"
                            >
                              <ArrowLeft className="mr-2 w-4 h-4" />
                              Go back
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}

                  {/* Bottom info */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-xs text-slate-500 text-center">
                      Need help using the Meta Whale platform?{' '}
                      <Link href="/support" className="text-blue-400 hover:text-blue-300">
                        Contact Support
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Feature Cards */}
              <div className="lg:hidden mt-6 space-y-3">
                <FeatureCard
                  icon={Users}
                  title="Team & Sponsor"
                  description="Build your network with engaged members"
                  delay={0.5}
                />
                <FeatureCard
                  icon={TrendingUp}
                  title="Royalty Program"
                  description="Earn rewards in our ecosystem"
                  delay={0.6}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 text-center py-6 text-slate-500 text-xs"
      >
        © 2026 Web3X. Built on BNB Smart Chain for the future of Web3.
      </motion.footer>
    </div>
  );
}