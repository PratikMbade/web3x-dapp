'use client';

import React, { Suspense } from 'react';
import { Toaster } from 'sonner';
import { ThirdwebProvider } from 'thirdweb/react';
import { ThemeProvider } from '@/components/theme-provider';
import { usePathname } from 'next/navigation';
import ZoomPreventer from '@/components/ui/zoom-preventer';
import WalletConnectionProvider from '@/helper/custom-wallet-provider';
import { Navbar } from '@/components/home-page/navbar';
import { ScrollProgress } from '@/components/home-page/scroll-progress';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHide =
        pathname.startsWith('/registration') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/dashboard');

    return (
            <Suspense>
            <ThirdwebProvider>

                {!isHide && <ScrollProgress />}
                {!isHide &&  <Navbar />}

                    <WalletConnectionProvider>
                        {/* Single ThemeProvider here — keep it consistent */}
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="dark"
                            enableSystem
                            disableTransitionOnChange
                        >
                            <ZoomPreventer>{children}</ZoomPreventer>
                        </ThemeProvider>
                    </WalletConnectionProvider>
                </ThirdwebProvider>

                <Toaster position="top-center" richColors closeButton />
            </Suspense>
    );
}
