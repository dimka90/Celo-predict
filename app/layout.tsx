import type { Metadata } from "next";
import "./globals.css";
import "@/styles/appkit-custom.css";
import "@/styles/mobile-responsive.css";
import { Onest } from "next/font/google";
import WalletProvider from "@/providers/WalletProvider";
import AppContent from "./AppContent";
import ScrollToTopOnMount from "@/components/ScrollToTopOnMount";

const onest = Onest({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-onest",
});

export const metadata: Metadata = {
  title: "CeloPredict",
  description: "Decentralized prediction market on Celo with MiniPay integration",
  keywords: ["prediction market", "blockchain", "celo", "minipay", "defi", "betting", "crypto"],
  authors: [{ name: "CeloPredict Team" }],
  creator: "CeloPredict",
  publisher: "CeloPredict",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://predinex.vercel.app'),
  openGraph: {
    title: "CeloPredict - Decentralized Prediction Markets",
    description: "Trade on real-world outcomes with transparent, blockchain-powered markets on Celo with MiniPay",
    url: "https://celopredict.vercel.app",
    siteName: "CeloPredict",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Predinex - Prediction Markets",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Predinex - Decentralized Prediction Markets",
    description: "Trade on real-world outcomes with transparent, blockchain-powered markets",
    creator: "@predinex_",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${onest.className} ${onest.variable} flex min-h-screen flex-col bg-bg-main text-text-primary antialiased`}
      >
        <WalletProvider>
          <ScrollToTopOnMount />
          <AppContent>{children}</AppContent>
        </WalletProvider>
      </body>
    </html>
  );
}
