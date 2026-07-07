"use client";

import Link from "next/link";
import { useWallet } from "@/contexts/wallet-context";
import { SendXLMForm } from "@/components/send-xlm-form";
import { WalletButton } from "@/components/wallet-button";

export default function SendPage() {
  const { isConnected } = useWallet();

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-10">
      {/* Page header */}
      <div className="mb-8 animate-fade-in-up">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors hover:text-indigo-300"
          style={{ color: "var(--text-4)" }}
        >
          ← Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.2)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
              Send XLM
            </h1>
            <p className="text-sm" style={{ color: "var(--text-4)" }}>
              Transfer XLM to any Stellar testnet address instantly
            </p>
          </div>
        </div>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in-up">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}
          >
            🔒
          </div>
          <p className="font-semibold" style={{ color: "var(--text-2)" }}>
            Connect your wallet to send XLM
          </p>
          <p className="text-sm max-w-xs" style={{ color: "var(--text-4)" }}>
            You need a connected Stellar wallet to sign and submit transactions.
          </p>
          <WalletButton />
        </div>
      ) : (
        /* Two-column layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Send form */}
          <div className="animate-fade-in-up delay-100">
            <SendXLMForm />
          </div>

          {/* Right: Info panel */}
          <div className="space-y-4 animate-fade-in-up delay-200">
            {/* How it works */}
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{
                background: "var(--surface-card)",
                border: "1px solid var(--border-card)",
              }}
            >
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>
                How XLM Payments Work
              </h3>
              <ol className="space-y-3 text-sm" style={{ color: "var(--text-3)" }}>
                <li className="flex gap-3">
                  <span
                    className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}
                  >
                    1
                  </span>
                  <span>Enter the recipient's Stellar address (starts with G…)</span>
                </li>
                <li className="flex gap-3">
                  <span
                    className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}
                  >
                    2
                  </span>
                  <span>Set the XLM amount — minimum 0.0000001 XLM (1 stroop)</span>
                </li>
                <li className="flex gap-3">
                  <span
                    className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}
                  >
                    3
                  </span>
                  <span>Confirm in your wallet — Freighter will show the transaction details</span>
                </li>
                <li className="flex gap-3">
                  <span
                    className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }}
                  >
                    4
                  </span>
                  <span>Transaction confirms on Stellar in ~5 seconds with a full hash</span>
                </li>
              </ol>
            </div>

            {/* Tips */}
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{
                background: "var(--surface-card-alt)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-2)" }}>
                Tips
              </h3>
              <ul className="space-y-2 text-xs" style={{ color: "var(--text-4)" }}>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 shrink-0 mt-0.5">⚡</span>
                  Stellar transactions typically confirm within 3–5 seconds
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 shrink-0 mt-0.5">⚡</span>
                  Both sender and recipient accounts must be funded (min. 1 XLM reserve)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 shrink-0 mt-0.5">⚡</span>
                  Freighter must be set to Testnet — check network in the extension
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 shrink-0 mt-0.5">⚡</span>
                  Always verify the destination address before confirming
                </li>
              </ul>
            </div>

            {/* Testnet faucet */}
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(6,182,212,0.05) 100%)",
                border: "1px solid rgba(99,102,241,0.12)",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                Need testnet XLM?
              </p>
              <p className="text-xs" style={{ color: "var(--text-4)" }}>
                Use the Stellar Testnet Faucet (Friendbot) to fund your account with free testnet XLM.
              </p>
              <a
                href="https://laboratory.stellar.org/#account-creator?network=test"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-indigo-300"
                style={{ color: "#6366f1" }}
              >
                🚰 Open Stellar Testnet Faucet ↗
              </a>
            </div>

            {/* Safety note */}
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <span className="text-emerald-400 shrink-0">✓</span>
              <p className="text-xs" style={{ color: "var(--text-4)" }}>
                All transactions on this dApp use{" "}
                <span className="text-emerald-400 font-medium">Stellar Testnet</span>.
                No real XLM is transferred — safe to experiment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
