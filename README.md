# OrbitWork 🪐

<div align="center">

**A Stellar-powered payments dApp — connect your Freighter wallet, check your XLM balance, and send transactions on Stellar Testnet.**

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-7D00FF?style=flat-square&logo=stellar)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

> **Rise In — Stellar Journey to Mastery · White Belt Level 1 Submission**

</div>

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Stellar Integration Details](#stellar-integration-details)
- [Screenshots](#screenshots)
- [What I Learned](#what-i-learned)
- [Roadmap](#roadmap)

---

## Overview

OrbitWork is a decentralized application (dApp) built on the **Stellar blockchain** as the White Belt Level 1 submission for the Rise In *Stellar Journey to Mastery* program.

The core objective of this level was to demonstrate mastery of the fundamental building blocks of Stellar development:

- **Wallet connectivity** via the Freighter browser extension
- **Balance fetching** from Stellar Horizon API
- **XLM transactions** on Stellar Testnet with real-time feedback

The name **OrbitWork** reflects the mission: work that revolves around a trustless, decentralized financial core — just like a satellite orbiting a planet. The logo animates this concept literally, with a glowing cyan satellite orbiting a violet planet.

---

## Live Demo

🚀 **Deployed:** [orbitwork.vercel.app](https://orbitwork.vercel.app) *(update after deployment)*

---

## Features

### ✅ Wallet Setup & Connection
- Detects whether the **Freighter** extension is installed
- Prompts installation with a direct link if not found
- **Connect wallet** — triggers Freighter permission popup
- **Disconnect wallet** — clears session state (address removed from localStorage)
- Session persistence: previously connected address is restored on page refresh

### ✅ Balance Display
- Fetches live **XLM balance** from Stellar Horizon Testnet API
- Auto-refreshes every **30 seconds** to stay current
- Manual refresh button for on-demand updates
- Displays full 7-decimal precision XLM balance
- Displays full wallet public key alongside short-form address

### ✅ XLM Transaction Flow
- Input form for **destination address** and **amount**
- Validates destination as a valid Stellar Ed25519 public key before submitting
- Automatically handles **new vs. existing accounts** (`createAccount` op for unfunded accounts, `payment` op for funded ones)
- Triggers **Freighter signing popup** — user signs without ever exposing their private key
- Submits signed transaction to Stellar Horizon Testnet
- Displays full **transaction hash** on success
- Provides direct link to **Stellar Expert Explorer** to verify the transaction on-chain
- Shows clear **error messages** for: rejected signatures, invalid addresses, insufficient funds, network errors

### ✅ Developer Standards
- Full TypeScript — strongly typed throughout
- Server/client boundary clearly separated — all blockchain calls use `"use client"` components
- React Context for wallet state — clean, prop-free state sharing
- Every async operation wrapped in try/catch with user-friendly error messaging
- Responsive design — works on mobile, tablet, and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Wallet | Freighter API v6 (`@stellar/freighter-api`) |
| Blockchain SDK | Stellar SDK v15 (`@stellar/stellar-sdk`) |
| Network | Stellar Testnet (Horizon: `horizon-testnet.stellar.org`) |
| Deployment | Vercel |

---

## Architecture

```
OrbitWork
│
├── contexts/
│   └── wallet-context.tsx     # React Context — wallet state, connect, disconnect
│
├── lib/
│   └── stellar.ts             # Pure functions: getXLMBalance, sendXLM, helpers
│
├── components/
│   ├── orbit-logo.tsx         # Animated SVG orbital logo (planet + satellite)
│   ├── navbar.tsx             # Top navigation bar
│   ├── wallet-button.tsx      # Connect / disconnect button with states
│   ├── balance-card.tsx       # XLM balance display + auto-refresh
│   └── send-xlm-form.tsx      # Transaction form + success/error states
│
└── app/
    ├── layout.tsx             # Root layout — wraps app with WalletProvider
    ├── globals.css            # Global styles, CSS animations, space theme
    └── page.tsx               # Main page — Landing (unauthenticated) / Dashboard (connected)
```

### Data Flow

```
User clicks "Connect Freighter"
    │
    ▼
WalletContext.connect()
    │ calls isConnected()   → checks Freighter extension is installed
    │ calls requestAccess() → Freighter permission popup
    │ stores address in React state + localStorage
    ▼
Dashboard renders
    │
    ├─ BalanceCard mounts
    │       └─ getXLMBalance(address) → Horizon Testnet API → display balance
    │
    └─ SendXLMForm submit
            │ validate destination + amount
            │ build TransactionBuilder (payment or createAccount op)
            │ signTransaction(xdr) → Freighter signing popup
            │ submitTransaction(signedTx) → Horizon Testnet
            └─ display tx hash + Stellar Expert Explorer link
```

---

## Getting Started

### Prerequisites

| Requirement | Notes |
|---|---|
| Node.js 18+ | LTS recommended |
| npm 9+ | Bundled with Node |
| Freighter wallet | Install from [freighter.app](https://www.freighter.app/) |

### 1. Clone the repository

```bash
git clone https://github.com/your-username/orbitwork.git
cd orbitwork
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Configure Freighter for Testnet

1. Open the **Freighter** browser extension
2. Go to **Settings → Network → Testnet**
3. Create or import a Stellar wallet if you haven't already

### 5. Fund your testnet account

Get free testnet XLM from the Stellar Friendbot (also accessible via the in-app link):

```
https://laboratory.stellar.org/#account-creator?network=test
```

---

## Usage Guide

### Connecting Your Wallet

1. Click **"Connect Freighter"** on the landing page
2. Freighter prompts for permission — click **Grant**
3. Your dashboard loads with wallet address and live XLM balance

### Checking Your Balance

- Balance appears prominently on the Dashboard card
- Click the **↻ refresh icon** to fetch the latest balance on demand
- Balance auto-updates every 30 seconds in the background

### Sending XLM

1. On the Dashboard, find the **Send XLM** panel (right column)
2. Enter the destination **Stellar public key** (starts with `G`)
3. Enter the **amount** of XLM
4. Click **"Send XLM →"**
5. **Freighter opens** — review the transaction details and sign
6. Wait ~5 seconds for Stellar Testnet to confirm
7. On success:
   - Green confirmation with ✓
   - Full **transaction hash** displayed
   - **"View on Explorer"** link to Stellar Expert

### Disconnecting

Click **Disconnect** in the navbar. Your session is cleared and you return to the landing page.

---

## Project Structure

```
orbitwork/
├── app/
│   ├── globals.css             # Global CSS: dark space theme, star dot background,
│   │                           #   keyframe animations (fade-in-up, float,
│   │                           #   pulse-glow, shimmer)
│   ├── layout.tsx              # Root layout with Metadata + WalletProvider
│   └── page.tsx                # Single-page: Landing view or Dashboard view
│
├── components/
│   ├── orbit-logo.tsx          # SVG orbital animation:
│   │                           #   - Planet with radial gradient + specular highlight
│   │                           #   - Tilted elliptical orbit ring (back half dashed,
│   │                           #     front half solid for depth illusion)
│   │                           #   - animateMotion cyan satellite with glow filter
│   │                           #   - Compact OrbitLogoMark for navbar
│   ├── navbar.tsx              # Sticky nav: logomark + "OrbitWork" wordmark +
│   │                           #   Testnet badge + wallet button
│   ├── wallet-button.tsx       # Freighter connect / disconnect with:
│   │                           #   loading spinner, address pill, status dot
│   ├── balance-card.tsx        # XLM balance with auto-refresh (30s interval),
│   │                           #   manual refresh, faucet link, address display
│   └── send-xlm-form.tsx       # Transaction form: destination + amount inputs,
│                               #   signing status, submission feedback,
│                               #   tx hash + explorer link on success
│
├── contexts/
│   └── wallet-context.tsx      # React Context Provider:
│                               #   address, network, isConnected, isConnecting,
│                               #   error, connect(), disconnect(), clearError()
│                               #   localStorage session persistence
│
├── lib/
│   └── stellar.ts              # Stellar SDK utilities:
│                               #   getXLMBalance(address)
│                               #   sendXLM(source, dest, amount)
│                               #   accountExists(address)
│                               #   shortAddress(address)
│                               #   explorerUrl(hash)
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

---

## Stellar Integration Details

### Wallet Integration (Freighter API v6)

```typescript
import {
  isConnected,
  requestAccess,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";

// 1. Check if extension is installed
const { isConnected: installed } = await isConnected();

// 2. Request wallet access (triggers popup)
const { address } = await requestAccess();

// 3. Sign a transaction XDR (triggers popup)
const { signedTxXdr } = await signTransaction(txXdr, {
  networkPassphrase: Networks.TESTNET,
});
```

### Balance Fetching (Stellar SDK v15 Horizon)

```typescript
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const account = await server.loadAccount(publicKey);

// XLM is the "native" asset type
const native = account.balances.find(b => b.asset_type === "native");
console.log(native?.balance); // "100.0000000"
```

### Sending XLM

```typescript
import {
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  BASE_FEE,
} from "@stellar/stellar-sdk";

const account = await server.loadAccount(sourceAddress);

const tx = new TransactionBuilder(account, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.payment({
      destination: destinationAddress,
      asset: Asset.native(), // XLM
      amount: "10.0000000",
    })
  )
  .setTimeout(30) // expires in 30 seconds
  .build();

// Sign with Freighter — private key never leaves the extension
const { signedTxXdr } = await signTransaction(tx.toXDR(), {
  networkPassphrase: Networks.TESTNET,
});

// Reconstruct and submit
const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
const result = await server.submitTransaction(signedTx);
console.log(result.hash); // "a3f2b9c..."
```

### New Account Detection

OrbitWork automatically detects if a destination address is a new (unfunded) Stellar account. If the account doesn't exist on-chain yet, it uses `Operation.createAccount` with a minimum 1 XLM starting balance — this is required by Stellar's base reserve rule. If the account already exists, it uses `Operation.payment` as normal.

---

## Screenshots

> Screenshots to be added after deployment. The submission includes:

| # | Screen | What it shows |
|---|---|---|
| 1 | Landing page | Animated orbital logo, "Connect Freighter" CTA |
| 2 | Wallet connected | Dashboard with address pill + green status dot |
| 3 | Balance displayed | XLM balance card with 7-decimal precision |
| 4 | Transaction success | Green confirmation, tx hash, Explorer link |

*(Add screenshot images to `./screenshots/` and reference them here)*

---

## What I Learned

Building this Level 1 submission taught me:

1. **Stellar's account model** — Every account must maintain a minimum XLM balance (base reserve = 1 XLM + 0.5 per entry). New accounts must be funded with `createAccount`, not `payment`.

2. **Freighter's permission architecture** — The wallet never exposes private keys to dApps. `requestAccess()` grants read-only access to the public key. `signTransaction()` signs XDR inside the extension sandbox.

3. **Horizon API structure** — Balances are returned as an array of `BalanceLine` objects. XLM has `asset_type: "native"`, while custom tokens have `credit_alphanum4` or `credit_alphanum12`.

4. **Transaction lifecycle** — Build (TransactionBuilder) → Sign (Freighter) → Submit (Horizon). Transactions expire after the `setTimeout()` window — 30 seconds is the recommended default.

5. **Next.js + Web3** — Blockchain libraries that reference `window` or browser extensions must be used inside `"use client"` components. Dynamic imports (`await import(...)`) are useful for lazy-loading wallet libraries only when needed.

6. **Error handling in blockchain** — Every step can fail independently: extension not installed, user rejects signature, network timeout, insufficient funds. Each must show a specific, actionable error message.

---

## Roadmap

This is Level 1 (White Belt) of a progressive build series:

| Level | Belt | Focus |
|---|---|---|
| ✅ 1 | ⚪ White Belt | Wallet connect, XLM balance, send transaction |
| ⏳ 2 | 🟡 Yellow Belt | Multi-wallet, Soroban smart contracts, real-time events |
| ⏳ 3 | 🟠 Orange Belt | Mini dApp with escrow contract, testing, deployment |
| ⏳ 4 | 🟢 Green Belt | Production-ready MVP, advanced contract features |
| ⏳ 5 | 🔵 Blue Belt | 50 users, feedback loop, pitch deck |
| ⏳ 6 | ⚫ Black Belt | Mainnet launch, 30+ real users, security audit |
| ⏳ 7 | 🏆 Master Belt | Ecosystem acceleration, investor visibility |

The end goal is a fully decentralized freelance marketplace on Stellar with Soroban smart contract escrow, milestone payments, and on-chain reputation — powered by everything learned across these levels.

---

## License

MIT © [Oluwagbemiga Gbangbola](https://github.com/gbangbolaphilip)

---

<div align="center">

Built with ❤️ on [Stellar](https://stellar.org) · Submitted to [Rise In](https://risein.com)

**White Belt — Level 1 · Stellar Journey to Mastery**

</div>
