/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { usePrivyAuthSync } from '@/hooks/use-privy-auth-sync';
import { Button } from './button';

interface DbUser {
    id: string;
    walletAddress: string;
    privyUserId: string;
    chainId?: number;
    createdAt: string;
    accounts: Array<{
        provider: string;
        providerAccountId: string;
    }>;
}

export default function WalletConnect() {
    const { ready, authenticated, login, logout } = usePrivy();
    const { user } = usePrivyAuthSync(); // This syncs with DB
    const { wallets } = useWallets();
    const { address, chainId } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [dbUser, setDbUser] = useState<DbUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { data: balance } = useBalance({
        address: address,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch user from database
    useEffect(() => {
        if (authenticated && user) {
            setIsLoading(true);
            fetch('/api/users/me', {
                headers: {
                    'x-privy-user-id': user.id,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.user) {
                        setDbUser(data.user);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user:', error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setDbUser(null);
        }
    }, [authenticated, user]);

    if (!mounted || !ready) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="animate-pulse text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!authenticated) {
        return (
            <div className="flex flex-col items-center gap-4 p-6">
                <Button
                    onClick={login}
                >
                    Connect Wallet
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-6 max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg space-y-4">

                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-3">Loading user data...</p>
                    </div>
                ) : (
                    <>
                   

                    

                    

                      

                        {/* Disconnect Button */}
                        <button
                            onClick={logout}
                            className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                        >
                            Disconnect Wallet
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}