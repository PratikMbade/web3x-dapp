/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Rocket, Lock, CheckCircle2, Sparkles } from 'lucide-react';

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

type Props = {
  highestPackage: number;
};

export default function MetaSystemLevelShower(props: Props) {
  const [networks, setNetworks] = useState<Network[]>([
    {
      id: 'Web3X',
      name: 'M & N',
      buttons: Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        state: i < props.highestPackage ? 'completed' : 'not-completed',
        completedPhases: 12,
      })),
    },
  ]);

  const handleButtonClick = (networkId: string, buttonId: number) => {
    console.log(`Clicked button ${buttonId} in network ${networkId}`);
  };

  return (
    <div className="flex flex-col gap-8 w-full p-6 mx-auto">
      {networks.map((network) => (
        <motion.div
          key={network.id}
          className="relative rounded-xl  shadow-2xl overflow-hidden border "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-yellow-500/5 animate-pulse" />

          {/* Glow effect */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl" />

          <div className="relative p-8 lg:p-12">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-6">
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    {network.name}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {props.highestPackage} of 12 packages unlocked
                  </p>
                </div>
              </motion.div>

              <Link href="/dashboard/web3x-system/MN-packages">
                <Button className="group relative rounded-xl px-8 py-6 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105">
                  <span className="flex items-center gap-2">
                    View Details
                    <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Overall Progress</span>
                <span className="text-sm font-bold text-orange-400">
                  {Math.round((props.highestPackage / 12) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-600/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-400 rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${(props.highestPackage / 12) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Grid of Packages */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.3 }}
            >
              {network.buttons.map((button, index) => (
                <motion.div
                  key={button.id}
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <button
                    onClick={() => handleButtonClick(network.id, button.id)}
                    className={cn(
                      'relative w-full aspect-square rounded-2xl transition-all duration-300 overflow-hidden',
                      button.state === 'completed'
                        ? 'bg-gradient-to-br from-orange-500/20 via-yellow-500/20 to-orange-500/20 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20'
                        : 'bg-slate-800/50 border-2 border-slate-700/50 hover:border-slate-600/50'
                    )}
                  >
                    {/* Animated background for completed items */}
                    {button.state === 'completed' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-yellow-500/30"
                        animate={{
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    )}

                    {/* Content */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
                      {button.state === 'completed' ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-orange-400 mb-2" />
                          <span className="text-2xl font-bold text-white mb-1">
                            {button.id}
                          </span>
                          <span className="text-xs font-medium text-orange-300">
                            Unlocked
                          </span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-8 h-8 text-slate-500 mb-2" />
                          <span className="text-2xl font-bold text-slate-400 mb-1">
                            {button.id}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            Locked
                          </span>
                        </>
                      )}
                    </div>

                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </div>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}