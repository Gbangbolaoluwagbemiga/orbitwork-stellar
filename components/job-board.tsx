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
  Clock,
  Layers,
  ExternalLink,
} from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";
import {
  createOrder,
  applyToJob,
  hasApplied,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tab = "browse" | "post" | "mine";
type TxStatus = "idle" | "signing" | "submitting" | "success" | "error";

export function JobBoard() {
  const { address, sign, isConnected } = useWallet();
  const [tab, setTab] = useState<Tab>("browse");
  const [allOrders, setAllOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | 0 | 1 | 2>("all");
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const count = await getOrderCount();
      if (count === 0) { setAllOrders([]); return; }
      const ids = Array.from({ length: count }, (_, i) => i + 1);
      const results = await Promise.all(ids.map(getOrder));
      setAllOrders(results.filter(Boolean) as WorkOrder[]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const checkApplied = useCallback(async (orders: WorkOrder[]) => {
    if (!address) return;
    const checks = await Promise.all(
      orders.filter(o => o.status === 0).map(async (o) => ({
        id: o.id,
        applied: await hasApplied(o.id, address).catch(() => false),
      }))
    );
    setAppliedIds(new Set(checks.filter(c => c.applied).map(c => c.id)));
  }, [address]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => {
    if (allOrders.length > 0) checkApplied(allOrders);
  }, [allOrders, checkApplied]);

  const visibleOrders = allOrders.filter((o) =>
    statusFilter === "all" ? true : o.status === statusFilter
  );
  const myOrders = allOrders.filter(
    (o) => address && o.client.toLowerCase() === address.toLowerCase()
  );

  // Post form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
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
        description,
        amountXlm: budget,
        duration: parseInt(duration, 10),
        signFn: async (xdr) => {
          const signed = await sign(xdr);
          setTxStatus("submitting");
          return signed;
        },
      });
      setTxHash(result.hash);
      setNewId(result.orderId);
      setTxStatus("success");
      setTitle(""); setDescription(""); setBudget(""); setDuration("");
      await fetchOrders();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus("error");
    }
  };

  // Apply dialog state
  const [applyJob, setApplyJob] = useState<WorkOrder | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedTimeline, setProposedTimeline] = useState("");
  const [applyStatus, setApplyStatus] = useState<TxStatus>("idle");
  const [applyError, setApplyError] = useState<string | null>(null);

  const openApplyDialog = (order: WorkOrder) => {
    setCoverLetter("");
    setProposedTimeline("");
    setApplyStatus("idle");
    setApplyError(null);
    setApplyJob(order);
  };

  const handleApply = async () => {
    if (!applyJob || !address) return;
    setApplyError(null);
    setApplyStatus("signing");
    try {
      await applyToJob({
        freelancerAddress: address,
        orderId: applyJob.id,
        coverLetter,
        proposedTimeline: parseInt(proposedTimeline, 10),
        signFn: async (xdr) => {
          const signed = await sign(xdr);
          setApplyStatus("submitting");
          return signed;
        },
      });
      setAppliedIds((prev) => new Set([...prev, applyJob.id]));
      setApplyStatus("success");
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Application failed");
      setApplyStatus("error");
    }
  };

  const isPosting = txStatus === "signing" || txStatus === "submitting";
  const isApplying = applyStatus === "signing" || applyStatus === "submitting";
  const canSubmitApply =
    coverLetter.trim().length >= 10 &&
    proposedTimeline.trim() !== "" &&
    parseInt(proposedTimeline, 10) >= 1;

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
            {allOrders.length} work order{allOrders.length !== 1 ? "s" : ""} on-chain · OrbitRegistry
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
                  ? "No jobs posted yet. Be the first to post a work order!"
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
              {visibleOrders.map((order, i) => (
                <JobCard
                  key={order.id}
                  order={order}
                  index={i}
                  myAddress={address}
                  applied={appliedIds.has(order.id)}
                  onApply={() => openApplyDialog(order)}
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
              <PostSuccess
                hash={txHash}
                orderId={newId}
                onReset={() => { setTxStatus("idle"); setFormError(null); setTxHash(null); setNewId(null); }}
                onBrowse={() => setTab("browse")}
              />
            ) : (
              <form onSubmit={handlePost} className="space-y-5">
                <div>
                  <p className="font-semibold text-foreground mb-1">Post a Work Order</p>
                  <p className="text-xs text-muted-foreground">
                    All details are stored immutably on the Stellar blockchain
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Design a landing page for my DeFi project"
                    required
                    disabled={isPosting}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="job-desc">Description</Label>
                  <Textarea
                    id="job-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the work, deliverables, and any requirements…"
                    rows={4}
                    required
                    disabled={isPosting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                  <div className="space-y-1.5">
                    <Label htmlFor="job-duration">Duration (days)</Label>
                    <Input
                      id="job-duration"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 14"
                      min="1"
                      required
                      disabled={isPosting}
                    />
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
                  disabled={isPosting || !title || !description || !budget || !duration}
                >
                  {isPosting ? (
                    <><Loader2 className="size-4 animate-spin" /> Processing…</>
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
            myOrders.map((order, i) => (
              <JobCard
                key={order.id}
                order={order}
                index={i}
                myAddress={address}
                applied={false}
                isOwner
                onApply={() => {}}
              />
            ))
          )}
        </div>
      )}

      {/* ── Application Dialog ── */}
      <AnimatePresence>
        {applyJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => { if (!isApplying) setApplyJob(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="glass-thick">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0 pr-4">
                      <CardDescription>Apply to Job #{applyJob.id}</CardDescription>
                      <CardTitle className="text-foreground leading-snug">
                        {applyJob.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 pt-1 flex-wrap">
                        <span className="text-sm font-semibold text-primary">
                          {parseFloat(applyJob.amount).toFixed(2)} XLM
                        </span>
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="size-3" />
                          {applyJob.duration} days
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => setApplyJob(null)}
                      disabled={isApplying}
                      className="text-muted-foreground hover:text-foreground transition-colors mt-1"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="pb-6 space-y-4">
                  {applyStatus === "success" ? (
                    <div className="py-6 text-center space-y-4">
                      <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-emerald-500/15">
                        <CheckCircle2 className="size-7 text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-emerald-400">Application Submitted!</p>
                        <p className="text-sm text-muted-foreground">
                          Your application is recorded on Stellar Testnet. The client will review it.
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => setApplyJob(null)}>
                        Close
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Job description */}
                      {applyJob.description && (
                        <div className="rounded-xl p-3 bg-secondary/40 border border-border/50 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <Layers className="size-3" />
                            Job Description
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {applyJob.description}
                          </p>
                        </div>
                      )}

                      {/* Cover letter */}
                      <div className="space-y-1.5">
                        <Label htmlFor="cover-letter">Cover Letter *</Label>
                        <Textarea
                          id="cover-letter"
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          placeholder="Tell the client why you're the best fit for this job. Highlight relevant experience and how you plan to approach the work…"
                          rows={6}
                          disabled={isApplying}
                          required
                        />
                        <p className="text-xs text-right text-muted-foreground">
                          {coverLetter.length} chars {coverLetter.trim().length < 10 && "(min 10)"}
                        </p>
                      </div>

                      {/* Proposed timeline */}
                      <div className="space-y-1.5">
                        <Label htmlFor="apply-timeline">Proposed Timeline (days) *</Label>
                        <Input
                          id="apply-timeline"
                          type="number"
                          value={proposedTimeline}
                          onChange={(e) => setProposedTimeline(e.target.value)}
                          placeholder={`e.g. ${applyJob.duration}`}
                          min="1"
                          disabled={isApplying}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Client expects {applyJob.duration} day{applyJob.duration !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {applyStatus === "error" && applyError && (
                        <div className="p-3 rounded-xl text-sm flex items-start gap-2 bg-destructive/8 border border-destructive/20">
                          <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                          <p className="text-destructive/80">{applyError}</p>
                        </div>
                      )}

                      {isApplying && (
                        <div className="flex items-center gap-3 p-3 rounded-xl text-sm bg-primary/8 border border-primary/20">
                          <Loader2 className="size-4 text-primary animate-spin shrink-0" />
                          <p className="text-primary/80">
                            {applyStatus === "signing"
                              ? "Waiting for wallet signature…"
                              : "Submitting application on-chain…"}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3 pt-1">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setApplyJob(null)}
                          disabled={isApplying}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="glow"
                          className="flex-1"
                          onClick={handleApply}
                          disabled={isApplying || !canSubmitApply || !isConnected}
                        >
                          {isApplying ? (
                            <><Loader2 className="size-4 animate-spin" /> Applying…</>
                          ) : (
                            "Submit Application"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Job Card ── */
function JobCard({
  order,
  index,
  myAddress,
  applied,
  isOwner = false,
  onApply,
}: {
  order: WorkOrder;
  index: number;
  myAddress: string | null;
  applied: boolean;
  isOwner?: boolean;
  onApply: () => void;
}) {
  const isOpen = order.status === 0;
  const isCompleted = order.status === 1;
  const isMe = myAddress && order.client.toLowerCase() === myAddress.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      whileHover={{ scale: 1.003 }}
    >
      <Card className="glass hover:border-border transition-colors">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Left */}
            <div className="flex-1 min-w-0 space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={isOpen ? "success" : isCompleted ? "accent" : "destructive"}>
                  {STATUS_LABEL[order.status]}
                </Badge>
                <span className="text-xs text-muted-foreground">Order #{order.id}</span>
                {isMe && <Badge variant="secondary">Your Job</Badge>}
                {applied && (
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="size-3 mr-1" />
                    Applied
                  </Badge>
                )}
                <Badge variant="secondary" className="gap-1 ml-auto">
                  <Clock className="size-3" />
                  {order.duration} day{order.duration !== 1 ? "s" : ""}
                </Badge>
              </div>

              <div>
                <p className="font-semibold text-foreground">{order.title}</p>
                {order.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {order.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  Budget:{" "}
                  <span className="font-semibold text-primary">
                    {parseFloat(order.amount).toFixed(2)} XLM
                  </span>
                </span>
                <span>·</span>
                <span className="font-mono">
                  {order.client.slice(0, 6)}…{order.client.slice(-4)}
                </span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 shrink-0 lg:flex-col lg:items-end lg:gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-2xl font-bold text-primary">
                  {parseFloat(order.amount).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">XLM</p>
              </div>

              <div className="flex items-center gap-2">
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
                  <Button
                    variant={applied ? "outline" : "glow"}
                    size="sm"
                    onClick={onApply}
                    disabled={applied}
                    className="min-w-[90px]"
                  >
                    {applied ? "Applied ✓" : "Apply Now"}
                  </Button>
                )}
                {isMe && isOpen && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Your Job
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Post Success ── */
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

/* ── Loading / Empty ── */
function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl h-24 bg-card border border-border animate-pulse" />
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
