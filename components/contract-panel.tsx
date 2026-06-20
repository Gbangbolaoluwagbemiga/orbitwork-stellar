"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { getXLMBalance } from "@/lib/stellar";
import {
  createOrder,
  getOrderCount,
  getOrder,
  fetchContractEvents,
  CONTRACT_ID,
  EXPLORER_CONTRACT,
  EXPLORER_TX,
  STATUS_LABEL,
  WorkOrder,
  ContractEvent,
} from "@/lib/contract";

type TxStatus = "idle" | "signing" | "submitting" | "success" | "error";
type ErrorType = "wallet_not_found" | "wrong_network" | "rejected" | "insufficient" | "contract" | null;

export function ContractPanel() {
  const { address, sign, isConnected } = useWallet();

  // ── Form state ────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [newOrderId, setNewOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);

  // ── Balance ───────────────────────────────────────────────────
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    getXLMBalance(address)
      .then(setBalance)
      .catch(() => null);
  }, [address]);

  // ── Contract data ──────────────────────────────────────────────
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([]);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const refreshData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [count, evts] = await Promise.all([
        getOrderCount(),
        fetchContractEvents(8),
      ]);
      setOrderCount(count);
      setEvents(evts);

      // Fetch last 3 orders
      if (count > 0) {
        const ids = Array.from(
          { length: Math.min(3, count) },
          (_, i) => count - i
        );
        const orders = await Promise.all(ids.map(getOrder));
        setRecentOrders(orders.filter(Boolean) as WorkOrder[]);
      }
    } catch {
      // silent — network issues shouldn't crash the panel
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Initial load + auto-refresh every 15s
  useEffect(() => {
    refreshData();
    const id = setInterval(refreshData, 15_000);
    return () => clearInterval(id);
  }, [refreshData]);

  const classifyError = (msg: string) => {
    const m = msg.toLowerCase();
    if (m.startsWith("freighter is set to") || m.includes("wrong network") || m.includes("mainnet")) {
      setErrorType("wrong_network");
    } else if (m.includes("account not found") || m.includes("fund it via") || m.includes("faucet")) {
      setErrorType("insufficient");
    } else if (m.includes("not found") || m.includes("not installed")) {
      setErrorType("wallet_not_found");
    } else if (
      m.includes("rejected") ||
      m.includes("denied") ||
      m.includes("cancel") ||
      m.includes("declined")
    ) {
      setErrorType("rejected");
    } else if (m.includes("insufficient") || m.includes("underfunded") || m.includes("balance")) {
      setErrorType("insufficient");
    } else {
      setErrorType("contract");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !isConnected) return;

    setError(null);
    setErrorType(null);
    setTxHash(null);
    setNewOrderId(null);
    setStatus("signing");

    try {
      const signAndTrack = async (xdr: string) => {
        const signed = await sign(xdr);
        setStatus("submitting");
        return signed;
      };

      const result = await createOrder({
        clientAddress: address,
        title,
        amountXlm: amount,
        signFn: signAndTrack,
      });

      setTxHash(result.hash);
      setNewOrderId(result.orderId);
      setStatus("success");
      setTitle("");
      setAmount("");
      await refreshData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ?? "Transaction failed";
      setError(msg);
      classifyError(msg);
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setError(null);
    setErrorType(null);
    setTxHash(null);
    setNewOrderId(null);
  };

  const isLoading = status === "signing" || status === "submitting";

  return (
    <div className="space-y-6">
      {/* Contract info bar */}
      <div
        className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between animate-fade-in-up"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-card)",
        }}
      >
        <div className="space-y-0.5">
          <p className="text-xs text-white/40 uppercase tracking-wider">
            OrbitWork Registry Contract
          </p>
          <p className="font-mono text-xs break-all" style={{ color: "#06b6d4" }}>
            {CONTRACT_ID}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {balance !== null && (
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: "#a78bfa" }}>
                {parseFloat(balance).toFixed(2)}
              </p>
              <p className="text-xs text-white/40">XLM</p>
            </div>
          )}
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-400">
              {orderCount ?? "—"}
            </p>
            <p className="text-xs text-white/40">Orders</p>
          </div>
          <a
            href={EXPLORER_CONTRACT}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: "rgba(99,102,241,0.15)",
              color: "#818cf8",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            Explorer ↗
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Create order form */}
        <div
          className="rounded-2xl p-6 space-y-5 animate-fade-in-up delay-100"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-card)",
          }}
        >
          <div className="flex items-center gap-2">
            <ContractIcon />
            <h3 className="font-semibold" style={{ color: "var(--text-1)" }}>
              Register Work Order
            </h3>
          </div>

          {status === "success" && txHash ? (
            <SuccessCard
              hash={txHash}
              orderId={newOrderId}
              onReset={reset}
            />
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label
                  className="text-xs uppercase tracking-wider"
                  style={{ color: "var(--text-4)" }}
                >
                  Work Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Design landing page"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: "var(--surface-input)",
                    border: "1px solid var(--border-input)",
                    color: "var(--text-1)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-input)")
                  }
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label
                  className="text-xs uppercase tracking-wider"
                  style={{ color: "var(--text-4)" }}
                >
                  Budget (XLM)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.0000001"
                    step="any"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-16 rounded-xl text-sm outline-none transition-all duration-200 disabled:opacity-50"
                    style={{
                      background: "var(--surface-input)",
                      border: "1px solid var(--border-input)",
                      color: "var(--text-1)",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(99,102,241,0.5)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "var(--border-input)")
                    }
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-md"
                    style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}
                  >
                    XLM
                  </span>
                </div>
              </div>

              {/* Error display with type classification */}
              {status === "error" && error && (
                <ErrorCard type={errorType} message={error} />
              )}

              {/* Loading indicator */}
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
                      ? "Waiting for wallet signature…"
                      : "Submitting to Stellar network…"}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !isConnected || !title || !amount}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                style={{
                  background: isLoading
                    ? "rgba(99,102,241,0.3)"
                    : "linear-gradient(135deg, #6366f1, #7c3aed)",
                  boxShadow: isLoading ? "none" : "0 0 20px rgba(99,102,241,0.3)",
                }}
              >
                {!isConnected
                  ? "Connect Wallet First"
                  : isLoading
                  ? "Processing…"
                  : "Register on Stellar →"}
              </button>

              <p
                className="text-xs text-center"
                style={{ color: "var(--text-5)" }}
              >
                Stored on Stellar Testnet · No real funds
              </p>
            </form>
          )}
        </div>

        {/* Right: Recent orders + events */}
        <div className="space-y-4">
          {/* Recent orders */}
          <div
            className="rounded-2xl p-5 space-y-3 animate-fade-in-up delay-200"
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-card)",
            }}
          >
            <div className="flex items-center justify-between">
              <h4
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-4)" }}
              >
                Recent Orders
              </h4>
              <button
                onClick={refreshData}
                disabled={loadingData}
                className="text-xs transition-colors"
                style={{ color: "var(--text-4)" }}
              >
                {loadingData ? "…" : "↻ Refresh"}
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: "var(--text-5)" }}>
                No orders yet — be the first to register one
              </p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{
                      background: "var(--surface-card-alt)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--text-1)" }}
                      >
                        #{o.id} · {o.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-4)" }}>
                        {parseFloat(o.amount).toFixed(2)} XLM
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0 ml-2"
                      style={{
                        background:
                          o.status === 0
                            ? "rgba(16,185,129,0.15)"
                            : "rgba(99,102,241,0.15)",
                        color: o.status === 0 ? "#34d399" : "#818cf8",
                      }}
                    >
                      {STATUS_LABEL[o.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live event feed */}
          <div
            className="rounded-2xl p-5 space-y-3 animate-fade-in-up delay-300"
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-card)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full bg-emerald-400"
                style={{ animation: "pulse 2s infinite" }}
              />
              <h4
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-4)" }}
              >
                Live Contract Events
              </h4>
            </div>

            {events.length === 0 ? (
              <p className="text-xs py-3 text-center" style={{ color: "var(--text-5)" }}>
                No events yet
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-lg space-y-1"
                    style={{
                      background: "var(--surface-card-alt)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <p
                      className="text-xs font-medium leading-snug"
                      style={{ color: "var(--text-2)" }}
                    >
                      {ev.value}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--text-5)" }}
                      >
                        Ledger #{ev.ledger}
                      </span>
                      <a
                        href={`${EXPLORER_TX}/${ev.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs"
                        style={{ color: "#6366f1" }}
                      >
                        ↗ tx
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function ErrorCard({ type, message }: { type: ErrorType; message: string }) {
  const labels: Record<string, { badge: string; hint: string; color: string }> = {
    wrong_network: {
      badge: "Wrong Network",
      hint: "Open Freighter → click the network name → select \"Test SDF Network\" (Testnet)",
      color: "#f97316",
    },
    wallet_not_found: {
      badge: "Wallet Not Found",
      hint: "Install Freighter or another Stellar wallet extension",
      color: "#f97316",
    },
    rejected: {
      badge: "Transaction Rejected",
      hint: "You declined the signing request in your wallet",
      color: "#ef4444",
    },
    insufficient: {
      badge: "Account Not Funded",
      hint: "Use the Stellar Testnet Faucet link above to fund your wallet, then try again",
      color: "#eab308",
    },
    contract: {
      badge: "Contract Error",
      hint: "An on-chain error occurred",
      color: "#ef4444",
    },
  };

  const meta = type ? labels[type] : labels.contract;

  return (
    <div
      className="p-3 rounded-xl text-sm space-y-1"
      style={{
        background: "rgba(239,68,68,0.08)",
        border: `1px solid rgba(239,68,68,0.2)`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: `${meta.color}22`,
            color: meta.color,
          }}
        >
          {meta.badge}
        </span>
      </div>
      <p className="text-red-400/80 text-xs">{message}</p>
      <p className="text-red-400/50 text-xs">{meta.hint}</p>
    </div>
  );
}

function SuccessCard({
  hash,
  orderId,
  onReset,
}: {
  hash: string;
  orderId: number | null;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: "rgba(16,185,129,0.2)" }}
        >
          ✓
        </div>
        <div>
          <p className="font-semibold text-emerald-400">Order Registered!</p>
          {orderId && (
            <p className="text-xs text-white/40">Work Order #{orderId} on Stellar</p>
          )}
        </div>
      </div>

      <div
        className="p-3 rounded-xl font-mono text-xs break-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "#06b6d4",
        }}
      >
        {hash}
      </div>

      <div className="flex gap-3">
        <a
          href={`${EXPLORER_TX}/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{
            background: "rgba(6,182,212,0.15)",
            border: "1px solid rgba(6,182,212,0.3)",
            color: "#06b6d4",
          }}
        >
          View on Explorer ↗
        </a>
        <button
          onClick={onReset}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{
            border: "1px solid var(--border-card)",
            color: "var(--text-3)",
          }}
        >
          Register Another
        </button>
      </div>
    </div>
  );
}

function ContractIcon() {
  return (
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center"
      style={{ background: "rgba(99,102,241,0.15)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    </div>
  );
}
