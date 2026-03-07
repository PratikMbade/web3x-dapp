/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Crown, Star, Trophy, Zap, Shield, Gem } from 'lucide-react';

type CircleState = 'completed' | 'not-completed';

interface NetworkButton {
  id: number;
  state: CircleState;
  completedPhases: number;
}

interface Network {
  id: string;
  name: string;
  buttons: NetworkButton[];
}

interface UserNFTs {
  id: string;
  userId: string;
  tokenType: number;
  tokenId: number;
  mintDate: Date;
  royaltNFTId: string;
}

const tierIcons = [Crown, Star, Trophy, Zap, Shield, Gem];
const tierNames = ['JUST Creator', 'Genesis NFT', 'Unity NFT', 'Legacy NFT', 'Infinity NFT', 'Crown NFT'];
const tierColors = [
  'from-orange-600 to-amber-600',
  'from-slate-400 to-slate-300',
  'from-yellow-500 to-yellow-400',
  'from-cyan-500 to-blue-500',
  'from-purple-500 to-pink-500',
  'from-rose-500 to-red-500',
];

export default function NFTLevelShower({ nftData }: { nftData: UserNFTs | null }) {
  const [networks, setNetworks] = useState<Network[]>([]);

  useEffect(() => {
    const maxTokenType = nftData?.tokenType ?? -1;

    const networkData: Network[] = [
      {
        id: 'nft',
        name: 'Royalty NFT',
        buttons: Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          state: i <= maxTokenType ? 'completed' : 'not-completed',
          completedPhases: i <= maxTokenType ? 6 : 0,
        })),
      },
    ];

    setNetworks(networkData);
  }, [nftData]);

  const handleButtonClick = (networkId: string, buttonId: number) => {
    console.log(`Clicked button ${buttonId} in network ${networkId}`);
  };

  return (
    <div className="flex flex-col gap-8 w-full p-6 mx-auto">
      {networks.map((network) => (
        <motion.div
          key={network.id}
          className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 shadow-2xl overflow-hidden border border-purple-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />

          {/* Glow effects */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />

          <div className="relative p-8 lg:p-12">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-6">
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                    {network.name}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Current Tier: {tierNames[nftData?.tokenType ?? 0] || 'None'}
                  </p>
                </div>
              </motion.div>

              <Link href="/dashboard/nft">
                <Button className="group relative rounded-xl px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105">
                  <span className="flex items-center gap-2">
                    Manage NFTs
                    <Crown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>

            {/* Tier Progression */}
            <div className="mb-10">
              <div className="relative">
                {/* Connection line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700/50 -translate-y-1/2 hidden lg:block" />

                <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                  {network.buttons.map((button, index) => {
                    const Icon = tierIcons[index];
                    const isCompleted = button.state === 'completed';
                    const isCurrent = index === (nftData?.tokenType ?? -1);

                    return (
                      <motion.div
                        key={button.id}
                        className="relative"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <button
                          onClick={() => handleButtonClick(network.id, button.id)}
                          className="relative w-full group"
                        >
                          {/* Hexagonal container */}
                          <div className="relative aspect-square">
                            {/* Outer glow for current tier */}
                            {isCurrent && (
                              <motion.div
                                className={cn(
                                  'absolute inset-0 rounded-2xl blur-xl bg-gradient-to-br',
                                  tierColors[index]
                                )}
                                animate={{
                                  opacity: [0.3, 0.6, 0.3],
                                  scale: [1, 1.1, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                              />
                            )}

                            {/* Main card */}
                            <div
                              className={cn(
                                'relative h-full rounded-2xl transition-all duration-300 overflow-hidden',
                                isCompleted
                                  ? `bg-gradient-to-br ${tierColors[index]} shadow-xl border-2 border-white/20`
                                  : 'bg-slate-800/80 border-2 border-slate-700/50 hover:border-slate-600/50'
                              )}
                            >
                              {/* Shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                              {/* Content */}
                              <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
                                {/* Icon */}
                                <div
                                  className={cn(
                                    'mb-2 p-2 rounded-xl transition-transform group-hover:scale-110',
                                    isCompleted ? 'bg-white/20' : 'bg-slate-700/50'
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      'w-8 h-8',
                                      isCompleted ? 'text-white' : 'text-slate-500'
                                    )}
                                  />
                                </div>

                                {/* Tier number */}
                                <span
                                  className={cn(
                                    'text-3xl font-bold mb-1',
                                    isCompleted ? 'text-white' : 'text-slate-400'
                                  )}
                                >
                                  {button.id - 1}
                                </span>

                                {/* Tier name */}
                                <span
                                  className={cn(
                                    'text-xs font-semibold text-center',
                                    isCompleted ? 'text-white/90' : 'text-slate-500'
                                  )}
                                >
                                  {tierNames[index]}
                                </span>

                                {/* Current badge */}
                                {isCurrent && (
                                  <motion.div
                                    className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: 'spring' }}
                                  >
                                    Current
                                  </motion.div>
                                )}
                              </div>

                              {/* Particle effect for completed tiers */}
                              {isCompleted && (
                                <div className="absolute inset-0 pointer-events-none">
                                  {[...Array(3)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="absolute w-1 h-1 bg-white rounded-full"
                                      style={{
                                        left: `${20 + i * 30}%`,
                                        top: '50%',
                                      }}
                                      animate={{
                                        y: [-20, -40, -20],
                                        opacity: [0, 1, 0],
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.3,
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tier label below */}
                          <div className="mt-3 text-center">
                            <p
                              className={cn(
                                'text-xs font-medium',
                                isCompleted ? 'text-slate-300' : 'text-slate-500'
                              )}
                            >
                              Tier {button.id - 1}
                            </p>
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Current Tier</p>
                <p className="text-2xl font-bold text-white">
                  {tierNames[nftData?.tokenType ?? 0] || 'None'}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Total Tiers</p>
                <p className="text-2xl font-bold text-white">6</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm mb-1">Completion</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {Math.round(((nftData?.tokenType ?? 0) + 1) / 6 * 100)}%
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}