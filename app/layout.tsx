// Mainnet Performance Optimization - Day 4
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
  title: "Predinex Protocol",
  description: "Advanced decentralized prediction markets on Celo with native MiniPay support.",
  keywords: ["prediction market", "blockchain", "celo", "minipay", "defi", "betting", "crypto", "institutional defi"],
  authors: [{ name: "Predinex Core Team" }],
  creator: "Predinex",
  publisher: "Predinex Protocol",
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
  metadataBase: new URL('https://celo-predict-nine.vercel.app'),
  openGraph: {
    title: "Predinex: The Future of Celo-Native Markets",
    description: "Experience ultra-fast, decentralized markets on Celo. Optimized for MiniPay and institutional stability.",
    url: "https://celo-predict-nine.vercel.app",
    siteName: "Predinex Protocol",
    images: [
      {
        url: "/twitter-cover.png",
        width: 1200,
        height: 630,
        alt: "Predinex Protocol Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Predinex: High-Efficiency Markets on Celo",
    description: "The #1 decentralized prediction protocol on Celo. Fast, secure, and MiniPay-native.",
    creator: "@Predinex",
    images: ["/twitter-cover.png"],
  },
  other: {
    "talentapp:project_verification": "67a035441b296ed90b5d5a3f40a3e445bc2aa8107cdd5ab211a62309ae4070d3e9d52c51bfdc78bd3b6e08a945fc4ec1e91afbc43f4a1d2c2a662f5615287a66",
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
