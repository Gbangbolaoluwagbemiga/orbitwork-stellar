"use client";

import Link from "next/link";
import { ContractPanel } from "@/components/contract-panel";
import { CONTRACT_ID, EXPLORER_CONTRACT } from "@/lib/contract";

export default function ContractPage() {
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
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M8 9h8M8 13h5" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
              OrbitRegistry Contract
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-4)" }}>
              Soroban smart contract on Stellar Testnet
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <p className="font-mono text-xs break-all" style={{ color: "#06b6d4" }}>
                {CONTRACT_ID}
              </p>
              <a
                href={EXPLORER_CONTRACT}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  color: "#818cf8",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                View on Explorer ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contract explainer */}
      <div
        className="rounded-2xl p-5 mb-6 animate-fade-in-up delay-100"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(6,182,212,0.05) 100%)",
          border: "1px solid rgba(99,102,241,0.12)",
        }}
      >
        <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text-1)" }}>
          What is OrbitRegistry?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs" style={{ color: "var(--text-3)" }}>
          <div className="space-y-1">
            <p className="font-semibold text-indigo-400">Register Work Orders</p>
            <p>Call <code className="font-mono text-cyan-400">create_order</code> to register a job on-chain with a title and XLM budget. Returns a unique order ID.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-indigo-400">Read Order Count</p>
            <p>The <code className="font-mono text-cyan-400">get_count</code> function returns the total number of work orders stored in the contract ledger.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-indigo-400">Fetch Order Details</p>
            <p>Use <code className="font-mono text-cyan-400">get_order(id)</code> to retrieve client address, title, budget, status, and timestamp for any order.</p>
          </div>
        </div>
      </div>

      {/* Contract panel */}
      <div className="animate-fade-in-up delay-200">
        <ContractPanel />
      </div>
    </div>
  );
}
