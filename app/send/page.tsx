"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Send,
  ArrowLeft,
  Shield,
  Zap,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";
import { SendXLMForm } from "@/components/send-xlm-form";
import { WalletButton } from "@/components/wallet-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SendPage() {
  const { isConnected } = useWallet();

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-10">
      {/* Page header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-4 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/10 border border-accent/20">
            <Send className="size-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Send XLM</h1>
            <p className="text-sm text-muted-foreground">
              Transfer XLM to any Stellar testnet address instantly
            </p>
          </div>
        </div>
      </motion.div>

      {!isConnected ? (
        <motion.div
          className="flex flex-col items-center justify-center py-20 text-center space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-accent/10 border border-accent/20">
            <Shield className="size-8 text-accent" />
          </div>
          <p className="font-semibold text-foreground">Connect your wallet to send XLM</p>
          <p className="text-sm max-w-xs text-muted-foreground">
            You need a connected Stellar wallet to sign and submit transactions.
          </p>
          <WalletButton />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Send form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <SendXLMForm />
          </motion.div>

          {/* Right: Info panel */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* How it works */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm text-foreground">How XLM Payments Work</CardTitle>
              </CardHeader>
              <CardContent className="pb-6 space-y-3">
                <ol className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "Enter the recipient's Stellar address (starts with G…)",
                    "Set the XLM amount — minimum 0.0000001 XLM (1 stroop)",
                    "Confirm in your wallet — Freighter will show the transaction details",
                    "Transaction confirms on Stellar in ~5 seconds with a full hash",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold bg-accent/15 text-accent">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-sm text-foreground">Tips</CardTitle>
              </CardHeader>
              <CardContent className="pb-6 space-y-2">
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {[
                    "Stellar transactions typically confirm within 3–5 seconds",
                    "Both sender and recipient accounts must be funded (min. 1 XLM reserve)",
                    "Freighter must be set to Testnet — check network in the extension",
                    "Always verify the destination address before confirming",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <Zap className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Faucet */}
            <Card className="glass border-primary/15 bg-linear-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-5 pb-5 space-y-3">
                <p className="text-sm font-medium text-foreground">Need testnet XLM?</p>
                <p className="text-xs text-muted-foreground">
                  Use the Stellar Testnet Faucet (Friendbot) to fund your account with free testnet XLM.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://laboratory.stellar.org/#account-creator?network=test"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5"
                  >
                    Open Stellar Testnet Faucet <ExternalLink className="size-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Safety note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/6 border border-emerald-500/15">
              <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                All transactions on this dApp use{" "}
                <span className="text-emerald-400 font-medium">Stellar Testnet</span>.
                No real XLM is transferred — safe to experiment.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
