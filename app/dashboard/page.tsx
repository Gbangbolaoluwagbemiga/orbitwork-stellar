"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Globe,
  Shield,
  Briefcase,
  Send,
  FileCode2,
  ArrowRight,
  AlertCircle,
  X,
} from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";
import { BalanceCard } from "@/components/balance-card";
import { WalletButton } from "@/components/wallet-button";
import { FeedbackForm } from "@/components/feedback-form";
import { shortAddress } from "@/lib/stellar";
import { getOrderCount, getOrder, WorkOrder, CONTRACT_ID } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { isConnected, address, error, clearError } = useWallet();

  return (
    <div className="relative">
      {/* Global error toast */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-sm max-w-sm w-full mx-4 bg-destructive/15 border border-destructive/30 backdrop-blur-sm"
        >
          <AlertCircle className="size-4 text-destructive shrink-0" />
          <p className="text-destructive flex-1">{error}</p>
          <button
            onClick={clearError}
            className="text-destructive/60 hover:text-destructive transition-colors"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      )}

      {isConnected && address ? (
        <ConnectedDashboard address={address} />
      ) : (
        <NotConnectedView />
      )}
    </div>
  );
}

function NotConnectedView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 py-16 text-center">
      <motion.div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-6 animate-float bg-primary/10 border border-primary/20"
        {...fadeUp}
        transition={{ duration: 0.4 }}
      >
        <Shield className="size-9 text-primary" />
      </motion.div>
      <motion.h2
        className="text-2xl font-bold mb-2 text-foreground"
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        Connect your wallet
      </motion.h2>
      <motion.p
        className="text-sm mb-8 max-w-sm text-muted-foreground"
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Connect a Stellar wallet to view your balance, manage orders, and access all dashboard features.
      </motion.p>
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }}>
        <WalletButton />
      </motion.div>
      <motion.p
        className="mt-4 text-xs text-muted-foreground"
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        No wallet?{" "}
        <a
          href="https://freighter.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          Install Freighter
        </a>
      </motion.p>
    </div>
  );
}

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
      icon: Briefcase,
      title: "Browse Jobs",
      desc: "Find work orders on Stellar",
      href: "/jobs",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Send,
      title: "Send XLM",
      desc: "Transfer XLM to any address",
      href: "/send",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: FileCode2,
      title: "View Contract",
      desc: "OrbitRegistry on-chain panel",
      href: "/contract",
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  const statsData = [
    {
      label: "Orders On-Chain",
      value: orderCount !== null ? String(orderCount) : "—",
      icon: TrendingUp,
      loading,
      color: "text-accent",
    },
    {
      label: "Network",
      value: "Testnet",
      icon: Globe,
      loading: false,
      color: "text-primary",
    },
    {
      label: "Contract",
      value: "Active",
      icon: Shield,
      loading: false,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-10 space-y-8">
      {/* Page header */}
      <motion.div className="flex items-center gap-4" {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20 text-2xl">
          🌌
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back,{" "}
            <span className="gradient-text">{shortAddress(address)}</span>
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-xs text-primary border-primary/30">
              Stellar Testnet
            </Badge>
            <span className="text-xs text-muted-foreground">Wallet Connected</span>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        {statsData.map(({ label, value, icon: Icon, loading: ld, color }) => (
          <Card key={label} className="glass">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("size-4", color)} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              {ld ? (
                <div className="h-6 w-16 rounded bg-muted animate-pulse" />
              ) : (
                <p className={cn("text-xl font-bold", color)}>{value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.16 }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <motion.div key={action.href} whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
              <Link href={action.href} className="group block h-full">
                <Card className="glass h-full hover:border-primary/30 transition-colors">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", action.bg)}>
                        <action.icon className={cn("size-5", action.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground">{action.title}</p>
                        <p className="text-xs mt-0.5 text-muted-foreground">{action.desc}</p>
                        <p className="text-xs font-medium mt-2 flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Go <ArrowRight className="size-3" />
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Balance + recent orders */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.24 }}
      >
        <BalanceCard />

        {/* Recent orders */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Recent Orders
              </CardTitle>
              <Link
                href="/jobs"
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pb-6">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl h-14 bg-muted animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-2xl">📭</p>
                <p className="text-xs text-muted-foreground">No orders on-chain yet</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/jobs">Browse Job Board</Link>
                </Button>
              </div>
            ) : (
              recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                      #{o.id} · {o.title}
                    </p>
                    <p className="text-xs mt-0.5 text-muted-foreground">
                      {parseFloat(o.amount).toFixed(2)} XLM
                    </p>
                  </div>
                  <Badge
                    variant={o.status === 0 ? "success" : o.status === 1 ? "accent" : "muted"}
                    className="shrink-0 ml-2"
                  >
                    {o.status === 0 ? "Open" : o.status === 1 ? "Completed" : "Cancelled"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Guide + About */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.32 }}
      >
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
              Quick Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <ol className="space-y-2 text-sm text-muted-foreground">
              {[
                "Fund your testnet account via the Faucet link in Balance Card",
                "Browse the Job Board or post a new work order on-chain",
                "Send XLM to any Stellar testnet address instantly",
                "Track orders and events in the Contract panel",
              ].map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-primary font-mono shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="glass border-primary/15 bg-linear-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-foreground">About OrbitWork</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <CardDescription className="leading-relaxed">
              OrbitWork is a cross-border freelance marketplace built on Stellar. Smart contracts handle work orders, escrow, and reputation — eliminating intermediaries for global freelancers.
            </CardDescription>
            <div className="space-y-2">
              {[
                { icon: "🌍", text: "Instant cross-border payments in XLM" },
                { icon: "🔒", text: "On-chain escrow via OrbitEscrow contract" },
                { icon: "⭐", text: "Reputation tracking via OrbitReputation" },
                { icon: "📋", text: `Immutable work orders · Contract: ${CONTRACT_ID.slice(0, 8)}…` },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.4 }}>
        <FeedbackForm />
      </motion.div>

      {/* Testnet banner */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.44 }}>
        <Card className="glass border-primary/15 bg-linear-to-r from-primary/5 to-accent/5">
          <CardContent className="pt-5 pb-5 flex items-center gap-4">
            <div className="text-3xl">🌌</div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Running on Stellar Testnet
              </p>
              <p className="text-xs mt-0.5 text-muted-foreground">
                All transactions are on the test network. No real XLM is used.
                Switch Freighter to Testnet to interact with this dApp.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
