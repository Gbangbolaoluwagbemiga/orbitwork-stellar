"use client";

import { useWallet } from "@/contexts/wallet-context";
import { OrbitLogo } from "@/components/orbit-logo";
import { Navbar } from "@/components/navbar";
import { BalanceCard } from "@/components/balance-card";
import { SendXLMForm } from "@/components/send-xlm-form";
import { WalletButton } from "@/components/wallet-button";

export default function Home() {
  const { isConnected, error, clearError } = useWallet();

  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />

      {/* Global error toast */}
      {error && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-sm max-w-sm w-full mx-4 animate-fade-in"
          style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span className="text-red-400">⚠</span>
          <p className="text-red-300 flex-1">{error}</p>
          <button
            onClick={clearError}
            className="text-red-400/60 hover:text-red-300 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <main className="relative z-10 flex-1">
        {!isConnected ? <LandingView /> : <DashboardView />}
      </main>

      <Footer />
    </div>
  );
}

/* ────────────────────────────────────────────
   Landing — shown before wallet is connected
──────────────────────────────────────────── */
function LandingView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-16 text-center">
      {/* Animated orbital logo */}
      <div className="animate-float animate-fade-in-up">
        <OrbitLogo size={200} />
      </div>

      {/* Title */}
      <div className="mt-8 space-y-3 animate-fade-in-up delay-100">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          <span className="shimmer-text">OrbitWork</span>
        </h1>
        <p className="text-xl text-white/50 font-light max-w-md">
          Seamless XLM payments on the{" "}
          <span className="text-indigo-400 font-medium">Stellar Network</span>
        </p>
      </div>

      {/* Description */}
      <p className="mt-6 max-w-lg text-white/40 leading-relaxed animate-fade-in-up delay-200">
        Connect your Freighter wallet to check your balance, send XLM
        transactions on Stellar Testnet, and track your payment history — all
        in one orbit.
      </p>

      {/* CTA */}
      <div className="mt-10 animate-fade-in-up delay-300">
        <WalletButton />
        <p className="mt-3 text-xs text-white/30">
          Requires{" "}
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-white/40 hover:text-white/60 transition-colors"
          >
            Freighter browser extension
          </a>
        </p>
      </div>

      {/* Feature cards */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full animate-fade-in-up delay-400">
        <FeatureCard
          icon="🔗"
          title="Wallet Connect"
          desc="Connect and disconnect your Freighter wallet securely"
        />
        <FeatureCard
          icon="💠"
          title="Live Balance"
          desc="Real-time XLM balance fetched directly from Stellar Horizon"
        />
        <FeatureCard
          icon="⚡"
          title="Fast Payments"
          desc="Send XLM in seconds with full transaction hash confirmation"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="p-5 rounded-2xl text-left space-y-2 hover:scale-105 transition-transform duration-200 cursor-default"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span className="text-2xl">{icon}</span>
      <h3 className="text-sm font-semibold text-white/80">{title}</h3>
      <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ────────────────────────────────────────────
   Dashboard — shown after wallet connects
──────────────────────────────────────────── */
function DashboardView() {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-10 space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <OrbitLogo size={52} />
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-sm text-white/40">
            Stellar Testnet · Freighter Connected
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Wallet balance */}
        <div className="space-y-6">
          <BalanceCard />

          {/* How-to steps */}
          <div
            className="rounded-2xl p-5 space-y-3 animate-fade-in-up delay-200"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Quick Guide
            </h4>
            <ol className="space-y-2 text-sm text-white/50">
              <li className="flex gap-2.5">
                <span className="text-indigo-400 font-mono">01</span>
                Fund your testnet account via the Faucet link above
              </li>
              <li className="flex gap-2.5">
                <span className="text-indigo-400 font-mono">02</span>
                Enter a valid Stellar testnet address as the destination
              </li>
              <li className="flex gap-2.5">
                <span className="text-indigo-400 font-mono">03</span>
                Specify an amount and confirm in Freighter
              </li>
              <li className="flex gap-2.5">
                <span className="text-indigo-400 font-mono">04</span>
                View your confirmed transaction on Stellar Explorer
              </li>
            </ol>
          </div>
        </div>

        {/* Right: Send XLM */}
        <div>
          <SendXLMForm />
        </div>
      </div>

      {/* Stellar info banner */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4 animate-fade-in-up delay-300"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(6,182,212,0.05) 100%)",
          border: "1px solid rgba(99,102,241,0.12)",
        }}
      >
        <div className="text-3xl">🌌</div>
        <div>
          <p className="text-sm font-medium text-white/70">
            Running on Stellar Testnet
          </p>
          <p className="text-xs text-white/35 mt-0.5">
            All transactions are on the test network. No real XLM is used.
            Switch Freighter to Testnet to interact with this dApp.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Footer
──────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      className="relative z-10 border-t py-6 px-4"
      style={{ borderColor: "rgba(255,255,255,0.05)" }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
        <p>
          OrbitWork · Built on{" "}
          <a
            href="https://stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400/70 hover:text-indigo-400 transition-colors"
          >
            Stellar
          </a>{" "}
          · White Belt – Level 1 Submission
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://laboratory.stellar.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60 transition-colors"
          >
            Stellar Lab
          </a>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60 transition-colors"
          >
            Explorer
          </a>
        </div>
      </div>
    </footer>
  );
}
