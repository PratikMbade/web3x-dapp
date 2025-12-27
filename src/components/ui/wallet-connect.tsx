/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { usePrivyAuthSync } from '@/hooks/use-privy-auth-sync';

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
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Connect Your Wallet
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Connect to BNB Chain and authenticate
                    </p>
                </div>
                <button
                    onClick={login}
                    className="px-8 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-semibold shadow-md hover:shadow-lg"
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-6 max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Wallet Connected
                    </h2>
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>

                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-3">Loading user data...</p>
                    </div>
                ) : (
                    <>
                        {/* Database User Info */}
                        {dbUser && (
                            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm font-semibold text-green-800">
                                        Authenticated in Database
                                    </p>
                                </div>
                                <div className="space-y-1 text-xs text-gray-700">
                                    <p>
                                        <span className="font-medium">DB ID:</span>{' '}
                                        {dbUser.id.slice(0, 12)}...
                                    </p>
                                    <p>
                                        <span className="font-medium">Registered:</span>{' '}
                                        {new Date(dbUser.createdAt).toLocaleString()}
                                    </p>
                                    {dbUser.chainId && (
                                        <p>
                                            <span className="font-medium">Chain:</span>{' '}
                                            {dbUser.chainId === 56 ? 'BSC Mainnet' : `Chain ${dbUser.chainId}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Wallet Address */}
                        {address && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Wallet Address:</p>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <p className="text-xs font-mono break-all text-gray-800">
                                        {address}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* BNB Balance */}
                        {balance && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                                <p className="text-sm font-medium text-gray-600 mb-1">BNB Balance</p>
                                <p className="text-3xl font-bold text-yellow-600">
                                    {parseFloat(formatEther(balance.value)).toFixed(4)}
                                    <span className="text-lg ml-1">BNB</span>
                                </p>
                            </div>
                        )}

                        {/* Network Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Network</p>
                                <p className="text-sm font-semibold text-gray-800">
                                    {chainId === 56 ? 'BSC Mainnet' : chainId === 97 ? 'BSC Testnet' : `Chain ${chainId}`}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Chain ID</p>
                                <p className="text-sm font-semibold text-gray-800">{chainId || 56}</p>
                            </div>
                        </div>

                        {/* Connected Wallets */}
                        {wallets.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-600">Connected Wallets:</p>
                                <div className="space-y-2">
                                    {wallets.map((wallet) => (
                                        <div
                                            key={wallet.address}
                                            className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="text-xs font-semibold text-blue-900">
                                                    {wallet.walletClientType}
                                                </p>
                                                <p className="text-xs text-gray-600 font-mono">
                                                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                                                </p>
                                            </div>
                                            {wallet.address.toLowerCase() === address?.toLowerCase() && (
                                                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Disconnect Button */}
                        <button
                            onClick={logout}
                            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                        >
                            Disconnect Wallet
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}