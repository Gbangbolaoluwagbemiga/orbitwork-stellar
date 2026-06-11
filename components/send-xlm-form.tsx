"use client";

import { useState } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { sendXLM, explorerUrl, shortAddress } from "@/lib/stellar";

type TxStatus = "idle" | "signing" | "submitting" | "success" | "error";

interface TxResult {
  hash: string;
  ledger?: number;
}

export function SendXLMForm() {
  const { address, sign } = useWallet();
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<TxStatus>("idle");
  const [result, setResult] = useState<TxResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setDestination("");
    setAmount("");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setError(null);
    setResult(null);
    setStatus("signing");

    try {
      // Wrap sign so we can flip the status to "submitting" right after the
      // wallet popup closes and before Horizon receives the transaction.
      const signAndTrack = async (xdr: string) => {
        const signed = await sign(xdr);
        setStatus("submitting");
        return signed;
      };
      const res = await sendXLM(address, destination.trim(), amount.trim(), signAndTrack);
      setResult({ hash: res.hash, ledger: res.ledger });
      setStatus("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setError(msg);
      setStatus("error");
    }
  };

  const isLoading = status === "signing" || status === "submitting";

  /* ── Success state ── */
  if (status === "success" && result) {
    return (
      <div
        className="rounded-2xl p-6 space-y-5 animate-fade-in-up"
        style={{
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.06) 100%)",
          border: "1px solid rgba(16,185,129,0.25)",
        }}
      >
        {/* Success header */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ background: "rgba(16,185,129,0.2)" }}
          >
            ✓
          </div>
          <div>
            <p className="font-semibold text-emerald-400">
              Transaction Successful!
            </p>
            <p className="text-xs text-white/40">
              Your XLM has been sent on Stellar Testnet
            </p>
          </div>
        </div>

        {/* Transaction details */}
        <div className="space-y-3 text-sm">
          <DetailRow label="Amount" value={`${amount} XLM`} />
          <DetailRow label="To" value={shortAddress(destination)} mono />
          {result.ledger && (
            <DetailRow label="Ledger" value={`#${result.ledger}`} />
          )}

          {/* Hash with copy + explorer link */}
          <div className="space-y-1">
            <p className="text-white/40 text-xs uppercase tracking-wider">
              Transaction Hash
            </p>
            <div
              className="flex items-center gap-2 p-3 rounded-xl font-mono text-xs break-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#06b6d4",
              }}
            >
              {result.hash}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <a
            href={explorerUrl(result.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: "rgba(6,182,212,0.15)",
              border: "1px solid rgba(6,182,212,0.3)",
              color: "#06b6d4",
            }}
          >
            View on Explorer ↗
          </a>
          <button
            onClick={reset}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Send Again
          </button>
        </div>
      </div>
    );
  }

  /* ── Form state ── */
  return (
    <div
      className="rounded-2xl p-6 space-y-5 animate-fade-in-up delay-100"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-2">
        <SendIcon />
        <h3 className="font-semibold text-white">Send XLM</h3>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        {/* Destination */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 uppercase tracking-wider">
            Destination Address
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="G…"
            required
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl font-mono text-sm text-white placeholder-white/20 outline-none transition-all duration-200 disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
            }
          />
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 uppercase tracking-wider">
            Amount (XLM)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0000000"
              min="0.0000001"
              step="any"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 pr-16 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all duration-200 disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")
              }
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-md"
              style={{
                background: "rgba(99,102,241,0.2)",
                color: "#818cf8",
              }}
            >
              XLM
            </span>
          </div>
        </div>

        {/* Error state */}
        {status === "error" && error && (
          <div
            className="flex items-start gap-2.5 p-3 rounded-xl text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <span className="mt-0.5 text-red-400">✕</span>
            <div>
              <p className="font-medium text-red-400">Transaction Failed</p>
              <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Status message while loading */}
        {isLoading && (
          <div
            className="flex items-center gap-3 p-3 rounded-xl text-sm"
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <span className="w-4 h-4 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin flex-shrink-0" />
            <p className="text-indigo-300">
              {status === "signing"
                ? "Waiting for Freighter signature…"
                : "Submitting to Stellar Testnet…"}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !destination || !amount}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isLoading
              ? "rgba(99,102,241,0.3)"
              : "linear-gradient(135deg, #6366f1, #7c3aed)",
            boxShadow: isLoading ? "none" : "0 0 20px rgba(99,102,241,0.3)",
          }}
        >
          {isLoading ? "Processing…" : "Send XLM →"}
        </button>
      </form>

      {/* Safety note */}
      <p className="text-xs text-white/30 text-center">
        Transactions are on Stellar Testnet — no real funds are used
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
      <span className="text-white/40 text-xs uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`text-white/80 ${mono ? "font-mono text-xs" : "text-sm font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}

function SendIcon() {
  return (
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center"
      style={{ background: "rgba(6,182,212,0.15)" }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    </div>
  );
}
