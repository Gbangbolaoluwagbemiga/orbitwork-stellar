"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/contexts/wallet-context";
import {
  createOrder,
  getOrderCount,
  getOrder,
  CONTRACT_ID,
  EXPLORER_TX,
  STATUS_LABEL,
  WorkOrder,
} from "@/lib/contract";

type Tab = "browse" | "post" | "mine";
type TxStatus = "idle" | "signing" | "submitting" | "success" | "error";

export function JobBoard() {
  const { address, sign, isConnected } = useWallet();
  const [tab, setTab] = useState<Tab>("browse");

  // ── Contract data ──────────────────────────────────────────────
  const [allOrders, setAllOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | 0 | 1 | 2>("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const count = await getOrderCount();
      if (count === 0) {
        setAllOrders([]);
        return;
      }
      const ids = Array.from({ length: count }, (_, i) => i + 1);
      const results = await Promise.all(ids.map(getOrder));
      setAllOrders(results.filter(Boolean) as WorkOrder[]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const visibleOrders = allOrders.filter((o) =>
    statusFilter === "all" ? true : o.status === statusFilter
  );

  const myOrders = allOrders.filter(
    (o) => address && o.client.toLowerCase() === address.toLowerCase()
  );

  // ── Post Job form ──────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [newId, setNewId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !isConnected) return;
    setFormError(null);
    setTxHash(null);
    setNewId(null);
    setTxStatus("signing");

    try {
      const result = await createOrder({
        clientAddress: address,
        title,
        amountXlm: budget,
        signFn: async (xdr) => {
          const signed = await sign(xdr);
          setTxStatus("submitting");
          return signed;
        },
      });
      setTxHash(result.hash);
      setNewId(result.orderId);
      setTxStatus("success");
      setTitle("");
      setBudget("");
      await fetchOrders();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setFormError(msg);
      setTxStatus("error");
    }
  };

  const resetForm = () => {
    setTxStatus("idle");
    setFormError(null);
    setTxHash(null);
    setNewId(null);
  };

  const isPosting = txStatus === "signing" || txStatus === "submitting";

  // ── Apply modal ────────────────────────────────────────────────
  const [applyJob, setApplyJob] = useState<WorkOrder | null>(null);
  const [copied, setCopied] = useState(false);

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(6,182,212,0.15)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-4 0v2M8 11h8M8 15h5" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg" style={{ color: "var(--text-1)" }}>
            Job Board
          </h3>
          <p className="text-xs" style={{ color: "var(--text-4)" }}>
            {allOrders.length} work order{allOrders.length !== 1 ? "s" : ""} on-chain · OrbitRegistry contract
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl animate-fade-in-up"
        style={{ background: "var(--surface-card-alt)" }}
      >
        {(["browse", "post", "mine"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all duration-200"
            style={{
              background: tab === t ? "var(--surface-card)" : "transparent",
              color: tab === t ? "var(--text-1)" : "var(--text-4)",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
            }}
          >
            {t === "browse" ? "Browse Jobs" : t === "post" ? "Post a Job" : "My Orders"}
            {t === "mine" && myOrders.length > 0 && (
              <span
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-xs"
                style={{ background: "rgba(99,102,241,0.3)", color: "#818cf8" }}
              >
                {myOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Browse Tab ── */}
      {tab === "browse" && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {(["all", 0, 1, 2] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background:
                    statusFilter === f
                      ? f === "all"
                        ? "rgba(99,102,241,0.3)"
                        : f === 0
                        ? "rgba(16,185,129,0.2)"
                        : f === 1
                        ? "rgba(6,182,212,0.2)"
                        : "rgba(239,68,68,0.15)"
                      : "var(--surface-card-alt)",
                  color:
                    statusFilter === f
                      ? f === "all"
                        ? "#818cf8"
                        : f === 0
                        ? "#34d399"
                        : f === 1
                        ? "#06b6d4"
                        : "#f87171"
                      : "var(--text-4)",
                  border: "1px solid transparent",
                }}
              >
                {f === "all" ? "All" : STATUS_LABEL[f]}
              </button>
            ))}
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="ml-auto px-3 py-1 rounded-full text-xs transition-colors"
              style={{ color: "var(--text-4)" }}
            >
              {loading ? "Loading…" : "↻ Refresh"}
            </button>
          </div>

          {loading ? (
            <LoadingState />
          ) : visibleOrders.length === 0 ? (
            <EmptyState
              msg={
                statusFilter === "all"
                  ? "No jobs posted yet. Be the first to post a work order on Stellar!"
                  : `No ${STATUS_LABEL[statusFilter as 0 | 1 | 2]} orders found.`
              }
              action={
                statusFilter === "all" && isConnected
                  ? { label: "Post First Job", onClick: () => setTab("post") }
                  : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {visibleOrders.map((order) => (
                <JobCard
                  key={order.id}
                  order={order}
                  myAddress={address}
                  onApply={() => {
                    setCopied(false);
                    setApplyJob(order);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Post Tab ── */}
      {tab === "post" && (
        <div
          className="rounded-2xl p-6 space-y-5 animate-fade-in-up"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-card)",
          }}
        >
          {!isConnected ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-4xl">🔒</p>
              <p className="font-medium" style={{ color: "var(--text-2)" }}>
                Connect your wallet to post a job
              </p>
              <p className="text-sm" style={{ color: "var(--text-4)" }}>
                Jobs are stored on Stellar Testnet via the OrbitRegistry contract
              </p>
            </div>
          ) : txStatus === "success" && txHash ? (
            <PostSuccess hash={txHash} orderId={newId} onReset={resetForm} onBrowse={() => setTab("browse")} />
          ) : (
            <form onSubmit={handlePost} className="space-y-5">
              <div>
                <p className="font-semibold mb-1" style={{ color: "var(--text-1)" }}>
                  Post a Work Order
                </p>
                <p className="text-xs" style={{ color: "var(--text-4)" }}>
                  Job details are stored immutably on the Stellar blockchain
                </p>
              </div>

              <Field label="Job Title">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Design a landing page for my DeFi project"
                  required
                  disabled={isPosting}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 disabled:opacity-50"
                  style={inputStyle}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
              </Field>

              <Field label="Budget (XLM)">
                <div className="relative">
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0.00"
                    min="0.0000001"
                    step="any"
                    required
                    disabled={isPosting}
                    className="w-full px-4 py-3 pr-16 rounded-xl text-sm outline-none transition-all duration-200 disabled:opacity-50"
                    style={inputStyle}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-md"
                    style={{ background: "rgba(6,182,212,0.2)", color: "#06b6d4" }}
                  >
                    XLM
                  </span>
                </div>
              </Field>

              {txStatus === "error" && formError && (
                <div
                  className="p-3 rounded-xl text-sm space-y-1"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#f87171",
                  }}
                >
                  {formError}
                </div>
              )}

              {isPosting && (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl text-sm"
                  style={{
                    background: "rgba(6,182,212,0.08)",
                    border: "1px solid rgba(6,182,212,0.2)",
                  }}
                >
                  <span className="w-4 h-4 border-2 border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin shrink-0" />
                  <p className="text-cyan-300">
                    {txStatus === "signing"
                      ? "Waiting for wallet signature…"
                      : "Submitting to Stellar network…"}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPosting || !title || !budget}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isPosting
                    ? "rgba(6,182,212,0.3)"
                    : "linear-gradient(135deg, #0891b2, #06b6d4)",
                  boxShadow: isPosting ? "none" : "0 0 20px rgba(6,182,212,0.25)",
                }}
              >
                {isPosting ? "Processing…" : "Post Job on Stellar →"}
              </button>

              <p className="text-xs text-center" style={{ color: "var(--text-5)" }}>
                Stored on Stellar Testnet via OrbitRegistry · No real funds
              </p>
            </form>
          )}
        </div>
      )}

      {/* ── My Orders Tab ── */}
      {tab === "mine" && (
        <div className="space-y-4 animate-fade-in-up">
          {!isConnected ? (
            <EmptyState msg="Connect your wallet to see your orders" />
          ) : loading ? (
            <LoadingState />
          ) : myOrders.length === 0 ? (
            <EmptyState
              msg="You haven't posted any jobs yet."
              action={{ label: "Post Your First Job", onClick: () => setTab("post") }}
            />
          ) : (
            myOrders.map((order) => (
              <JobCard
                key={order.id}
                order={order}
                myAddress={address}
                isOwner
                onApply={() => {}}
              />
            ))
          )}
        </div>
      )}

      {/* ── Apply Modal ── */}
      {applyJob && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setApplyJob(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-5 animate-fade-in-up"
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-card)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p
                  className="text-xs uppercase tracking-wider"
                  style={{ color: "var(--text-4)" }}
                >
                  Apply to Job #{applyJob.id}
                </p>
                <h4 className="font-semibold" style={{ color: "var(--text-1)" }}>
                  {applyJob.title}
                </h4>
                <p className="text-sm" style={{ color: "var(--text-3)" }}>
                  Budget: {parseFloat(applyJob.amount).toFixed(2)} XLM
                </p>
              </div>
              <button
                onClick={() => setApplyJob(null)}
                className="text-white/30 hover:text-white/60 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "var(--surface-card-alt)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>
                How to Apply
              </p>
              <ol className="space-y-2 text-sm" style={{ color: "var(--text-3)" }}>
                <li className="flex gap-2.5">
                  <span className="text-cyan-400 font-mono shrink-0">01</span>
                  Copy the client's Stellar address below
                </li>
                <li className="flex gap-2.5">
                  <span className="text-cyan-400 font-mono shrink-0">02</span>
                  Reach out via Stellar memo or off-chain message with your proposal
                </li>
                <li className="flex gap-2.5">
                  <span className="text-cyan-400 font-mono shrink-0">03</span>
                  Once agreed, the client posts escrow and releases on completion
                </li>
              </ol>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-4)" }}>
                Client Address
              </p>
              <div
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{
                  background: "var(--surface-card-alt)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <p
                  className="font-mono text-xs break-all flex-1"
                  style={{ color: "#06b6d4" }}
                >
                  {applyJob.client}
                </p>
                <button
                  onClick={() => copyAddress(applyJob.client)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: copied ? "rgba(16,185,129,0.2)" : "rgba(6,182,212,0.15)",
                    color: copied ? "#34d399" : "#06b6d4",
                    border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(6,182,212,0.25)"}`,
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <a
              href={`https://stellar.expert/explorer/testnet/account/${applyJob.client}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "#818cf8",
              }}
            >
              View Client on Explorer ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function JobCard({
  order,
  myAddress,
  isOwner = false,
  onApply,
}: {
  order: WorkOrder;
  myAddress: string | null;
  isOwner?: boolean;
  onApply: () => void;
}) {
  const isOpen = order.status === 0;
  const isCompleted = order.status === 1;
  const isMe = myAddress && order.client.toLowerCase() === myAddress.toLowerCase();

  return (
    <div
      className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
      }}
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: isOpen
                ? "rgba(16,185,129,0.15)"
                : isCompleted
                ? "rgba(6,182,212,0.15)"
                : "rgba(239,68,68,0.1)",
              color: isOpen ? "#34d399" : isCompleted ? "#06b6d4" : "#f87171",
            }}
          >
            {STATUS_LABEL[order.status]}
          </span>
          <span className="text-xs" style={{ color: "var(--text-5)" }}>
            Order #{order.id}
          </span>
          {isMe && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
              }}
            >
              You
            </span>
          )}
        </div>

        <p className="font-medium text-sm truncate" style={{ color: "var(--text-1)" }}>
          {order.title}
        </p>

        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-4)" }}>
          <span>
            <span className="font-semibold" style={{ color: "#a78bfa" }}>
              {parseFloat(order.amount).toFixed(2)} XLM
            </span>{" "}
            budget
          </span>
          <span>·</span>
          <span className="font-mono truncate max-w-[120px]">
            {order.client.slice(0, 6)}…{order.client.slice(-4)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <a
          href={`${EXPLORER_TX}/${CONTRACT_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: "var(--surface-card-alt)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-4)",
          }}
        >
          ↗
        </a>
        {isOpen && !isMe && !isOwner && (
          <button
            onClick={onApply}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, #0891b2, #06b6d4)",
              color: "white",
              boxShadow: "0 0 12px rgba(6,182,212,0.2)",
            }}
          >
            Apply
          </button>
        )}
        {isMe && isOpen && (
          <span className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "var(--text-5)", border: "1px solid var(--border-subtle)" }}>
            Your job
          </span>
        )}
      </div>
    </div>
  );
}

function PostSuccess({
  hash,
  orderId,
  onReset,
  onBrowse,
}: {
  hash: string;
  orderId: number | null;
  onReset: () => void;
  onBrowse: () => void;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: "rgba(6,182,212,0.2)" }}
        >
          ✓
        </div>
        <div>
          <p className="font-semibold text-cyan-400">Job Posted!</p>
          {orderId && (
            <p className="text-xs" style={{ color: "var(--text-4)" }}>
              Work Order #{orderId} registered on Stellar Testnet
            </p>
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
        <button
          onClick={onBrowse}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium"
          style={{
            background: "linear-gradient(135deg, #0891b2, #06b6d4)",
            color: "white",
          }}
        >
          View Job Board
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium"
          style={{
            border: "1px solid var(--border-card)",
            color: "var(--text-3)",
          }}
        >
          Post Another
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="text-xs uppercase tracking-wider"
        style={{ color: "var(--text-4)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl p-4 animate-pulse"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-card)",
            height: "80px",
          }}
        />
      ))}
    </div>
  );
}

function EmptyState({
  msg,
  action,
}: {
  msg: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div
      className="rounded-2xl p-8 text-center space-y-3"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
      }}
    >
      <p className="text-3xl">📋</p>
      <p className="text-sm" style={{ color: "var(--text-3)" }}>
        {msg}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{
            background: "linear-gradient(135deg, #0891b2, #06b6d4)",
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--surface-input)",
  border: "1px solid var(--border-input)",
  color: "var(--text-1)",
};

function focusBorder(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)";
}

function blurBorder(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "var(--border-input)";
}
