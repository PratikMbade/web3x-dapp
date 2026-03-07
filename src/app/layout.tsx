import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientProvider from "./provider"
import Head from "next/head"


export const metadata: Metadata = {
  metadataBase: new URL("https://web3x.space"),

  title: {
    default: "Web3X - BNB Smart Chain Blockchain Platform",
    template: "%s | Web3X",
  },

  description:
    "Web3X is a fully decentralized Web3 platform built on BNB Smart Chain offering transparent, peer-to-peer blockchain opportunities and smart contract powered ecosystem.",

  keywords: [
    "Web3X",
    "BNB Smart Chain",
    "Web3 platform",
    "Blockchain platform",
    "Decentralized finance",
    "BSC smart contracts",
    "crypto ecosystem",
    "web3 opportunities",
  ],

  verification: {
    google: "vBeeKQagOi6zprfmjs6JezsQE1sN7kVOJVwfDJPscwM",
  },

  alternates: {
    canonical: "https://web3x.space",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "Web3X - BNB Smart Chain Blockchain Platform",
    description:
      "Web3X is a decentralized blockchain ecosystem built on BNB Smart Chain enabling transparent and peer-to-peer smart contract opportunities.",
    url: "https://web3x.space",
    siteName: "Web3X",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Web3X Blockchain Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Web3X - BNB Smart Chain Blockchain Platform",
    description:
      "A decentralized Web3 ecosystem powered by BNB Smart Chain smart contracts.",
    images: ["/og-image.png"],
  },

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
      <Head>
        <meta name="google-site-verification" content="vBeeKQagOi6zprfmjs6JezsQE1sN7kVOJVwfDJPscwM"></meta>
      </Head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ClientProvider>
            {children}
          </ClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
