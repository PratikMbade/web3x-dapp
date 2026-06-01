/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type React from 'react';
import { FadeLoader } from 'react-spinners';
import { ChangeEvent, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Zap, Globe, X, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useActiveAccount } from 'thirdweb/react';
import { contractInstance, wbnbContractInstance, wbnbAddress } from '@/contract/contract';
import { HorseTokenContractAddress, getHorsePrice } from '@/contract/horse-token-contract/contract-instance';
import { ethers5Adapter } from 'thirdweb/adapters/ethers5';
import { client, MainnetChain } from '@/lib/client';
import WalletConnect from '../../web3-wallet/wallet-connect';
import { ethers } from 'ethers';
import { RegisterTypes } from './registration-main';
import { verifySponsor } from '@/actions/auth';
import { RegisterUserByAddType, saveUserInDB } from '@/actions/user';
import { isPackageBuyStored } from '@/actions/metaunity-system';
import { extractEventsFromReceipt, waitForPackageBuyEvent } from '@/contract/event-poller';

type PaymentMethod = 'hrs' | 'wbnb';

const GridBackground = () => (
  <div className="absolute inset-0 opacity-10">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
        linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
      `,
        backgroundSize: '50px 50px',
      }}
    />
  </div>
);

export default function RegisterOtherUser() {
  const [newUserAddress, setNewUserAddress] = useState('');
  const [sponsorAddress, setSponsorAddress] = useState('');
  const activeAccount = useActiveAccount();
  const [isPending, setIsPending] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingSponsor, setPendingSponsor] = useState<string | null>(null);

  const getProperCaseAddress = async (currentAddress: string) => {
    try {
      if (!activeAccount?.address) {
        toast('Connect your wallet', { icon: 'ℹ️' });
        return;
      }

      const contractInst = await contractInstance(activeAccount);
      const regIdRes = await contractInst.RegisterUserByAdd(currentAddress);
      const regId = regIdRes.toString();

      const res = await contractInst.RegisterUerById(regId);
      const formattedUser = ethers.utils.getAddress(res._user);
      const formattedResponse: RegisterUserByAddType = {
        regId: Number(regId),
        user: formattedUser.toLowerCase(),
        upline: ethers.utils.getAddress(res._upline).toLowerCase(),
        uplineId: res._uplineid.toString(),
        teamCount: res._teamcount.toString(),
      };

      return formattedResponse.user;
    } catch (error) {
      console.log('error in getProperCaseAddress: ', error);
      return null;
    }
  };

  const registerInSmartContract = async (properSponsorAddress: string, method: PaymentMethod) => {
    try {
      if (!activeAccount?.address) {
        toast('Connect your wallet', { icon: 'ℹ️' });
        setIsPending(false);
        return false;
      }

      setIsFormSubmitted(true);

      const contractInst = await contractInstance(activeAccount);

      const isRegistered = await contractInst.register(newUserAddress);
      if (isRegistered) {
        toast.error('User Already Registered!');
        return false;
      }

      if (properSponsorAddress.toLowerCase() !== '0x07a132a5f132619a9ea0a97e650f30d760c96b53'.toLowerCase()) {
        const isReferralExist = await contractInst.register(properSponsorAddress);
        if (!isReferralExist) {
          toast.error('Referral Address Not Registered!');
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

      const regFee = await contractInst.regFee();
      console.log('regFee (BNB):', ethers.utils.formatUnits(regFee, 18));

      const bnbBalance = await signer.provider.getBalance(activeAccount.address);
      console.log('BNB balance:', ethers.utils.formatUnits(bnbBalance, 18));

      // ── Token approval ────────────────────────────────────────────────────
      if (method === 'hrs') {
        const HORSE_TOKEN_ABI = [
          'function approve(address spender, uint256 amount) external returns (bool)',
          'function allowance(address owner, address spender) external view returns (uint256)',
          'function balanceOf(address account) external view returns (uint256)',
        ];
        const horseTokenContract = new ethers.Contract(HorseTokenContractAddress, HORSE_TOKEN_ABI, signer);
        const hrsPrice = await getHorsePrice();
        const hrsFor5USD = hrsPrice > 0 ? Math.ceil(5.5 / hrsPrice) : 30;
        const horseApprovalAmount = ethers.utils.parseUnits(hrsFor5USD.toString(), 18);

        const hrsBalance = await horseTokenContract.balanceOf(activeAccount.address);
        if (hrsBalance.lt(horseApprovalAmount)) {
          const have = parseFloat(ethers.utils.formatUnits(hrsBalance, 18)).toFixed(4);
          toast.error(`Insufficient HRS balance. You have ${have} HRS but need ~${hrsFor5USD} HRS.`);
          setIsPending(false);
          return false;
        }

        const currentAllowance = await horseTokenContract.allowance(activeAccount.address, contractInst.address);

        if (currentAllowance.lt(horseApprovalAmount)) {
          toast('Approving HRS Token... Please confirm in your wallet', { icon: 'ℹ️' });
          const approveTx = await horseTokenContract.approve(contractInst.address, horseApprovalAmount);
          toast('Waiting for HRS approval...', { icon: '⏳' });
          const approveReceipt = await approveTx.wait(1);
          if (!approveReceipt || approveReceipt.status !== 1) {
            toast.error('HRS Token approval failed. Please try again.');
            return false;
          }
          toast.success('✅ HRS Token approved successfully');
        } else {
          console.log('Sufficient HRS allowance already exists');
        }
      } else {
        const wbnbInst = await wbnbContractInstance(activeAccount);
        if (!wbnbInst) {
          toast.error('Could not connect to WBNB contract');
          return false;
        }
        // Fetch live BNB price via PancakeSwap and calculate WBNB amount worth > $5 USD
        const PANCAKE_ROUTER = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
        const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955';
        const rpcProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
        const pancake = new ethers.Contract(PANCAKE_ROUTER, ['function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)'], rpcProvider);
        let bnbPriceUSD = 600;
        try {
          const out = await pancake.getAmountsOut(ethers.utils.parseEther('1'), [wbnbAddress, USDT_BSC]);
          bnbPriceUSD = parseFloat(ethers.utils.formatUnits(out[1], 18));
        } catch { /* use fallback */ }
        const wbnbFor5USD = bnbPriceUSD > 0 ? (5.5 / bnbPriceUSD) : 0.02;
        const wbnbApprovalAmount = ethers.utils.parseEther(wbnbFor5USD.toFixed(10));
        toast('Approving WBNB... Please confirm in your wallet', { icon: 'ℹ️' });
        const approveTx = await wbnbInst.approve(contractInst.address, wbnbApprovalAmount);
        toast('Waiting for WBNB approval...', { icon: '⏳' });
        const approveReceipt = await approveTx.wait(1);
        if (!approveReceipt || approveReceipt.status !== 1) {
          toast.error('WBNB approval failed. Please try again.');
          return false;
        }
        toast.success('✅ WBNB approved successfully');
      }

      // ── Gas estimate & registration tx ────────────────────────────────────
      const tokenParam = method === 'hrs' ? 1 : 2;

      const gasEstimate = await contractInst.estimateGas.registerUserByToken(
        newUserAddress,
        properSponsorAddress,
        tokenParam,
        { value: regFee }
      );
      const gasLimit = gasEstimate.mul(110).div(100);
      const feeData = await signer.provider.getFeeData();

      toast('Registering user... Please confirm in your wallet', { icon: 'ℹ️' });

      const tx = await contractInst.registerUserByToken(
        newUserAddress,
        properSponsorAddress,
        tokenParam,
        {
          value: regFee,
          gasLimit,
          maxFeePerGas: feeData.maxFeePerGas!,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas!,
        }
      );

      console.log('Registration tx sent:', tx.hash);
      const receipt = await tx.wait(1);

      if (receipt && receipt.status === 1) {
        const regIdRes = await contractInst.RegisterUserByAdd(newUserAddress.trim());
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

        const isTranxDone = await isPackageBuyStored(receipt.transactionHash, formattedUser.toLowerCase());

        if (!isTranxDone) {
          const responses = await waitForPackageBuyEvent(receipt.transactionHash, formattedUser.toLowerCase());

          if (!responses.length) {
            toast.error('Transaction failed, please try again');
            setIsPending(false);
            return;
          }

          const has200 = responses.some((r) => r.statusCode === 200);
          const all201 = responses.every((r) => r.statusCode === 201);

          if (has200) {
            const evRes = await extractEventsFromReceipt(receipt.transactionHash, formattedUser.toLowerCase());
            if (!evRes) { toast.error('Event parsing failed'); setIsPending(false); return; }
            toast.success('✅ Transaction completed successfully');
          } else if (all201) {
            toast.success('✅ Transaction already processed');
          } else {
            toast.success('✅ Transaction completed successfully');
            setIsPending(false);
            return;
          }
        }
      }

      return true;
    } catch (error: any) {
      console.error('❌ Transaction Error:', error);
      const lower = String(error?.message || '').toLowerCase();

      const errData: string = (error as any)?.error?.error?.data ?? (error as any)?.data ?? '';
      if (typeof errData === 'string' && errData.startsWith('0xe450d38c')) {
        try {
          const iface = new ethers.utils.Interface(['error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)']);
          const decoded = iface.decodeErrorResult('ERC20InsufficientBalance', errData);
          const have = parseFloat(ethers.utils.formatUnits(decoded.balance, 18)).toFixed(4);
          const need = parseFloat(ethers.utils.formatUnits(decoded.needed, 18)).toFixed(4);
          toast.error(`Insufficient HRS balance. You have ${have} HRS but need ${need} HRS.`);
        } catch { toast.error('Insufficient token balance for registration.'); }
      } else if (lower.includes('insufficient funds')) {
        toast.error('Insufficient BNB for gas fees.');
      } else if (lower.includes('user rejected') || lower.includes('denied')) {
        toast.error('Transaction rejected.');
      } else if (error?.reason) {
        toast.error(error.reason);
      } else {
        toast.error('Registration failed. Please try again.');
      }

      return false;
    } finally {
      setIsPending(false);
    }
  };

  const isReferralAvailable = async (wallet_address: string) => {
    try {
      const res = await verifySponsor(wallet_address);
      if (res.success === true) return true;
      toast.error(res.msg);
      return false;
    } catch (error) {
      return false;
    }
  };

  const registerUser = async (data: RegisterUserByAddType) => {
    try {
      const res = await saveUserInDB(data);
      if (res.status === 200) {
        setIsPending(false);
        toast.success('User registered successfully!');
        setNewUserAddress('');
        setSponsorAddress('');
      } else {
        toast.error(`Backend error: ${res.msg}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        toast.error(`Registration failed: ${error.message}`);
      } else {
        toast.error('Registration failed: Unknown error');
      }
    } finally {
      setIsPending(false);
    }
  };

  const handlePaymentSelect = async (method: PaymentMethod) => {
    setShowPaymentModal(false);
    if (!pendingSponsor) return;
    setIsPending(true);
    await registerInSmartContract(pendingSponsor, method);
    setPendingSponsor(null);
  };

  const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    if (!newUserAddress || !sponsorAddress) {
      setIsPending(false);
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const sponsorProperAddress = await getProperCaseAddress(sponsorAddress.trim());

      if (!sponsorProperAddress) {
        toast.error('Sponsor address invalid or not registered');
        setIsPending(false);
        return;
      }

      const isSponsorVerified = await isReferralAvailable(sponsorProperAddress);
      if (!isSponsorVerified) {
        setIsPending(false);
        return;
      }

      // Validation passed — stop spinner and show payment modal
      setIsPending(false);
      setPendingSponsor(sponsorProperAddress);
      setShowPaymentModal(true);
    } catch (error) {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GridBackground />

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 border border-purple-500/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-24 h-24 border border-blue-500/20 rounded-lg"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full"
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
      </div>

      {isPending && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md bg-opacity-50 flex flex-col items-center justify-center">
          <FadeLoader color="#8B5CF6" />
          <span className="text-white font-semibold text-sm text-center lg:text-2xl mx-auto max-w-90 lg:max-w-6xl">
            Please wait, the transaction is in progress. Do not refresh the page.
          </span>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/75 flex items-center justify-center p-4">
          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #1a1a1a 0%, #111111 100%)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.8)',
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)' }}
            />

            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div>
                <p className="text-white font-semibold text-base">Select Payment Method</p>
                <p className="text-neutral-500 text-xs mt-0.5">Choose how to pay the registration fee</p>
              </div>
              <button
                onClick={() => { setShowPaymentModal(false); setPendingSponsor(null); }}
                className="text-neutral-500 hover:text-white transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mx-5 h-px bg-white/5" />

            <div className="p-5 space-y-3">
              {/* HRS Option */}
              <button
                onClick={() => handlePaymentSelect('hrs')}
                className="w-full rounded-xl p-4 text-left transition-all duration-150 active:scale-[0.98]"
                style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(249,115,22,0.15)' }}
                    >
                      <Coins className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">HRS Token</p>
                      <p className="text-neutral-500 text-xs">Horse Token</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-400 text-xs">Pay with HRS</p>
                  </div>
                </div>
              </button>

              {/* WBNB Option */}
              <button
                onClick={() => handlePaymentSelect('wbnb')}
                className="w-full rounded-xl p-4 text-left transition-all duration-150 active:scale-[0.98]"
                style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(234,179,8,0.15)' }}
                    >
                      <Coins className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">WBNB</p>
                      <p className="text-neutral-500 text-xs">Wrapped BNB</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-400 text-xs">Pay with WBNB</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="px-5 pb-5">
              <p className="text-neutral-600 text-xs text-center">
                Approval required before registration completes
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <p className="text-4xl font-semibold text-slate-300 mb-2">Register Other Users</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 rounded-xl overflow-hidden p-5">
              <CardContent className="mt-6 p-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="new"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">Registration of New User</h3>
                      <p className="text-slate-400 text-sm">
                        Registration fee will be charged from your wallet. Choose HRS or WBNB to pay.
                      </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6 mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="new-user" className="text-white font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-400" />
                          New User Address
                        </Label>
                        <Input
                          id="new-user"
                          type="text"
                          placeholder="Enter new user's wallet address"
                          value={newUserAddress}
                          onChange={(e) => setNewUserAddress(e.target.value)}
                          className="border-white/10 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 rounded-xl h-12 transition-all duration-300"
                          required
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="sponsor" className="text-white font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-400" />
                          Sponsor Address
                        </Label>
                        <Input
                          id="sponsor"
                          type="text"
                          placeholder="Enter sponsor's wallet address"
                          value={sponsorAddress}
                          onChange={(e) => setSponsorAddress(e.target.value)}
                          className="border-white/10 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 rounded-xl h-12 transition-all duration-300"
                          required
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="pt-4"
                      >
                        {activeAccount?.address ? (
                          <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Processing...' : 'Register User'}
                          </Button>
                        ) : (
                          <div className="w-full flex items-center justify-center">
                            <WalletConnect />
                          </div>
                        )}
                      </motion.div>
                    </form>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-8 space-y-2"
          >
            <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Secure
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Fast
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                Decentralized
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
