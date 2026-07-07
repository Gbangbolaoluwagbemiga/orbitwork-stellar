"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Send,
  Star,
  Globe,
  Shield,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { OrbitLogo } from "@/components/orbit-logo";
import { WalletButton } from "@/components/wallet-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="relative flex flex-col items-center overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative w-full gradient-mesh flex flex-col items-center justify-center min-h-[calc(100vh-130px)] px-4 py-16 text-center">
        {/* Orbital rings */}
        <div
          className="absolute pointer-events-none rounded-full border border-primary/8"
          style={{ width: 560, height: 560, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />
        <div
          className="absolute pointer-events-none rounded-full border border-accent/6"
          style={{ width: 380, height: 380, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />

        <motion.div
          className="animate-float relative z-10"
          {...fadeUp}
          transition={{ duration: 0.5 }}
        >
          <OrbitLogo size={180} />
        </motion.div>

        <motion.div
          className="mt-8 space-y-3 relative z-10"
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
            <span className="shimmer-text">OrbitWork</span>
          </h1>
          <p className="text-xl sm:text-2xl font-light max-w-lg mx-auto text-muted-foreground">
            The Stellar freelance marketplace —{" "}
            <span className="text-primary font-medium">jobs, payments, and reputation on-chain</span>
          </p>
        </motion.div>

        <motion.p
          className="mt-6 max-w-xl leading-relaxed text-muted-foreground relative z-10"
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Connect any Stellar wallet to browse open jobs, send XLM payments, register
          work orders on-chain, and build your on-chain freelance reputation — all in one orbit.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 relative z-10"
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button variant="glow" size="xl" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              Launch App <ArrowRight className="size-4" />
            </Link>
          </Button>
          <WalletButton />
        </motion.div>

        <motion.p
          className="mt-4 text-xs text-muted-foreground relative z-10"
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Supports Freighter · Albedo · xBull · Rabet · Hana · LOBSTR
        </motion.p>

        {/* Stats row */}
        <motion.div
          className="mt-16 flex items-center gap-8 sm:gap-16 relative z-10"
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {[
            { value: "Testnet", label: "Network" },
            { value: "6+", label: "Wallets Supported" },
            { value: "0-fee", label: "Testnet Transactions" },
            { value: "Soroban", label: "Smart Contract" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-bold gradient-text">{value}</p>
              <p className="text-xs mt-0.5 text-muted-foreground">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Stats cards ── */}
      <section className="w-full max-w-5xl px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Globe,
              title: "Testnet Network",
              desc: "All transactions run on Stellar Testnet — safe to explore with zero real funds.",
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              icon: Shield,
              title: "6+ Wallets",
              desc: "Freighter, Albedo, xBull, Rabet, Hana, and LOBSTR all supported via StellarWalletsKit.",
              color: "text-accent",
              bg: "bg-accent/10",
            },
            {
              icon: TrendingUp,
              title: "Soroban Contracts",
              desc: "Work orders stored immutably on-chain via the OrbitRegistry Soroban smart contract.",
              color: "text-primary",
              bg: "bg-primary/10",
            },
          ].map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="glass h-full">
                <CardContent className="pt-6 space-y-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
                    <Icon className={cn("size-5", color)} />
                  </div>
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="w-full bg-muted/40 py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="outline" className="text-primary border-primary/30">How it Works</Badge>
            <h2 className="text-3xl font-bold text-foreground">Three steps to get started</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                icon: Briefcase,
                title: "Post a Job",
                desc: "Register work orders on-chain via OrbitRegistry. Immutable, transparent, and verifiable.",
              },
              {
                num: "02",
                icon: Send,
                title: "Send XLM",
                desc: "Pay freelancers cross-border in seconds. Real-time balance, instant settlement.",
              },
              {
                num: "03",
                icon: Star,
                title: "Build Reputation",
                desc: "On-chain track record via OrbitReputation. Every completed order builds your profile.",
              },
            ].map(({ num, icon: Icon, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
              >
                <Card className="glass h-full">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold gradient-text font-mono">{num}</span>
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="size-4 text-primary" />
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature CTA ── */}
      <section className="w-full max-w-5xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass glow-primary border-primary/20">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <Badge variant="outline" className="text-accent border-accent/30">For Freelancers</Badge>
              <h2 className="text-3xl font-bold text-foreground">
                Start earning on{" "}
                <span className="gradient-text">Stellar</span>
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Browse open work orders, apply in seconds, and get paid in XLM. No banks, no borders, no intermediaries.
              </p>
              <Button variant="glow" size="lg" asChild>
                <Link href="/jobs" className="flex items-center gap-2">
                  Browse Job Board <ChevronRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* ── Feature grid ── */}
      <section className="w-full max-w-5xl px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Briefcase,
              title: "Job Board",
              desc: "Browse open work orders or post your own. All jobs are stored immutably on the Stellar blockchain via the OrbitRegistry contract.",
              href: "/jobs",
              color: "text-accent",
              bg: "bg-accent/10",
            },
            {
              icon: Send,
              title: "XLM Payments",
              desc: "Send XLM cross-border in seconds. Real-time balance, full transaction history, and Stellar Testnet faucet integration.",
              href: "/send",
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              icon: Shield,
              title: "Smart Contracts",
              desc: "Work orders are registered on the OrbitRegistry Soroban contract — transparent, immutable, and verifiable on-chain.",
              href: "/contract",
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              icon: Star,
              title: "On-Chain Reputation",
              desc: "Your completed orders build your on-chain track record on Stellar Testnet — visible to any client worldwide.",
              href: "/dashboard",
              color: "text-accent",
              bg: "bg-accent/10",
            },
          ].map(({ icon: Icon, title, desc, href, color, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ scale: 1.01 }}
            >
              <Link href={href} className="group block h-full">
                <Card className="glass h-full hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
                        <Icon className={cn("size-5", color)} />
                      </div>
                      <h3 className="font-semibold text-foreground">{title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    <p className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore {title} <ArrowRight className="size-3" />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
