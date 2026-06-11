import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/contexts/wallet-context";
import { ThemeProvider } from "@/contexts/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OrbitWork — Stellar Payments dApp",
  description:
    "Connect your Freighter wallet, check your XLM balance, and send payments on the Stellar Testnet. Built on Stellar blockchain.",
  keywords: ["Stellar", "XLM", "Freighter", "blockchain", "payments", "dApp"],
  authors: [{ name: "Oluwagbemiga Gbangbola" }],
  openGraph: {
    title: "OrbitWork — Stellar Payments dApp",
    description: "Send XLM on Stellar Testnet with Freighter wallet",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <WalletProvider>{children}</WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
