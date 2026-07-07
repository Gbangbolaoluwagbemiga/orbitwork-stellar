"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tab = "browse" | "post" | "mine";
type TxStatus = "idle" | "signing" | "submitting" | "success" | "error";

export function JobBoard() {
  const { address, sign, isConnected } = useWallet();
  const [tab, setTab] = useState<Tab>("browse");

  // Contract data
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

  // Post Job form
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

  // Apply modal
  const [applyJob, setApplyJob] = useState<WorkOrder | null>(null);
  const [copied, setCopied] = useState(false);

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabLabels: Record<Tab, string> = {
    browse: "Browse Jobs",
    post: "Post a Job",
    mine: "My Orders",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent/15">
          <Briefcase className="size-4 text-accent" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground">Job Board</h3>
          <p className="text-xs text-muted-foreground">
            {allOrders.length} work order{allOrders.length !== 1 ? "s" : ""} on-chain · OrbitRegistry contract
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/60">
        {(["browse", "post", "mine"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
              tab === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tabLabels[t]}
            {t === "mine" && myOrders.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-xs bg-primary/30 text-primary">
                {myOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Browse Tab ── */}
      {tab === "browse" && (
        <div className="space-y-4">
          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap items-center">
            {(["all", 0, 1, 2] as const).map((f) => {
              const active = statusFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                    active
                      ? f === "all"
                        ? "bg-primary/20 text-primary border-primary/30"
                        : f === 0
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        : f === 1
                        ? "bg-accent/15 text-accent border-accent/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                      : "bg-secondary/60 text-muted-foreground border-border/50 hover:text-foreground"
                  )}
                >
                  {f === "all" ? "All" : STATUS_LABEL[f]}
                </button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchOrders}
              disabled={loading}
              className="ml-auto h-7 px-2 text-xs"
            >
              <RefreshCw className={cn("size-3 mr-1", loading && "animate-spin")} />
              {loading ? "Loading…" : "Refresh"}
            </Button>
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
        <Card className="glass">
          <CardContent className="pt-6 pb-6">
            {!isConnected ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-primary/10">
                  <Briefcase className="size-6 text-primary" />
                </div>
                <p className="font-medium text-foreground">Connect your wallet to post a job</p>
                <p className="text-sm text-muted-foreground">
                  Jobs are stored on Stellar Testnet via the OrbitRegistry contract
                </p>
              </div>
            ) : txStatus === "success" && txHash ? (
              <PostSuccess hash={txHash} orderId={newId} onReset={resetForm} onBrowse={() => setTab("browse")} />
            ) : (
              <form onSubmit={handlePost} className="space-y-5">
                <div>
                  <p className="font-semibold text-foreground mb-1">Post a Work Order</p>
                  <p className="text-xs text-muted-foreground">
                    Job details are stored immutably on the Stellar blockchain
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Design a landing page for my DeFi project"
                    required
                    disabled={isPosting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="job-budget">Budget (XLM)</Label>
                  <div className="relative">
                    <Input
                      id="job-budget"
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="0.00"
                      min="0.0000001"
                      step="any"
                      required
                      disabled={isPosting}
                      className="pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-md bg-accent/20 text-accent">
                      XLM
                    </span>
                  </div>
                </div>

                {txStatus === "error" && formError && (
                  <div className="p-3 rounded-xl text-sm flex items-start gap-2 bg-destructive/8 border border-destructive/20">
                    <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-destructive/80">{formError}</p>
                  </div>
                )}

                {isPosting && (
                  <div className="flex items-center gap-3 p-3 rounded-xl text-sm bg-accent/8 border border-accent/20">
                    <Loader2 className="size-4 text-accent animate-spin shrink-0" />
                    <p className="text-accent/80">
                      {txStatus === "signing"
                        ? "Waiting for wallet signature…"
                        : "Submitting to Stellar network…"}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="accent-glow"
                  size="lg"
                  className="w-full"
                  disabled={isPosting || !title || !budget}
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    "Post Job on Stellar"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Stored on Stellar Testnet via OrbitRegistry · No real funds
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── My Orders Tab ── */}
      {tab === "mine" && (
        <div className="space-y-4">
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
      <AnimatePresence>
        {applyJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setApplyJob(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="glass w-full max-w-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardDescription>Apply to Job #{applyJob.id}</CardDescription>
                      <CardTitle className="text-foreground">{applyJob.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Budget:{" "}
                        <span className="text-primary font-semibold">
                          {parseFloat(applyJob.amount).toFixed(2)} XLM
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => setApplyJob(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pb-6 space-y-4">
                  {/* How to apply */}
                  <div className="rounded-xl p-4 space-y-3 bg-secondary/50 border border-border/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      How to Apply
                    </p>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      {[
                        "Copy the client's Stellar address below",
                        "Reach out via Stellar memo or off-chain message with your proposal",
                        "Once agreed, the client posts escrow and releases on completion",
                      ].map((step, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="text-accent font-mono shrink-0">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Client address */}
                  <div className="space-y-1.5">
                    <Label>Client Address</Label>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border/50">
                      <p className="font-mono text-xs break-all flex-1 text-accent">
                        {applyJob.client}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyAddress(applyJob.client)}
                        className={cn(
                          "shrink-0 h-7 px-2",
                          copied && "text-emerald-400"
                        )}
                      >
                        {copied ? (
                          <Check className="size-3" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${applyJob.client}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5"
                    >
                      View Client on Explorer <ExternalLink className="size-3" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sub-components ── */

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
    <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.15 }}>
      <Card className="glass hover:border-border transition-colors">
        <CardContent className="pt-4 pb-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={isOpen ? "success" : isCompleted ? "accent" : "destructive"}
              >
                {STATUS_LABEL[order.status]}
              </Badge>
              <span className="text-xs text-muted-foreground">Order #{order.id}</span>
              {isMe && (
                <Badge variant="secondary">You</Badge>
              )}
            </div>

            <p className="font-medium text-sm truncate text-foreground">{order.title}</p>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                <span className="font-semibold text-primary">
                  {parseFloat(order.amount).toFixed(2)} XLM
                </span>{" "}
                budget
              </span>
              <span>·</span>
              <span className="font-mono truncate max-w-30">
                {order.client.slice(0, 6)}…{order.client.slice(-4)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
              <a
                href={`${EXPLORER_TX}/${CONTRACT_ID}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
            {isOpen && !isMe && !isOwner && (
              <Button variant="glow" size="sm" onClick={onApply}>
                Apply
              </Button>
            )}
            {isMe && isOpen && (
              <Badge variant="outline" className="text-muted-foreground">Your job</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent/20">
          <CheckCircle2 className="size-5 text-accent" />
        </div>
        <div>
          <p className="font-semibold text-accent">Job Posted!</p>
          {orderId && (
            <p className="text-xs text-muted-foreground">
              Work Order #{orderId} registered on Stellar Testnet
            </p>
          )}
        </div>
      </div>

      <div className="p-3 rounded-xl font-mono text-xs break-all bg-input/40 border border-border text-accent">
        {hash}
      </div>

      <div className="flex gap-3">
        <Button variant="accent-glow" className="flex-1" onClick={onBrowse}>
          View Job Board
        </Button>
        <Button variant="outline" className="flex-1" onClick={onReset}>
          Post Another
        </Button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl h-20 bg-card border border-border animate-pulse"
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
    <Card className="glass">
      <CardContent className="pt-8 pb-8 text-center space-y-3">
        <Briefcase className="size-8 text-muted-foreground mx-auto opacity-40" />
        <p className="text-sm text-muted-foreground">{msg}</p>
        {action && (
          <Button variant="accent-glow" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
