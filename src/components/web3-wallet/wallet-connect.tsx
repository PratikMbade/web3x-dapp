/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  ConnectButton,
  darkTheme,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from 'thirdweb/react';
import { client, MainnetChain } from '@/lib/client';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { createWallet } from 'thirdweb/wallets';
import { useWalletStore } from '@/store/walletState';
import { useAuth } from '@/hooks/useAuth';

export const TestnetChain = {
  id: 97,
  rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  nativeCurrency: {
    name: 'Binance Coin',
    symbol: 'BNB',
    decimals: 18,
  },
};

const wallets = [
  createWallet('io.metamask'),
  createWallet('pro.tokenpocket'),
  createWallet('com.safepal'),
  createWallet('com.trustwallet.app'),
  createWallet('com.coinbase.wallet'),
];

const WalletConnect = () => {
  const activeAccount = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const { data: session, isPending, isAuthenticated, refetch } = useAuth();

  const setActiveAccountAddress = useWalletStore(
    (state) => state.setActiveAccount
  );
  const walletConnected = useWalletStore((state) => state.walletConnected);
  const setWalletConnected = useWalletStore((state) => state.setWalletConnected);
  const setActiveWallet = useWalletStore((state) => state.setActiveWallet);
  const setSessionData = useWalletStore((state) => state.setSessionData);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const hasAttemptedAuth = useRef(false);
  const authInProgress = useRef(false);
  const shouldRedirect = useRef(false); // NEW: Flag to control redirect

  // Restore session data when session loads
  useEffect(() => {
    if (session?.user) {
      setActiveAccountAddress(session.user.wallet_address);
      setWalletConnected(true);
      setSessionData(session.user);
      hasAttemptedAuth.current = true;
      console.log('Session restored:', session.user);

      // NEW: Check if we should redirect after session restore
      if (shouldRedirect.current && session.user.isRegistered) {
        console.log('Redirecting to dashboard after session restore...');
        shouldRedirect.current = false; // Reset flag
        router.push('/dashboard');
      }
    }
  }, [session]);

  // Sign in with wallet
  async function onSignInWithCrypto() {
    if (!activeAccount?.address || authInProgress.current) {
      console.log('Cannot authenticate:', {
        hasAddress: !!activeAccount?.address,
        authInProgress: authInProgress.current
      });
      return;
    }

    if (hasAttemptedAuth.current || isAuthenticated) {
      console.log('Already authenticated, skipping...');
      return;
    }

    authInProgress.current = true;
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const address = activeAccount.address;
      console.log('=== Starting Authentication ===');
      console.log('Address:', address);

      setActiveAccountAddress(address);
      setWalletConnected(true);
      setActiveWallet(wallet);

      const timestamp = Date.now();
      const message = `Sign this message to authenticate with web3x.space\n\nWallet: ${address}\nTimestamp: ${timestamp}`;
      await new Promise(resolve => setTimeout(resolve, 1000)); // 2 second delay

      console.log('Step 1: Signing message...');
      const signature = await activeAccount.signMessage({ message });

      if (!signature || signature.length < 130) {
        throw new Error('Invalid signature format');
      }

      console.log('Step 2: Verifying signature...');
      const authResponse = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, message }),
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(authData.error || 'Authentication failed');
      }

      console.log('=== Authentication Successful ===');
      setSessionData(authData.user);
      hasAttemptedAuth.current = true;

      // NEW: Set redirect flag if user is registered
      if (authData.user.isRegistered) {
        console.log('User is registered, setting redirect flag...');
        shouldRedirect.current = true;
      }

      // Refetch session to update state
      // After refetch completes, the useEffect above will handle redirect
      await refetch();

    } catch (error: any) {
      console.error('=== Authentication Error ===');
      console.error('Error details:', error);

      const errorMessage = error.message || 'Authentication failed. Please try again.';
      setAuthError(errorMessage);
      alert(errorMessage);

      setActiveAccountAddress(null);
      setWalletConnected(false);
      setActiveWallet(null);
      hasAttemptedAuth.current = false;

      if (wallet) {
        disconnect(wallet);
      }
    } finally {
      setIsAuthenticating(false);
      authInProgress.current = false;
    }
  }

  // Disconnect wallet and sign out
  async function handleDisconnect() {
    try {
      console.log('Disconnecting wallet...');

      await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (wallet) {
        disconnect(wallet);
      }

      setActiveAccountAddress(null);
      setWalletConnected(false);
      setActiveWallet(null);
      setSessionData(null);
      setAuthError(null);
      hasAttemptedAuth.current = false;
      shouldRedirect.current = false; // Reset redirect flag

      // Refetch to clear session
      refetch();

      console.log('Disconnected successfully');
    const currentPath = window.location.pathname;
if (!currentPath.includes('/registration') && !currentPath.includes('/login')) {
  router.push('/');
}

    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (
      activeAccount?.address &&
      !isPending &&
      !isAuthenticated &&
      !authInProgress.current &&
      !hasAttemptedAuth.current
    ) {
      console.log('Wallet connected, triggering authentication...');

      const timer = setTimeout(() => {
        onSignInWithCrypto();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [activeAccount?.address, isPending, isAuthenticated]);

  return (
    <div className="w-full">
      {authError && (
        <div className="mb-2 text-red-500 text-xs text-center">
          {authError}
        </div>
      )}

      {walletConnected && isAuthenticated ? (
        <div className="flex items-center justify-center">
          <Button
            variant="destructive"
            size="sm"
            className="rounded-3xl py-1 px-14 lg:py-0"
            onClick={handleDisconnect}
            disabled={isAuthenticating}
            style={{
              width: '122px',
              height: '45px',
            }}
          >
            {isAuthenticating ? 'Loading...' : 'Disconnect'}
          </Button>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center text-[#f6901c]">
          <ConnectButton
            chain={MainnetChain}
            client={client}
            wallets={wallets}
            theme={darkTheme({
              colors: { primaryButtonBg: '#f6901c' },
            })}
            connectModal={{
              size: 'compact',
              title: 'Connect Wallet',
              showThirdwebBranding: false,
            }}
            connectButton={{
              label: isAuthenticating ? 'Authenticating...' : 'Connect Wallet',
              style: {
                width: '122px',
                height: '45px',
                borderRadius: '30px',
                color: '#fff',
                opacity: isAuthenticating ? 0.6 : 1,
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default WalletConnect;