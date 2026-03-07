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
import { client, PolygonMainnetChain } from '@/lib/client';
import WalletConnect from '../../web3-wallet/wallet-connect';
import { ethers } from 'ethers';
import { RegisterTypes } from './registration-main';
import { verifySponsor } from '@/actions/auth';
import { RegisterUserByAddType, saveUserInDB } from '@/actions/user';

// Animated grid background
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
  const [isFormSubmitted, setIsFormSubmitted] = useState(false); // State to track form submission

  // Remove these lines:
  // const [username, setUsername] = useState("")
  // const [email, setEmail] = useState("")

  const getProperCaseAddress = async (currentAddress: string) => {
    try {
      if (!activeAccount?.address) {
        toast('Connect your wallet', { icon: 'ℹ️' });
        return;
      }
      console.log('currentAddress', currentAddress);

      const contractInst = await contractInstance(activeAccount);

      const regIdRes = await contractInst.RegisterUserByAdd(currentAddress);

      const regId = regIdRes.toString(); // or regIdRes.toNumber() if safe (under JS number limit)

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

  const registerInSmartContract = async (properAddress: string) => {
    try {
      if (!activeAccount?.address) {
        toast('Connect your wallet', { icon: 'ℹ️' });
        setIsPending(false);
        return false;
      }

      console.log('contract function called..');
      setIsFormSubmitted(true); // Mark form as submitted

      const contractInst = await contractInstance(activeAccount);
      const isRegistered = await contractInst.register(newUserAddress);

      console.log('isRegistered', isRegistered);

      if (isRegistered) {
        toast.error('User Already Registered!');
        return false;
      }

      if (properAddress !== '0xA30224CA6A6004369114F6A027e8A829EDcDa501') {
        const isReferralExist = await contractInst.register(properAddress);

        if (!isReferralExist) {
          toast.error('Referral Address Not Registered!');
          return false;
        }
      }

      const signer = await ethers5Adapter.signer.toEthers({
        client,
        chain: PolygonMainnetChain,
        account: activeAccount!,
      });
      if (!signer) {
        toast.error('Signer not available');
        return false;
      }

      // const gasPrice = await signer.getGasPrice();
      // const gasFee = await contractInst.regFee();
      // console.log('gasFee',gasFee);
      // const gasFeeInWei = gasFee.toString(); // Always safe
      //       console.log('gasFeeInWei',gasFeeInWei);


      // const gasEstimate = await contractInst.estimateGas.registerUserByToken(
      //   newUserAddress,
      //   properAddress,
      //   {
      //     value: gasFeeInWei,
      //   }
      // );

      // const gasLimit = gasEstimate.mul(110).div(100); // 10% buffer

      const feeData = await signer.provider.getFeeData();
      const maxFeePerGas = feeData.maxFeePerGas!;
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas!;

      const buyPlanetResSC = await contractInst.registerUserByToken(
        newUserAddress,
        properAddress,
      );
      console.log('buyPlanetResSC', buyPlanetResSC);

      const receipt = await buyPlanetResSC.wait(1);

      if (receipt && receipt.status === 1) {
        const regIdRes = await contractInst.RegisterUserByAdd(
          newUserAddress.trim()
        );

        const regId = regIdRes.toString(); // or regIdRes.toNumber() if safe (under JS number limit)

        console.log('regIdRes', regId);

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
    } catch (error) {
 console.error('❌ Transaction Error:', error);

      return false;
    } finally {
      setIsPending(false);
    }
  };

  const isReferralAvalibale = async (wallet_address: string) => {
    try {
      console.log('wallet addrss', wallet_address);
      const res = await verifySponsor(wallet_address);

      if (res.success == true) {
        return true;
      }

      toast.error(res.msg);

      return false;
    } catch (error) {
      return false;
    }
  };

 const registerUser = async (data: RegisterUserByAddType) => {
    try {
      // ✅ Now call your backend API to register user

      const res = await saveUserInDB(data);
      const json = res;

      if (json.status === 200) {
        setIsPending(false);
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

  const onSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    if (!newUserAddress || !sponsorAddress) {
      setIsPending(false);

      toast.error('Please fill in all fields');
      return;
    }

    try {
      const sponsorProperAddress = await getProperCaseAddress(
        sponsorAddress.trim()
      );

      // test purpose


      // const isSponserVerified = await isReferralAvalibale(sponsorProperAddress!);
      let isSponserVerified = false;
      if(sponsorAddress === '0xA30224CA6A6004369114F6A027e8A829EDcDa501'){
isSponserVerified=true;
      }

      if (!isSponserVerified) {
        return;
      }

      const isProcessed = await registerInSmartContract(sponsorProperAddress!);
    } catch (error) {
      setIsPending(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <GridBackground />

      {/* Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 border border-purple-500/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-24 h-24 border border-blue-500/20 rounded-lg"
          animate={{ rotate: -360 }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full"
          animate={{ y: [-20, 20, -20] }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      </div>

      {isPending && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md bg-opacity-50 flex flex-col items-center justify-center">
          <FadeLoader color="#8B5CF6" />
          <span className="text-white font-semibold text-sm text-center lg:text-2xl mx-auto max-w-90 lg:max-w-6xl">
            Please wait, the transaction is in progress. Do not refresh the
            page.
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
          {/* Header Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-4xl font-semibold text-slate-300 mb-2">
                Register Other users
              </p>
            </motion.div>
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden p-5">
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
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Registration of New User
                      </h3>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6 mt-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <Label
                          htmlFor="new-user"
                          className="text-white font-medium flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4 text-green-400" />
                          New User Address
                        </Label>
                        <Input
                          id="new-user"
                          type="text"
                          placeholder="0xA30224CA6A6004369114F6A027e88..."
                          value={newUserAddress}
                          onChange={(e) => setNewUserAddress(e.target.value)}
                          className="  border-white/10 text-white placeholder:text-slate-400 focus:border-purple-400  focus:ring-2 focus:ring-purple-400/20 rounded-xl h-12 transition-all duration-300"
                          required
                        />
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Enter new user&lsquo;s wallet address to join network
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <Label
                          htmlFor="sponsor"
                          className="text-white font-medium flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4 text-green-400" />
                          Sponsor Address
                        </Label>
                        <Input
                          id="sponsor"
                          type="text"
                          placeholder="0x742d35Cc6634C0532925a3b8D404d..."
                          value={sponsorAddress}
                          onChange={(e) => setSponsorAddress(e.target.value)}
                          className="  border-white/10 text-white placeholder:text-slate-400 focus:border-purple-400  focus:ring-2 focus:ring-purple-400/20 rounded-xl h-12 transition-all duration-300"
                          required
                        />
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Enter your sponsor&lsquo;s wallet address to join
                          their network
                        </p>
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
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending}
                          >
                            {isPending ? 'Verifying...' : 'Register User'}
                          </Button>
                        ) : (
                          <div className="w-full flex items-center justify-center">
                            <WalletConnect />
                          </div>
                        )}


                        {/* <div className="flex flex-col items-center justify-center py-4">
                          <p className="text-yellow-300 text-center">
                            We are migrating from Polygon to BNB. Registration is temporarily paused.
                          </p>
                        </div> */}
                      </motion.div>
                    </form>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
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
