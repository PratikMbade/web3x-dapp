/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type React from 'react';
import { FadeLoader } from 'react-spinners';
import { ChangeEvent, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Zap, Globe, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useActiveAccount } from 'thirdweb/react';
import { contractInstance } from '@/contract/contract';
import { ethers5Adapter } from 'thirdweb/adapters/ethers5';
import { client, MainnetChain } from '@/lib/client';
import WalletConnect from '../../web3-wallet/wallet-connect';
import { ethers } from 'ethers';
import { RegisterTypes } from './registration-main';
import { verifySponsor } from '@/actions/auth';
import { RegisterUserByAddType, saveUserInDB } from '@/actions/user';

const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";

const usdtAbi = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];

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

const registerInSmartContract = async (properSponsorAddress: string) => {
    try {
      if (!activeAccount?.address) {
        toast('Connect your wallet', { icon: 'ℹ️' });
        setIsPending(false);
        return false;
      }

      setIsFormSubmitted(true);

      const contractInst = await contractInstance(activeAccount);

      // Check if new user already registered
      const isRegistered = await contractInst.register(newUserAddress);
      if (isRegistered) {
        toast.error('User Already Registered!');
        return false;
      }

      // Check if sponsor is registered (skip for default sponsor)
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

      // Get registration fee from contract (in BNB/wei)
      const regFee = await contractInst.regFee();
      console.log('regFee (BNB):', ethers.utils.formatUnits(regFee, 18));

      // ✅ Check native BNB balance
      const bnbBalance = await signer.provider.getBalance(activeAccount.address);
      console.log('BNB balance:', ethers.utils.formatUnits(bnbBalance, 18));

      if (bnbBalance.lt(regFee)) {
        const required = ethers.utils.formatUnits(regFee, 18);
        const current = ethers.utils.formatUnits(bnbBalance, 18);
        toast.error(
          `Insufficient BNB. You have ${parseFloat(current).toFixed(4)} BNB but need ${parseFloat(required).toFixed(4)} BNB.`
        );
        return false;
      }

      // Estimate gas
      const gasEstimate = await contractInst.estimateGas.registerUserByToken(
        newUserAddress,
        properSponsorAddress,
        { value: regFee } // ✅ Pass BNB as value
      );

      const gasLimit = gasEstimate.mul(110).div(100);
      const feeData = await signer.provider.getFeeData();

      toast('Registering user... Please confirm in your wallet', { icon: 'ℹ️' });

      // ✅ Send registration tx with BNB value
      const tx = await contractInst.registerUserByToken(
        newUserAddress,
        properSponsorAddress,
        {
          value: regFee, // ✅ Send BNB instead of USDT
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
      }

      return true;
    } catch (error: any) {
      console.error('❌ Transaction Error:', error);

      const lower = String(error?.message || '').toLowerCase();

      if (lower.includes('insufficient funds')) {
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
        // Reset form
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
        return;
      }

      const isSponsorVerified = await isReferralAvailable(sponsorProperAddress);

      if (!isSponsorVerified) {
        return;
      }

      await registerInSmartContract(sponsorProperAddress);
    } catch (error) {
      setIsPending(false);
    } finally {
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
                        Registration fee will be charged in USDT from your wallet.
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