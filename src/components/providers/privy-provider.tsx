/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bsc } from 'viem/chains';
import { http } from 'wagmi';
import { createConfig } from '@privy-io/wagmi';

const queryClient = new QueryClient();

// Configure Wagmi for BNB Chain only
export const config = createConfig({
    chains: [bsc],
    transports: {
        [bsc.id]: http(),
    },
});

export default function PrivyProviderWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={{
                // Customize appearance
                appearance: {
                    theme: 'dark',
                    accentColor: '#676FFF',
                    logo: 'https://res.cloudinary.com/dobxwy6ty/image/upload/v1766304789/Web3x7_ukqa1c.png',
                },
                // Enable embedded wallets for Ethereum/EVM chains only
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets',
                    },
                },
                // Supported login methods
                loginMethods: ['wallet'],
                // Default chain - BNB Chain
                defaultChain: bsc,
                // Only support EVM chains (no Solana)
                supportedChains: [bsc],
                // Explicitly disable Solana
                externalWallets: {
                    solana: {
                        connectors: {
                            onMount: () => { /* no-op */ },
                            onUnmount: () => { /* no-op */ },
                            get: () => ([] as any[]),
                        },
                    },
                },
            }}
        >
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={config}>
                    {children}
                </WagmiProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
}