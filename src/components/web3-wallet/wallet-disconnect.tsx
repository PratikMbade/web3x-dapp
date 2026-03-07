'use client';

import { useActiveWallet, useDisconnect } from 'thirdweb/react';
import { Button } from '../ui/button';
import { useWalletStore } from '@/store/walletState';
import { useRouter } from 'next/navigation';

export default function WalletDisconnect() {
  const { disconnect } = useDisconnect();
  const wallet = useActiveWallet();
  const router = useRouter();

  const setWalletConnected = useWalletStore(
    (state) => state.setWalletConnected
  );
  const setActiveWallet = useWalletStore((state) => state.setActiveWallet);
  const setActiveAccountAddress = useWalletStore(
    (state) => state.setActiveAccount
  );

  async function handleDisconnect() {
    console.log('disconnecting wallet...');
    if (wallet) {
      disconnect(wallet);
      setActiveAccountAddress(null); // Reset Recoil state
      setWalletConnected(false);
      setActiveWallet(null);
      router.push('/login'); // Redirect to home page
      console.log('done');

    }
    console.log('wallet disconnected ', wallet);
  }

  return (
    <div className=" lg:flex items-center justify-center">
      <Button
        variant="outline"
        size="sm"
        className="rounded-3xl py-1 px-14 lg:py-0 "
        onClick={handleDisconnect}
      >
        Disconnect
      </Button>
    </div>
  );
}
