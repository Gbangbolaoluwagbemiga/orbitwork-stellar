"use client";

import { useWallet } from "@/contexts/wallet-context";
import { shortAddress } from "@/lib/stellar";

export function WalletButton() {
  const { address, isConnected, isConnecting, connect, disconnect } =
    useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {/* Connected badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-mono text-indigo-200">
            {shortAddress(address)}
          </span>
        </div>

        <button
          onClick={disconnect}
          className="px-3 py-1.5 text-sm rounded-full border border-white/10 text-white/50 hover:border-red-500/40 hover:text-red-400 transition-colors duration-200"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="relative px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group"
      style={{
        background: "linear-gradient(135deg, #6366f1, #7c3aed)",
        boxShadow: "0 0 20px rgba(99,102,241,0.35)",
      }}
    >
      {/* Hover shimmer */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "linear-gradient(135deg, #818cf8, #a78bfa)",
        }}
      />
      <span className="relative flex items-center gap-2">
        {isConnecting ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Connecting…
          </>
        ) : (
          <>
            <FreighterIcon />
            Connect Freighter
          </>
        )}
      </span>
    </button>
  );
}

function FreighterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
