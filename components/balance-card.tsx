"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { getXLMBalance, shortAddress } from "@/lib/stellar";

export function BalanceCard() {
  const { address } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const bal = await getXLMBalance(address);
      setBalance(bal);
    } catch {
      setError("Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
    // Auto-refresh every 30s
    const id = setInterval(fetchBalance, 30_000);
    return () => clearInterval(id);
  }, [fetchBalance]);

  return (
    <div
      className="rounded-2xl p-6 space-y-4 animate-fade-in-up"
      style={{
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(124,58,237,0.08) 100%)",
        border: "1px solid rgba(99,102,241,0.2)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <XLMIcon />
          <span className="text-sm font-medium text-white/60">
            XLM Balance
          </span>
        </div>
        <button
          onClick={fetchBalance}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white/70"
          title="Refresh balance"
        >
          <RefreshIcon spinning={loading} />
        </button>
      </div>

      {/* Balance amount */}
      <div className="space-y-1">
        {loading && balance === null ? (
          <div className="h-10 w-40 rounded-lg bg-white/5 animate-pulse" />
        ) : error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <>
            <p
              className="text-4xl font-bold tracking-tight"
              style={{
                background:
                  "linear-gradient(135deg, #a78bfa 0%, #6366f1 60%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {balance ?? "—"}
            </p>
            <p className="text-sm text-white/40">XLM · Stellar Testnet</p>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Wallet address */}
      <div className="space-y-1">
        <p className="text-xs text-white/40 uppercase tracking-wider">
          Wallet Address
        </p>
        <p className="font-mono text-xs text-white/70 break-all">
          {address}
        </p>
      </div>

      {/* Network pill */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-xs text-emerald-400">Connected · Testnet</span>
      </div>

      {/* Faucet link */}
      <a
        href={`https://laboratory.stellar.org/#account-creator?network=test&account=${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <span>🚰</span>
        Fund account with Stellar Testnet Faucet
        <ExternalLinkIcon />
      </a>
    </div>
  );
}

function XLMIcon() {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
      style={{ background: "rgba(99,102,241,0.25)", color: "#818cf8" }}
    >
      ✦
    </div>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={spinning ? { animation: "spin-slow 1s linear infinite" } : {}}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
