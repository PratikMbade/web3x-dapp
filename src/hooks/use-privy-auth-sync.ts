/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

export function usePrivyAuthSync() {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { address, chainId } = useAccount();

  useEffect(() => {
    if (authenticated && user && address) {
      // Sync Privy user with our database
      syncPrivyUser(user, address, chainId);
    }
  }, [authenticated, user, address, chainId]);

  return { user, authenticated };
}

async function syncPrivyUser(
  privyUser: any, 
  walletAddress: string,
  chainId?: number
) {
  try {
    const response = await fetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        privyUserId: privyUser.id,
        walletAddress: walletAddress,
        chainId: chainId || 56,
        name: `User ${walletAddress.slice(0, 6)}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sync user');
    }

    const data = await response.json();
    console.log('User synced:', data);
    return data;
  } catch (error) {
    console.error('Error syncing user:', error);
    throw error;
  }
}