"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@/contexts/wallet-context";
import { BalanceCard } from "@/components/balance-card";
import { WalletButton } from "@/components/wallet-button";
import { FeedbackForm } from "@/components/feedback-form";
import { shortAddress } from "@/lib/stellar";
import { getOrderCount, getOrder, WorkOrder, CONTRACT_ID } from "@/lib/contract";

export default function DashboardPage() {
  const { isConnected, address, error, clearError } = useWallet();

  return (
    <div className="relative">
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

      {isConnected && address ? (
        <ConnectedDashboard address={address} />
      ) : (
        <NotConnectedView />
      )}
    </div>
  );
}

/* ── Not connected ──────────────────────────────────────────────── */
function NotConnectedView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 py-16 text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-6 animate-float"
        style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}
      >
        🔒
      </div>
      <h2 className="text-2xl font-bold mb-2 animate-fade-in-up" style={{ color: "var(--text-1)" }}>
        Connect your wallet
      </h2>
      <p className="text-sm mb-8 max-w-sm animate-fade-in-up delay-100" style={{ color: "var(--text-4)" }}>
        Connect a Stellar wallet to view your balance, manage orders, and access all dashboard features.
      </p>
      <div className="animate-fade-in-up delay-200">
        <WalletButton />
      </div>
      <p className="mt-4 text-xs animate-fade-in-up delay-300" style={{ color: "var(--text-5)" }}>
        No wallet?{" "}
        <a
          href="https://freighter.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Install Freighter →
        </a>
      </p>
    </div>
  );
}

/* ── Connected dashboard ────────────────────────────────────────── */
function ConnectedDashboard({ address }: { address: string }) {
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const count = await getOrderCount();
        setOrderCount(count);
        if (count > 0) {
          const ids = Array.from({ length: Math.min(3, count) }, (_, i) => count - i);
          const orders = await Promise.all(ids.map(getOrder));
          setRecentOrders(orders.filter(Boolean) as WorkOrder[]);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const quickActions = [
    {
      icon: "📋",
      title: "Browse Jobs",
      desc: "Find work orders on Stellar",
      href: "/jobs",
      color: "#06b6d4",
    },
    {
      icon: "💠",
      title: "Send XLM",
      desc: "Transfer XLM to any address",
      href: "/send",
      color: "#6366f1",
    },
    {
      icon: "🔗",
      title: "View Contract",
      desc: "OrbitRegistry on-chain panel",
      href: "/contract",
      color: "#a78bfa",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-10 space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          🌌
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
            Welcome back, <span className="gradient-text">{shortAddress(address)}</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--text-4)" }}>
            Stellar Testnet · Wallet Connected
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-100">
        <StatCard
          label="Orders On-Chain"
          value={orderCount !== null ? String(orderCount) : "—"}
          icon="📋"
          loading={loading}
          color="#06b6d4"
        />
        <StatCard
          label="Network"
          value="Testnet"
          icon="🌐"
          loading={false}
          color="#6366f1"
        />
        <StatCard
          label="Contract"
          value="Active"
          icon="🔗"
          loading={false}
          color="#10b981"
        />
      </div>

      {/* Quick action cards */}
      <div className="animate-fade-in-up delay-200">
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-4)" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group p-5 rounded-2xl flex items-start gap-4 transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: "var(--surface-card)",
                border: "1px solid var(--border-card)",
              }}
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: `${action.color}18` }}
              >
                {action.icon}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>
                  {action.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-4)" }}>
                  {action.desc}
                </p>
                <p
                  className="text-xs font-medium mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: action.color }}
                >
                  Go <span>→</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main grid: balance + recent orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-300">
        <BalanceCard />

        {/* Recent orders */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-card)",
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>
              Recent Orders
            </h3>
            <Link
              href="/jobs"
              className="text-xs transition-colors hover:text-indigo-300"
              style={{ color: "#6366f1" }}
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl animate-pulse"
                  style={{ height: "56px", background: "var(--surface-hover)" }}
                />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-2xl">📭</p>
              <p className="text-xs" style={{ color: "var(--text-5)" }}>
                No orders on-chain yet
              </p>
              <Link
                href="/jobs"
                className="inline-block text-xs font-medium px-4 py-2 rounded-lg mt-1"
                style={{
                  background: "rgba(6,182,212,0.12)",
                  color: "#06b6d4",
                  border: "1px solid rgba(6,182,212,0.2)",
                }}
              >
                Browse Job Board →
              </Link>
            </div>
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
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
                      #{o.id} · {o.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-4)" }}>
                      {parseFloat(o.amount).toFixed(2)} XLM
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full shrink-0 ml-2"
                    style={{
                      background: o.status === 0 ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)",
                      color: o.status === 0 ? "#34d399" : "#818cf8",
                    }}
                  >
                    {o.status === 0 ? "Open" : o.status === 1 ? "Completed" : "Cancelled"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How-to guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-400">
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{
            background: "var(--surface-card-alt)",
            border: "1px solid var(--border-card)",
          }}
        >
          <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>
            Quick Guide
          </h4>
          <ol className="space-y-2 text-sm" style={{ color: "var(--text-4)" }}>
            <li className="flex gap-2.5">
              <span className="text-indigo-400 font-mono shrink-0">01</span>
              Fund your testnet account via the Faucet link in Balance Card
            </li>
            <li className="flex gap-2.5">
              <span className="text-indigo-400 font-mono shrink-0">02</span>
              Browse the Job Board or post a new work order on-chain
            </li>
            <li className="flex gap-2.5">
              <span className="text-indigo-400 font-mono shrink-0">03</span>
              Send XLM to any Stellar testnet address instantly
            </li>
            <li className="flex gap-2.5">
              <span className="text-indigo-400 font-mono shrink-0">04</span>
              Track orders and events in the Contract panel
            </li>
          </ol>
        </div>

        <div
          className="rounded-2xl p-6 space-y-4"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(6,182,212,0.05) 100%)",
            border: "1px solid rgba(99,102,241,0.12)",
          }}
        >
          <p className="font-semibold" style={{ color: "var(--text-1)" }}>About OrbitWork</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
            OrbitWork is a cross-border freelance marketplace built on Stellar. Smart contracts handle work orders, escrow, and reputation — eliminating intermediaries for global freelancers.
          </p>
          <div className="space-y-2">
            {[
              { icon: "🌍", text: "Instant cross-border payments in XLM" },
              { icon: "🔒", text: "On-chain escrow via OrbitEscrow contract" },
              { icon: "⭐", text: "Reputation tracking via OrbitReputation" },
              { icon: "📋", text: `Immutable work orders · Contract: ${CONTRACT_ID.slice(0, 8)}…` },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-3)" }}>
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="animate-fade-in-up delay-500">
        <FeedbackForm />
      </div>

      {/* Testnet banner */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4 animate-fade-in-up delay-500"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(6,182,212,0.05) 100%)",
          border: "1px solid rgba(99,102,241,0.12)",
        }}
      >
        <div className="text-3xl">🌌</div>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            Running on Stellar Testnet
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-5)" }}>
            All transactions are on the test network. No real XLM is used.
            Switch Freighter to Testnet to interact with this dApp.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  loading,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  loading: boolean;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 space-y-2"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs" style={{ color: "var(--text-4)" }}>{label}</span>
      </div>
      {loading ? (
        <div
          className="h-6 w-16 rounded animate-pulse"
          style={{ background: "var(--surface-hover)" }}
        />
      ) : (
        <p className="text-xl font-bold" style={{ color }}>
          {value}
        </p>
      )}
    </div>
  );
}
