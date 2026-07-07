"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode2,
  Zap,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TxStatus = "idle" | "signing" | "submitting" | "success" | "error";
type ErrorType = "wallet_not_found" | "wrong_network" | "rejected" | "insufficient" | "contract" | null;

export function ContractPanel() {
  const { address, sign, isConnected } = useWallet();

  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [newOrderId, setNewOrderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);

  // Balance
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    getXLMBalance(address)
      .then(setBalance)
      .catch(() => null);
  }, [address]);

  // Contract data
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
      if (count > 0) {
        const ids = Array.from({ length: Math.min(3, count) }, (_, i) => count - i);
        const orders = await Promise.all(ids.map(getOrder));
        setRecentOrders(orders.filter(Boolean) as WorkOrder[]);
      }
    } catch {
      // silent
    } finally {
      setLoadingData(false);
    }
  }, []);

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
    } else if (m.includes("rejected") || m.includes("denied") || m.includes("cancel") || m.includes("declined")) {
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
        description: "",
        amountXlm: amount,
        duration: 7,
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
      <Card className="glass">
        <CardContent className="pt-4 pb-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              OrbitWork Registry Contract
            </p>
            <p className="font-mono text-xs break-all text-accent">{CONTRACT_ID}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {balance !== null && (
              <div className="text-center">
                <p className="text-lg font-bold text-primary">{parseFloat(balance).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">XLM</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{orderCount ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a
                href={EXPLORER_CONTRACT}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                Explorer <ExternalLink className="size-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Create order form */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/15">
                <FileCode2 className="size-3.5 text-primary" />
              </div>
              <CardTitle className="text-foreground">Register Work Order</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {status === "success" && txHash ? (
              <SuccessCard hash={txHash} orderId={newOrderId} onReset={reset} />
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="work-title">Work Title</Label>
                  <Input
                    id="work-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Design landing page"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="work-amount">Budget (XLM)</Label>
                  <div className="relative">
                    <Input
                      id="work-amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0.0000001"
                      step="any"
                      required
                      disabled={isLoading}
                      className="pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-md bg-primary/20 text-primary">
                      XLM
                    </span>
                  </div>
                </div>

                {status === "error" && error && (
                  <ErrorCard type={errorType} message={error} />
                )}

                {isLoading && (
                  <div className="flex items-center gap-3 p-3 rounded-xl text-sm bg-primary/8 border border-primary/20">
                    <Loader2 className="size-4 text-primary animate-spin shrink-0" />
                    <p className="text-primary/80">
                      {status === "signing"
                        ? "Waiting for wallet signature…"
                        : "Submitting to Stellar network…"}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="glow"
                  className="w-full"
                  size="lg"
                  disabled={isLoading || !isConnected || !title || !amount}
                >
                  {!isConnected ? (
                    "Connect Wallet First"
                  ) : isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    "Register on Stellar"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Stored on Stellar Testnet · No real funds
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Right: Recent orders + events */}
        <div className="space-y-4">
          {/* Recent orders */}
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                  Recent Orders
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshData}
                  disabled={loadingData}
                  className="h-7 px-2 text-xs"
                >
                  <RefreshCw className={cn("size-3 mr-1", loadingData && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-5 space-y-2">
              {recentOrders.length === 0 ? (
                <p className="text-xs py-4 text-center text-muted-foreground">
                  No orders yet — be the first to register one
                </p>
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
                      {STATUS_LABEL[o.status]}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Live event feed */}
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                  Live Contract Events
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              {events.length === 0 ? (
                <p className="text-xs py-3 text-center text-muted-foreground">
                  No events yet
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-lg space-y-1 bg-secondary/50 border border-border/50"
                    >
                      <p className="text-xs font-medium leading-snug text-foreground/80">
                        {ev.value}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          Ledger #{ev.ledger}
                        </span>
                        <a
                          href={`${EXPLORER_TX}/${ev.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
                        >
                          <ExternalLink className="size-2.5" /> tx
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function ErrorCard({ type, message }: { type: ErrorType; message: string }) {
  const labels: Record<string, { badge: string; hint: string; variant: "warning" | "destructive" }> = {
    wrong_network: {
      badge: "Wrong Network",
      hint: 'Open Freighter → click the network name → select "Test SDF Network" (Testnet)',
      variant: "warning",
    },
    wallet_not_found: {
      badge: "Wallet Not Found",
      hint: "Install Freighter or another Stellar wallet extension",
      variant: "warning",
    },
    rejected: {
      badge: "Transaction Rejected",
      hint: "You declined the signing request in your wallet",
      variant: "destructive",
    },
    insufficient: {
      badge: "Account Not Funded",
      hint: "Use the Stellar Testnet Faucet link above to fund your wallet, then try again",
      variant: "warning",
    },
    contract: {
      badge: "Contract Error",
      hint: "An on-chain error occurred",
      variant: "destructive",
    },
  };

  const meta = type ? labels[type] : labels.contract;

  return (
    <div className="p-3 rounded-xl text-sm space-y-2 bg-destructive/6 border border-destructive/15">
      <div className="flex items-center gap-2">
        <AlertCircle className="size-3.5 text-destructive shrink-0" />
        <Badge variant={meta.variant}>{meta.badge}</Badge>
      </div>
      <p className="text-destructive/80 text-xs">{message}</p>
      <p className="text-muted-foreground text-xs">{meta.hint}</p>
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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/20">
          <CheckCircle2 className="size-5 text-emerald-400" />
        </div>
        <div>
          <p className="font-semibold text-emerald-400">Order Registered!</p>
          {orderId && (
            <p className="text-xs text-muted-foreground">Work Order #{orderId} on Stellar</p>
          )}
        </div>
      </div>

      <div className="p-3 rounded-xl font-mono text-xs break-all bg-input/40 border border-border text-accent">
        {hash}
      </div>

      <div className="flex gap-3">
        <Button variant="accent-glow" className="flex-1" asChild>
          <a
            href={`${EXPLORER_TX}/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5"
          >
            View on Explorer <ExternalLink className="size-3" />
          </a>
        </Button>
        <Button variant="outline" className="flex-1" onClick={onReset}>
          Register Another
        </Button>
      </div>
    </div>
  );
}
