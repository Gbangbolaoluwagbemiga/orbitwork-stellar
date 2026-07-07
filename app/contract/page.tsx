"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, FileCode2, ExternalLink } from "lucide-react";
import { ContractPanel } from "@/components/contract-panel";
import { CONTRACT_ID, EXPLORER_CONTRACT } from "@/lib/contract";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContractPage() {
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
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
            <FileCode2 className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground">OrbitRegistry Contract</h1>
            <p className="text-sm mt-0.5 text-muted-foreground">
              Soroban smart contract on Stellar Testnet
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <p className="font-mono text-xs break-all text-accent">{CONTRACT_ID}</p>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={EXPLORER_CONTRACT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  View on Explorer <ExternalLink className="size-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contract explainer */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="glass border-primary/15 bg-linear-to-br from-primary/5 to-accent/5 mb-6">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">What is OrbitRegistry?</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div className="space-y-1">
                <p className="font-semibold text-primary">Register Work Orders</p>
                <p>
                  Call{" "}
                  <code className="font-mono text-accent">create_order</code> to register a job
                  on-chain with a title and XLM budget. Returns a unique order ID.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary">Read Order Count</p>
                <p>
                  The{" "}
                  <code className="font-mono text-accent">get_count</code> function returns the
                  total number of work orders stored in the contract ledger.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary">Fetch Order Details</p>
                <p>
                  Use{" "}
                  <code className="font-mono text-accent">get_order(id)</code> to retrieve client
                  address, title, budget, status, and timestamp for any order.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contract panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <ContractPanel />
      </motion.div>
    </div>
  );
}
