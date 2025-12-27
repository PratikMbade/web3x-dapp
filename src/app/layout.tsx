import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import PrivyProviderWrapper from "@/components/providers/privy-provider"



export const metadata: Metadata = {
  title: "Web3X - BNB Smart Chain Blockchain Platform",
  description:
    "Web3X is a 100% decentralized, transparent, and peer-to-peer platform built on BNB Smart Chain blockchain.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3BA2F" },
    { media: "(prefers-color-scheme: dark)", color: "#1E2329" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <PrivyProviderWrapper>
            {children}
          </PrivyProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
