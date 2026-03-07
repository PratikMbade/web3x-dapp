/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  Shield, Zap, Globe, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import WalletConnect from '@/components/web3-wallet/wallet-connect';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ParticlesBackground } from '@/components/home-page/particles-background';

const FloatingParticles = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  const particles = Array.from({ length: 20 }, (_, i) => i);

  if (!dimensions.width || !dimensions.height) return null; // Avoid rendering on SSR

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          animate={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

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

export default function LoginMain() {
  // Remove these lines:
  // const [username, setUsername] = useState("")
  // const [email, setEmail] = useState("")

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);





  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900/10 to-orange-800/10 relative overflow-hidden">
      <div className='w-full  flex items-start justify-start mt-5 ml-5 z-50'>
        <Link href='/' className='z-50'>
          <Button variant={'outline'} className='z-50'>
            <ArrowLeft className="ml-2 w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Animated background elements */}
            <ParticlesBackground />



      {/* Mouse follower effect */}
      <motion.div
        className="fixed w-96 h-96 rounded-full pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          x: 0,
          y: 0,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 30 }}
      />

      {/* Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 border border-orange-500/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-24 h-24 border border-orange-500/20 rounded-lg"
          animate={{ rotate: -360 }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-orange-500/10 to-orange-500/10 rounded-full"
          animate={{ y: [-20, 20, -20] }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      </div>

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
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.2,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              className="relative inline-block mb-6"
            ></motion.div>

            <h1 className="text-6xl font-bold text-orange-600 tracking-tight mb-2">
              Web3X
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-2 text-sm text-orange-400">
                <Globe className="w-4 h-4" />
                <span>Powered by BNB Smart Chain Network</span>
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
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

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <div className="wrounded-2xl flex items-center justify-center ">
                          <Image
                          src="/Web3x7.png"
                          alt="web3x Logo"
                            width={80}
                            height={80}
                          />{' '}
                        </div>

                        <div className="space-y-4 flex flex-col items-center justify-center">
                          <h3 className="text-2xl font-bold text-white">
                            Welcome Back
                          </h3>
                          <p className="text-slate-300 text-center max-w-sm mx-auto">
                            Connect your wallet to access your Web3x
                            dashboard and continue your journey
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="pt-4"
                      >
                        <WalletConnect/>
                      </motion.div>
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
            <p className="text-slate-500 text-xs">
              © 2026 Web3X. Built on BNB Smart Chain for the future of Web3.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
