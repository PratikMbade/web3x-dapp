/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useAutoConnect } from "thirdweb/react";
import { client } from "@/lib/client";
import React, { useEffect } from "react";
import { createWallet } from "thirdweb/wallets";
import { useWalletStore } from "@/store/walletState";

// Define wallets data
const walletsData = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("io.zerion.wallet"),
    createWallet("pro.tokenpocket"),
];

const WalletConnectionProvider = ({ children }: { children: React.ReactNode }) => {
    const {
        walletConnected,
        setWalletConnected,
        activeAccount,
        setActiveAccount,
        activeWallet,
        setActiveWallet,
        sessionData,
        setSessionData,
    } = useWalletStore();

    const { data: autoConnectedWallet, isLoading } = useAutoConnect({
        client,
        wallets: walletsData,
        timeout: 2000,
        onConnect: (wallet) => {
            setWalletConnected(true);
            setActiveWallet(wallet);

            // Optional: Get account address from wallet object
            if (wallet?.getAccount) {
                setActiveAccount(wallet.getAccount()?.address || null);
            }

            console.log("Auto connected to wallet:", wallet);
        },
    });

    useEffect(() => {
        if (autoConnectedWallet && !isLoading) {
            setWalletConnected(true);
            console.log("Auto connected wallet (effect):", autoConnectedWallet);
        }
    }, [autoConnectedWallet, isLoading]);

    return <>{children}</>;
};

export default WalletConnectionProvider;
