"use client";

import Link from "next/link";
import { OrbitLogo } from "@/components/orbit-logo";
import { WalletButton } from "@/components/wallet-button";

export default function LandingPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 py-16 text-center overflow-hidden">
      {/* Orbital ring decoration */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "560px",
          height: "560px",
          borderRadius: "50%",
          border: "1px solid rgba(99,102,241,0.08)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          border: "1px solid rgba(6,182,212,0.06)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Gradient blobs */}
      <div
        className="absolute pointer-events-none opacity-20"
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(60px)",
        }}
      />

      {/* Animated orbital logo */}
      <div className="animate-float animate-fade-in-up relative z-10">
        <OrbitLogo size={180} />
      </div>

      {/* Title */}
      <div className="mt-8 space-y-3 animate-fade-in-up delay-100 relative z-10">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
          <span className="shimmer-text">OrbitWork</span>
        </h1>
        <p className="text-xl sm:text-2xl font-light max-w-lg mx-auto" style={{ color: "var(--text-3)" }}>
          The Stellar freelance marketplace —{" "}
          <span className="text-indigo-400 font-medium">jobs, payments, and reputation on-chain</span>
        </p>
      </div>

      {/* Description */}
      <p className="mt-6 max-w-xl leading-relaxed animate-fade-in-up delay-200 relative z-10" style={{ color: "var(--text-4)" }}>
        Connect any Stellar wallet to browse open jobs, send XLM payments, register
        work orders on-chain, and build your on-chain freelance reputation — all in one orbit.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300 relative z-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base text-white transition-all duration-200 hover:scale-105 hover:shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #6366f1, #7c3aed)",
            boxShadow: "0 0 30px rgba(99,102,241,0.35)",
          }}
        >
          Launch App
          <span className="text-lg">→</span>
        </Link>
        <WalletButton />
      </div>

      <p className="mt-4 text-xs animate-fade-in-up delay-400 relative z-10" style={{ color: "var(--text-5)" }}>
        Supports Freighter · Albedo · xBull · Rabet · Hana · LOBSTR
      </p>

      {/* Feature cards 2×2 grid */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full animate-fade-in-up delay-400 relative z-10">
        <FeatureCard
          icon="📋"
          title="Job Board"
          desc="Browse open work orders or post your own. All jobs are stored immutably on the Stellar blockchain via the OrbitRegistry contract."
          color="#06b6d4"
          href="/jobs"
        />
        <FeatureCard
          icon="💠"
          title="XLM Payments"
          desc="Send XLM cross-border in seconds. Real-time balance, full transaction history, and Stellar Testnet faucet integration."
          color="#6366f1"
          href="/send"
        />
        <FeatureCard
          icon="🔗"
          title="Smart Contracts"
          desc="Work orders are registered on the OrbitRegistry Soroban contract — transparent, immutable, and verifiable on-chain."
          color="#a78bfa"
          href="/contract"
        />
        <FeatureCard
          icon="⭐"
          title="On-Chain Reputation"
          desc="Your completed orders build your on-chain track record on Stellar Testnet — visible to any client worldwide."
          color="#10b981"
          href="/dashboard"
        />
      </div>

      {/* Stats strip */}
      <div className="mt-16 flex items-center gap-8 sm:gap-16 animate-fade-in-up delay-500 relative z-10">
        {[
          { value: "Testnet", label: "Network" },
          { value: "6+", label: "Wallets Supported" },
          { value: "0-fee", label: "Testnet Transactions" },
          { value: "Soroban", label: "Smart Contract" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-lg font-bold gradient-text">{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-5)" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  color,
  href,
}: {
  icon: string;
  title: string;
  desc: string;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group p-6 rounded-2xl text-left space-y-3 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}18` }}
        >
          {icon}
        </span>
        <h3 className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>
          {title}
        </h3>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-4)" }}>{desc}</p>
      <p
        className="text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color }}
      >
        Explore {title} →
      </p>
    </Link>
  );
}
