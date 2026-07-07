import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/contexts/wallet-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/navbar";
import { ExternalLink } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OrbitWork — Stellar Freelance Marketplace",
  description:
    "The Stellar freelance marketplace — jobs, payments, and reputation on-chain. Connect your Freighter wallet and start earning XLM.",
  keywords: ["Stellar", "XLM", "Freighter", "blockchain", "payments", "dApp", "freelance", "jobs"],
  authors: [{ name: "Oluwagbemiga Gbangbola" }],
  openGraph: {
    title: "OrbitWork — Stellar Freelance Marketplace",
    description: "Jobs, XLM payments, and reputation on the Stellar blockchain",
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
          <WalletProvider>
            <Navbar />
            <main className="relative z-10 flex-1">
              {children}
            </main>
            <SiteFooter />
          </WalletProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>
          OrbitWork · Built on{" "}
          <a
            href="https://stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Stellar
          </a>{" "}
          · Green Belt – Level 4
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Gbangbolaoluwagbemiga/orbitwork-stellar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            GitHub <ExternalLink className="size-3" />
          </a>
          <a
            href="https://laboratory.stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Stellar Lab <ExternalLink className="size-3" />
          </a>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Explorer <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
