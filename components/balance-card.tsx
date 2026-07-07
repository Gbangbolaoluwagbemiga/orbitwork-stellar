"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, ExternalLink, RefreshCw } from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";
import { getXLMBalance } from "@/lib/stellar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function BalanceCard() {
  const { address } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const bal = await getXLMBalance(address);
      setBalance(bal);
    } catch {
      setError("Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
    const id = setInterval(fetchBalance, 30_000);
    return () => clearInterval(id);
  }, [fetchBalance]);

  return (
    <Card className="glass border-primary/20 bg-linear-to-br from-primary/8 to-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" />
            <CardTitle className="text-sm text-muted-foreground font-medium">
              XLM Balance
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchBalance}
            disabled={loading}
            title="Refresh balance"
            className="size-7"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        {/* Balance amount */}
        <div className="space-y-1">
          {loading && balance === null ? (
            <div className="h-10 w-40 rounded-lg bg-muted animate-pulse" />
          ) : error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : (
            <>
              <p className="text-4xl font-bold tracking-tight gradient-text">
                {balance ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground">XLM · Stellar Testnet</p>
            </>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Wallet address */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Wallet Address
          </p>
          <p className="font-mono text-xs text-foreground/80 break-all">{address}</p>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <Badge variant="success">Connected · Testnet</Badge>
        </div>

        {/* Faucet link */}
        <a
          href={`https://laboratory.stellar.org/#account-creator?network=test&account=${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          Fund account with Stellar Testnet Faucet
          <ExternalLink className="size-3" />
        </a>
      </CardContent>
    </Card>
  );
}
