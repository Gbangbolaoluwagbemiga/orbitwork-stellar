"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";
import { sendXLM, explorerUrl, shortAddress } from "@/lib/stellar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
      <Card className="glass border-emerald-500/25 bg-linear-to-br from-emerald-500/6 to-accent/4">
        <CardContent className="pt-6 pb-6 space-y-5">
          {/* Success header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/20">
              <CheckCircle2 className="size-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-emerald-400">Transaction Successful!</p>
              <p className="text-xs text-muted-foreground">Your XLM has been sent on Stellar Testnet</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <DetailRow label="Amount" value={`${amount} XLM`} />
            <DetailRow label="To" value={shortAddress(destination)} mono />
            {result.ledger && <DetailRow label="Ledger" value={`#${result.ledger}`} />}

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Transaction Hash
              </p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-input/50 border border-border font-mono text-xs break-all text-accent">
                {result.hash}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button variant="accent-glow" className="flex-1" asChild>
              <a
                href={explorerUrl(result.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5"
              >
                View on Explorer <ExternalLink className="size-3" />
              </a>
            </Button>
            <Button variant="outline" className="flex-1" onClick={reset}>
              Send Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ── Form state ── */
  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent/15">
            <Send className="size-3.5 text-accent" />
          </div>
          <CardTitle className="text-foreground">Send XLM</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <form onSubmit={handleSend} className="space-y-4">
          {/* Destination */}
          <div className="space-y-1.5">
            <Label htmlFor="destination">Destination Address</Label>
            <Input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="G…"
              required
              disabled={isLoading}
              className="font-mono"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (XLM)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0000000"
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

          {/* Error state */}
          {status === "error" && error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl text-sm bg-destructive/8 border border-destructive/20">
              <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Transaction Failed</p>
                <p className="text-destructive/70 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center gap-3 p-3 rounded-xl text-sm bg-primary/8 border border-primary/20">
              <Loader2 className="size-4 text-primary animate-spin shrink-0" />
              <p className="text-primary/80">
                {status === "signing"
                  ? "Waiting for Freighter signature…"
                  : "Submitting to Stellar Testnet…"}
              </p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="accent-glow"
            className="w-full"
            size="lg"
            disabled={isLoading || !destination || !amount}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Processing…
              </>
            ) : (
              <>
                Send XLM <Send className="size-4" />
              </>
            )}
          </Button>
        </form>

        {/* Safety note */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Transactions are on Stellar Testnet — no real funds are used
        </p>
      </CardContent>
    </Card>
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
    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
      <span className="text-muted-foreground text-xs uppercase tracking-wider">{label}</span>
      <span className={mono ? "font-mono text-xs text-foreground/80" : "text-sm font-medium text-foreground"}>
        {value}
      </span>
    </div>
  );
}
