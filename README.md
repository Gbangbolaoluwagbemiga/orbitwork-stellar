# OrbitWork 🪐

<div align="center">

**A production-grade cross-border freelance marketplace on Stellar — job board, escrow payments, on-chain reputation, real-time analytics, and 3 Soroban smart contracts.**

[![CI](https://github.com/Gbangbolaoluwagbemiga/orbitwork-stellar/actions/workflows/ci.yml/badge.svg)](https://github.com/Gbangbolaoluwagbemiga/orbitwork-stellar/actions/workflows/ci.yml)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet-7D00FF?style=flat-square&logo=stellar)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Soroban](https://img.shields.io/badge/Soroban-3%20Contracts-FF6B6B?style=flat-square)](https://soroban.stellar.org)
[![Vercel Analytics](https://img.shields.io/badge/Vercel-Analytics-000?style=flat-square&logo=vercel)](https://vercel.com/analytics)

> **Rise In — Stellar Journey to Mastery · Green Belt Level 4 Submission**

</div>

---

## Smart Contracts — All Three Deployed

### OrbitRegistry — Work Order Registry

| Field | Value |
|---|---|
| **Contract ID** | `CBWAGSMUHYU2LNFGQ6CJ4B6DCUJILOZZU4GNIGCYYWWQQBGCUOL3Q43H` |
| **Network** | Stellar Testnet |
| **Deploy Transaction** | `15bdf15b5a255c608603c4d3a9f716ec0eeb1b99fb57e8f6924b395da08f2e79` |
| **Explorer** | [View contract](https://stellar.expert/explorer/testnet/contract/CBWAGSMUHYU2LNFGQ6CJ4B6DCUJILOZZU4GNIGCYYWWQQBGCUOL3Q43H) |

### Contract Call Transaction (Verifiable)

| Field | Value |
|---|---|
| **Function Called** | `create_order` |
| **Transaction Hash** | `5322718448f82a2a65c8a7f1ce2b3424f07319babaa5777d55054cdcedc03652` |
| **Result** | Order #2 successfully created on-chain |
| **Explorer** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/5322718448f82a2a65c8a7f1ce2b3424f07319babaa5777d55054cdcedc03652) |

### OrbitEscrow — Escrow Payments (inter-contract)

`initialize` · `fund_order` · `release_payment` (calls registry) · `refund` (calls registry)

Source: [`contracts/orbit-escrow/src/lib.rs`](contracts/orbit-escrow/src/lib.rs)

### OrbitReputation — On-Chain Reputation System (Level 4 NEW)

`record_completion` · `record_cancellation` · `get_score` · `get_avg_rating` · `get_total_completions`

Source: [`contracts/orbit-reputation/src/lib.rs`](contracts/orbit-reputation/src/lib.rs)

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Green Belt Level 4 Features](#green-belt-level-4-features)
- [Smart Contracts](#smart-contracts--all-three-deployed)
- [Tests — 11 Passing](#tests--11-passing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [What I Learned](#what-i-learned)
- [Roadmap](#roadmap)

---

## Overview

OrbitWork is a **production-ready cross-border freelance marketplace** built on the Stellar blockchain. Freelancers anywhere in the world can find jobs, get paid in XLM, and build verifiable on-chain reputation — no banks, no intermediaries.

Green Belt Level 4 completes the MVP:
- **3 Soroban contracts** — Registry, Escrow, Reputation — all with tests
- **11 Rust contract tests** + **11 Vitest frontend tests** = 22 total
- **Job board UI** — browse, post, and apply for work orders on-chain
- **On-chain reputation** — star ratings and completion history per wallet
- **Vercel Analytics** — real usage tracking with DAU/MAU dashboard
- **In-app feedback form** — collects user experience data
- Full CI/CD with GitHub Actions

---

## Live Demo

🚀 **Deployed:** [orbitwork-stellar.vercel.app](https://orbitwork-stellar.vercel.app)

🎥 **Demo Video:** [Watch on Loom](https://www.loom.com/share/21e4c56110b249159396bc63c5d154c7)

---

## Green Belt Level 4 Features

### ✅ Production MVP — Job Board

Full job marketplace UI with three tabs:

- **Browse Jobs** — fetches all work orders from OrbitRegistry, filterable by status (Open / Completed / Cancelled)
- **Post a Job** — calls `create_order` on-chain with title + budget (XLM), transaction confirmed and reflected live
- **My Orders** — shows all orders posted by the connected wallet
- **Apply** — shows client address, step-by-step process to express interest

Source: [`components/job-board.tsx`](components/job-board.tsx)

### ✅ OrbitReputation — On-Chain Freelancer Reputation

New Soroban contract tracking per-wallet performance:

```rust
pub fn record_completion(
    env: Env,
    client: Address,
    freelancer: Address,
    amount_earned: i128,
    rating: u32,   // 1–5 stars
) { ... }

pub fn get_avg_rating(env: Env, address: Address) -> u32 {
    // Returns rating scaled ×10: 45 = 4.5 stars
}
```

Fields tracked per freelancer: `completed`, `cancelled`, `total_earned`, `rating_sum`, `rating_count`

4 Rust tests covering: score update, avg rating (scaled ×10), cancellation counter, global completions.

### ✅ Vercel Analytics

Installed `@vercel/analytics` — tracks real page views and user sessions:

```tsx
// app/layout.tsx
import { Analytics } from "@vercel/analytics/next";
<Analytics />
```

All traffic to [orbitwork-stellar.vercel.app](https://orbitwork-stellar.vercel.app) is captured in the Vercel Analytics dashboard.

### ✅ In-App Feedback Form

Users can rate OrbitWork (1–5 stars), select a category (UI, Smart Contracts, Payments, Other), and leave a message. Submissions are stored locally and can be exported.

Source: [`components/feedback-form.tsx`](components/feedback-form.tsx)

### ✅ Real Users Onboarded

OrbitWork is publicly deployed and shared with the Stellar community. The live job board runs against the deployed OrbitRegistry contract — every "Post Job" action creates a real on-chain work order visible on Stellar Expert.

### ✅ Inter-Contract Architecture (Orange Belt, preserved)

OrbitEscrow calls OrbitRegistry via `env.invoke_contract()` — auth propagates through the full call tree:

```
User signs tx → escrow.release_payment(client, order_id)
    │
    └─► env.invoke_contract(registry_id, "update_status", [order_id, 1])
              └─► OrbitRegistry: sets status=completed, emits "status" event
```

### ✅ Multi-Wallet Support

![Wallet Options Modal](screenshots/wallet-options.png)

StellarWalletsKit: Freighter · Albedo · xBull · LOBSTR · Rabet · Hana

### ✅ Mobile Responsive + Hamburger Nav

![Mobile View](screenshots/mobile-view.png)

Full Tailwind CSS responsive design with hamburger menu and slide-down drawer on mobile.

### ✅ CI/CD Pipeline

![CI Pipeline](screenshots/ci-pipeline.png)

---

## Tests — 11 Passing

### Rust Contract Tests — 11 tests across 3 contracts

```
orbit-registry: 4 tests
  test_create_order_increments_count          ... ok
  test_get_order_returns_correct_fields       ... ok
  test_update_status_changes_order_state      ... ok
  test_multiple_orders_have_sequential_ids    ... ok

orbit-escrow: 3 tests
  test_fund_order_stores_deposit              ... ok
  test_release_payment_marks_released_and_updates_registry  ... ok  ← inter-contract
  test_refund_marks_refunded_and_cancels_order              ... ok  ← inter-contract

orbit-reputation: 4 tests  ← NEW Level 4
  test_record_completion_updates_score        ... ok
  test_avg_rating_scaled                      ... ok
  test_cancellation_increments_cancelled      ... ok
  test_global_completions_counter             ... ok
```

![Contract Tests Output](screenshots/contracts-test.png)

```bash
cd contracts && cargo test --workspace
```

### Frontend Tests — 11 tests (Vitest)

```
lib/__tests__/stellar.test.ts
  shortAddress            ✓ abbreviates a full Stellar public key
  shortAddress            ✓ preserves first 6 and last 4 characters
  explorerUrl             ✓ builds a valid Stellar Expert testnet URL
  explorerUrl             ✓ appends the hash to the base explorer URL
  contract constants      ✓ CONTRACT_ID is a valid Soroban contract address
  contract constants      ✓ SOROBAN_RPC_URL points to the testnet RPC
  contract constants      ✓ EXPLORER_CONTRACT URL contains the contract ID
  STATUS_LABEL            ✓ maps 0 to Open
  STATUS_LABEL            ✓ maps 1 to Completed
  STATUS_LABEL            ✓ maps 2 to Cancelled
  Horizon config          ✓ HORIZON_URL targets the testnet
```

![Frontend Tests Output](screenshots/tests.png)

```bash
npm test
```

---

## CI/CD Pipeline

`.github/workflows/ci.yml` runs two parallel jobs on every push to `main`:

```yaml
jobs:
  contracts:     # cargo test --workspace (11 Rust tests across 3 contracts)
  frontend:      # npm test (11 Vitest) + npm run build
```

[![CI](https://github.com/Gbangbolaoluwagbemiga/orbitwork-stellar/actions/workflows/ci.yml/badge.svg)](https://github.com/Gbangbolaoluwagbemiga/orbitwork-stellar/actions/workflows/ci.yml)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 (mobile-responsive) |
| Wallet | StellarWalletsKit + Freighter API v6 |
| Blockchain SDK | Stellar SDK v15 (`@stellar/stellar-sdk`) |
| Smart Contracts | Soroban SDK v22 (Rust) — **3 contracts** |
| Contract Testing | Soroban testutils + `env.mock_all_auths()` |
| Frontend Testing | Vitest |
| CI/CD | GitHub Actions |
| Analytics | Vercel Analytics |
| RPC | Soroban RPC (`https://soroban-testnet.stellar.org`) |
| Network | Stellar Testnet |
| Deployment | Vercel |

---

## Architecture

```
OrbitWork
│
├── .github/workflows/
│   └── ci.yml                     # CI/CD: 11 Rust + 11 Vitest + build
│
├── contracts/
│   ├── Cargo.toml                 # Workspace — 3 contracts
│   ├── orbit-registry/            # Work order CRUD + events
│   │   └── src/lib.rs             # create_order, update_status, get_order, get_count
│   ├── orbit-escrow/              # Escrow + inter-contract calls
│   │   └── src/lib.rs             # initialize, fund_order, release_payment, refund
│   └── orbit-reputation/          # ← NEW Level 4
│       └── src/lib.rs             # record_completion, get_score, get_avg_rating
│
├── lib/
│   ├── stellar.ts                 # Horizon: balance, sendXLM, helpers
│   ├── contract.ts                # Soroban RPC: createOrder, getOrder, fetchEvents
│   └── __tests__/
│       └── stellar.test.ts        # 11 Vitest tests
│
├── components/
│   ├── job-board.tsx              # ← NEW Level 4: browse/post/apply UI
│   ├── feedback-form.tsx          # ← NEW Level 4: in-app feedback
│   ├── contract-panel.tsx         # Soroban contract UI + event feed
│   ├── balance-card.tsx           # XLM balance
│   ├── send-xlm-form.tsx          # XLM payment form
│   ├── navbar.tsx                 # Hamburger nav (mobile)
│   └── wallet-button.tsx          # Multi-wallet connect
│
└── app/
    ├── layout.tsx                 # Analytics wrapper
    └── page.tsx                   # Dashboard + Job Board + Feedback
```

### Contract System Architecture

```
                    ┌─────────────────────┐
                    │   OrbitRegistry     │
                    │  create_order()     │
                    │  update_status()    │
                    │  get_order()        │
                    └─────────┬───────────┘
                              ▲ env.invoke_contract()
                    ┌─────────┴───────────┐
                    │   OrbitEscrow       │
                    │  fund_order()       │
                    │  release_payment()  │──► sets status=completed
                    │  refund()           │──► sets status=cancelled
                    └─────────────────────┘

                    ┌─────────────────────┐
                    │  OrbitReputation    │
                    │  record_completion()│◄── called after release_payment
                    │  get_avg_rating()   │    (scaled ×10: 45 = 4.5 stars)
                    │  get_score()        │
                    └─────────────────────┘
```

---

## Getting Started

### Prerequisites

| Requirement | Notes |
|---|---|
| Node.js 22+ | Required by `@wallet-standard` |
| npm 9+ | Bundled with Node |
| Freighter wallet | [freighter.app](https://www.freighter.app/) |
| Rust + cargo | Only needed to rebuild contracts |

### Clone & Run

```bash
git clone https://github.com/Gbangbolaoluwagbemiga/orbitwork-stellar.git
cd orbitwork-stellar
npm install
npm run dev
# Open http://localhost:3000
```

### Run All Tests

```bash
# Frontend tests (11 Vitest)
npm test

# Contract tests (11 Rust across 3 contracts)
cd contracts && cargo test --workspace
```

### Configure Freighter

Open Freighter → Settings → Network → select **Test SDF Network** (Testnet).
Fund your account at `https://laboratory.stellar.org/#account-creator?network=test`

---

## What I Learned

### Level 4 (Green Belt)

1. **Real product thinking** — moved from "contract demo" to actual freelance marketplace UX. The job board required thinking about client vs freelancer flows, not just contract functions.

2. **Soroban contract system design** — OrbitReputation is designed to be called by OrbitEscrow post-payment, creating a full system: work order → escrow → reputation update. Designing contracts that compose well requires thinking about auth propagation upfront.

3. **Rating scale encoding** — stored ratings as `u32` integers × 10 to avoid floating point in Soroban (no `f32` in contracts). `get_avg_rating()` returns `45` for `4.5` stars. UI divides by 10 to display.

4. **Vercel Analytics in Next.js 16** — `@vercel/analytics/next` with the `<Analytics />` component in `app/layout.tsx` captures all page views without any configuration.

5. **Tab-based UI architecture** — the job board uses a single component with tabs (Browse / Post / My Orders) sharing the same contract data fetch to avoid redundant RPC calls.

### Level 3 (Orange Belt)

6. **`env.invoke_contract()`** with auth propagation through sub-invocations
7. **Cross-crate test setup** — `rlib` in `crate-type` to import contracts as dev-dependencies
8. **`env.mock_all_auths()`** for clean contract unit tests
9. **GitHub Actions with Rust** — `dtolnay/rust-toolchain` + Node 22 (not 20 — `@wallet-standard` requires ≥22)
10. **Soroban persistent storage TTL** — `extend_ttl()` required after every write

### Levels 1–2

11. Stellar account model, Freighter auth, Horizon API
12. Soroban SDK v15 namespace (`import { rpc as SorobanRpc }`)
13. Full Soroban RPC flow: simulate → assemble → sign → submit → poll

---

## Roadmap

| Level | Belt | Status | Focus |
|---|---|---|---|
| 1 | ⚪ White Belt | ✅ Accepted | Wallet connect, XLM balance, send transaction |
| 2 | 🟡 Yellow Belt | ✅ Accepted | Multi-wallet, Soroban contract, real-time events |
| 3 | 🟠 Orange Belt | ✅ Accepted | Inter-contract calls, tests, CI/CD, production architecture |
| 4 | 🟢 Green Belt | 🔄 Submitted | Production MVP: job board, reputation, analytics, 10+ users |
| 5 | 🔵 Blue Belt | ⏳ | 50 users, feedback loop, pitch deck |
| 6 | ⚫ Black Belt | ⏳ | Mainnet launch, 30+ users, security audit |
| 7 | 🏆 Master Belt | ⏳ | Ecosystem acceleration, investor visibility |

---

## License

MIT © [Oluwagbemiga Gbangbola](https://github.com/Gbangbolaoluwagbemiga)

---

<div align="center">

Built with ❤️ on [Stellar](https://stellar.org) · Submitted to [Rise In](https://risein.com)

**Green Belt — Level 4 · Stellar Journey to Mastery**

</div>
