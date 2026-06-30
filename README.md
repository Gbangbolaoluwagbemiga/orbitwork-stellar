# OrbitWork 🪐

<div align="center">

**A Stellar-powered freelance payments dApp — connect your wallet, check your XLM balance, send transactions, and interact with a live Soroban smart contract on Stellar Testnet.**

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-7D00FF?style=flat-square&logo=stellar)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-FF6B6B?style=flat-square)](https://soroban.stellar.org)

> **Rise In — Stellar Journey to Mastery · Yellow Belt Level 2 Submission**

</div>

---

## Smart Contract (Yellow Belt Level 2)

### Deployed Contract

| Field | Value |
|---|---|
| **Contract ID** | `CBWAGSMUHYU2LNFGQ6CJ4B6DCUJILOZZU4GNIGCYYWWQQBGCUOL3Q43H` |
| **Network** | Stellar Testnet |
| **Deploy Transaction** | `15bdf15b5a255c608603c4d3a9f716ec0eeb1b99fb57e8f6924b395da08f2e79` |

### Contract Call Transaction

A `create_order` call was made on-chain to demonstrate real Soroban contract interaction:

| Field | Value |
|---|---|
| **Function** | `create_order` |
| **Transaction Hash** | `5322718448f82a2a65c8a7f1ce2b3424f07319babaa5777d55054cdcedc03652` |
| **Result** | Order #2 created — "Yellow Belt Level 2 - OrbitWork Registry Demo" |
| **Explorer** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/5322718448f82a2a65c8a7f1ce2b3424f07319babaa5777d55054cdcedc03652) |

### Contract Overview

The **OrbitRegistry** Soroban contract is a work-order registry that stores freelance job orders on-chain. It demonstrates:

- `create_order(client, title, amount)` — writes a `WorkOrder` struct to persistent ledger storage, emits a `created` event, returns an auto-incremented order ID
- `get_order(id)` — reads a work order by ID
- `get_count()` — returns total number of orders stored

```rust
#[contracttype]
pub struct WorkOrder {
    pub id: u64,
    pub client: Address,
    pub title: String,
    pub amount: i128,    // stroops (1 XLM = 10_000_000)
    pub status: u32,     // 0=open, 1=completed, 2=cancelled
    pub created_at: u64,
}
```

Source: [`contracts/orbit-registry/src/lib.rs`](contracts/orbit-registry/src/lib.rs)

### Calling the Contract (CLI)

```bash
# Deploy
stellar contract deploy \
  --wasm contracts/orbit-registry/target/wasm32-unknown-unknown/release/orbit_registry.wasm \
  --source me \
  --network testnet

# Invoke create_order
stellar contract invoke \
  --id CBWAGSMUHYU2LNFGQ6CJ4B6DCUJILOZZU4GNIGCYYWWQQBGCUOL3Q43H \
  --source me \
  --network testnet \
  --send=yes \
  -- create_order \
  --client <YOUR_STELLAR_ADDRESS> \
  --title "My First Work Order" \
  --amount 1000000000

# Read order count
stellar contract invoke \
  --id CBWAGSMUHYU2LNFGQ6CJ4B6DCUJILOZZU4GNIGCYYWWQQBGCUOL3Q43H \
  --source me \
  --network testnet \
  -- get_count
```

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Yellow Belt Level 2 Features](#yellow-belt-level-2-features)
- [Smart Contract](#smart-contract-yellow-belt-level-2)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Error Handling](#error-handling)
- [Stellar Integration Details](#stellar-integration-details)
- [What I Learned](#what-i-learned)
- [Roadmap](#roadmap)

---

## Overview

OrbitWork is a decentralized application (dApp) built on the **Stellar blockchain** as the Yellow Belt Level 2 submission for the Rise In *Stellar Journey to Mastery* program.

This level builds on White Belt fundamentals, adding:

- **Multi-wallet support** via StellarWalletsKit (Freighter, xBull, LOBSTR, and more)
- **Soroban smart contract** deployed on Stellar Testnet and called from the frontend
- **Real-time contract events** streamed via Soroban RPC
- **Transaction status tracking** with live progress states
- **3 distinct error types** classified and handled for clear UX

The name **OrbitWork** reflects the mission: work that revolves around a trustless, decentralized financial core. The platform is evolving into a full freelance marketplace on Stellar with Soroban escrow payments.

---

## Live Demo

🚀 **Deployed:** [orbitwork.vercel.app](https://orbitwork.vercel.app) *(update after deployment)*

---

## Yellow Belt Level 2 Features

### ✅ Multi-Wallet Support
- **StellarWalletsKit** integration supports multiple wallet providers
- Wallet selection modal with visual wallet picker
- Freighter, xBull, LOBSTR wallets detected and listed
- Graceful fallback messaging when no wallet is installed

### ✅ Soroban Smart Contract Deployed on Testnet
- `OrbitRegistry` contract deployed at `CBWAGSMUHYU2LNFGQ6CJ4B6DCUJILOZZU4GNIGCYYWWQQBGCUOL3Q43H`
- Built with **Soroban SDK v22.0.0** in Rust
- Stores `WorkOrder` structs in persistent ledger storage with TTL extension
- Emits on-chain events for every created order

### ✅ Contract Called From Frontend
- `createOrder()` in `lib/contract.ts` builds, simulates, assembles, signs, and submits a Soroban transaction
- Full Soroban RPC flow: simulate → assemble (adds footprint + resource fee) → sign → submit → poll
- Users fill a form in the Contract Panel and call the contract directly from the browser

### ✅ Transaction Status Visible
- Transaction state machine: **idle → signing → submitting → success / error**
- Success panel shows transaction hash with a direct Stellar Expert Explorer link
- Polling `rpc.getTransaction(hash)` until `SUCCESS` or `FAILED` status

### ✅ Real-Time Event Integration
- `fetchContractEvents()` polls Soroban RPC for `created` events from the contract
- Event feed auto-refreshes every 15 seconds in the Contract Panel
- Each event displays order ID, amount, title, ledger number, and tx hash

### ✅ 3 Error Types Handled

| Error Type | Trigger | User Message |
|---|---|---|
| `wallet_not_found` | Freighter / wallet not installed | "Wallet extension not found — install Freighter" |
| `rejected` | User cancels Freighter signing popup | "Transaction rejected — you cancelled the request" |
| `insufficient` | Account unfunded (Horizon 404) | "Account not funded — use the testnet faucet first" |

Plus `wrong_network` (Freighter set to Mainnet) and generic `contract` errors as bonus.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Wallet | StellarWalletsKit + Freighter API v6 |
| Blockchain SDK | Stellar SDK v15 (`@stellar/stellar-sdk`) |
| Smart Contracts | Soroban SDK v22 (Rust) |
| RPC | Soroban RPC (`https://soroban-testnet.stellar.org`) |
| Horizon | `https://horizon-testnet.stellar.org` |
| Network | Stellar Testnet |
| Deployment | Vercel |

---

## Architecture

```
OrbitWork
│
├── contracts/
│   └── orbit-registry/
│       ├── Cargo.toml             # Soroban contract manifest
│       └── src/lib.rs             # OrbitRegistry contract (Rust)
│
├── contexts/
│   └── wallet-context.tsx         # React Context — wallet state, connect, disconnect
│
├── lib/
│   ├── stellar.ts                 # Horizon: getXLMBalance, sendXLM, helpers
│   └── contract.ts                # Soroban RPC: getOrderCount, getOrder, createOrder, fetchContractEvents
│
├── components/
│   ├── orbit-logo.tsx             # Animated SVG orbital logo
│   ├── navbar.tsx                 # Top navigation
│   ├── wallet-button.tsx          # Connect / disconnect with wallet modal
│   ├── balance-card.tsx           # XLM balance + faucet link
│   ├── send-xlm-form.tsx          # XLM payment form
│   └── contract-panel.tsx         # Soroban contract UI (create order, event feed)
│
└── app/
    ├── layout.tsx                 # Root layout with WalletProvider
    ├── globals.css                # Dark space theme, keyframe animations
    └── page.tsx                   # Landing / Dashboard
```

### Soroban Transaction Flow

```
User fills "Create Order" form in ContractPanel
    │
    ▼
createOrder({ clientAddress, title, amountXlm, signFn })
    │
    ├─ rpc.getAccount(clientAddress)         → unfunded? throw "insufficient"
    │
    ├─ TransactionBuilder + contract.call("create_order", ...)
    │
    ├─ rpc.simulateTransaction(tx)           → get footprint + resource fee
    │       └─ isSimulationError? → throw error
    │
    ├─ SorobanRpc.assembleTransaction(tx, sim).build()
    │
    ├─ signFn(assembled.toXDR())             → Freighter signing popup
    │       └─ user rejects? → throw "rejected"
    │
    ├─ rpc.sendTransaction(signedTx)         → submit to Stellar Testnet
    │
    └─ poll rpc.getTransaction(hash) every 1.5s
            └─ SUCCESS → return { hash, orderId }
            └─ FAILED  → throw "Transaction failed on-chain"
```

---

## Getting Started

### Prerequisites

| Requirement | Notes |
|---|---|
| Node.js 18+ | LTS recommended |
| npm 9+ | Bundled with Node |
| Freighter wallet | Install from [freighter.app](https://www.freighter.app/) |
| Rust + cargo | Only needed to rebuild the contract |
| Stellar CLI | Only needed to redeploy the contract |

### 1. Clone the repository

```bash
git clone https://github.com/Gbangbolaoluwagbemiga/orbitwork.git
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
3. Create or import a Stellar wallet

### 5. Fund your testnet account

```
https://laboratory.stellar.org/#account-creator?network=test
```

Or click the **faucet link** on the Balance Card in the app.

### 6. (Optional) Rebuild and redeploy the contract

```bash
cd contracts/orbit-registry
cargo build --target wasm32-unknown-unknown --release

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/orbit_registry.wasm \
  --source me \
  --network testnet
```

Then update `CONTRACT_ID` in [`lib/contract.ts`](lib/contract.ts).

---

## Usage Guide

### Connecting Your Wallet

1. Click **"Connect Wallet"** — a wallet selection modal appears
2. Choose your wallet provider (Freighter recommended for testnet)
3. Approve the connection in your wallet extension
4. Dashboard loads with your wallet address and live XLM balance

### Creating a Work Order (Soroban Contract)

1. Scroll to the **Stellar Smart Contract** section on the dashboard
2. Fill in a **title** and **amount** (in XLM)
3. Click **"Create Order on Testnet"**
4. Freighter opens — review and **Confirm** the transaction
5. Status bar shows: Signing → Submitting → Success
6. On success: Order ID and transaction hash appear with an Explorer link
7. The **Event Feed** updates automatically with the new `created` event

### Sending XLM

1. Find the **Send XLM** panel on the dashboard
2. Enter a destination Stellar address and amount
3. Click **Send XLM →** and confirm in Freighter

---

## Error Handling

OrbitWork classifies every error into a specific type for clear, actionable messaging:

```typescript
// Error classification in contract-panel.tsx
function classifyError(err: unknown): ErrorType {
  const m = String(err instanceof Error ? err.message : err).toLowerCase();
  if (m.startsWith("freighter is set to"))        return "wrong_network";
  if (m.includes("account not found") ||
      m.includes("fund it via"))                  return "insufficient";
  if (m.includes("not found") ||
      m.includes("not installed"))                return "wallet_not_found";
  if (m.includes("rejected") ||
      m.includes("denied") ||
      m.includes("cancel"))                       return "rejected";
  return "contract";
}
```

| Type | Icon | Message shown |
|---|---|---|
| `wallet_not_found` | 🔌 | Wallet extension not installed |
| `wrong_network` | 🌐 | Freighter set to wrong network |
| `rejected` | ✋ | User cancelled the signing popup |
| `insufficient` | 💸 | Account not funded — faucet link shown |
| `contract` | ⚠️ | On-chain or simulation error with details |

---

## Stellar Integration Details

### Soroban RPC (SDK v15 — critical namespace change)

```typescript
// SDK v15 breaking change: StellarSdk.SorobanRpc does NOT exist
// Correct import:
import { rpc as SorobanRpc } from "@stellar/stellar-sdk";

const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");

// Simulate → Assemble → Sign → Submit → Poll
const sim = await server.simulateTransaction(tx);
const assembled = SorobanRpc.assembleTransaction(tx, sim).build();
const sendResp = await server.sendTransaction(signedTx);

// Poll until confirmed
const status = await server.getTransaction(hash);
// status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS
```

### Contract Call with Auth

```typescript
contract.call(
  "create_order",
  StellarSdk.Address.fromString(clientAddress).toScVal(), // Address type
  StellarSdk.nativeToScVal(title, { type: "string" }),    // String type
  StellarSdk.nativeToScVal(stroops, { type: "i128" })     // i128 type
)
```

The contract uses `client.require_auth()` — Soroban automatically adds the authorization to the assembled transaction.

### Real-Time Events

```typescript
const ledger = await rpc.getLatestLedger();
const resp = await rpc.getEvents({
  startLedger: ledger.sequence - 2000,
  filters: [{ type: "contract", contractIds: [CONTRACT_ID] }],
  limit: 10,
});
```

### Wallet Connection (StellarWalletsKit)

```typescript
import { StellarWalletsKit, WalletNetwork, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit";

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
});

await kit.openModal({ onWalletSelected: async (option) => {
  kit.setWallet(option.id);
  const { address } = await kit.getAddress();
}});

// Sign a Soroban transaction
const { signedTxXdr } = await kit.signTransaction(txXdr, {
  networkPassphrase: Networks.TESTNET,
});
```

---

## What I Learned

### Level 1 (White Belt)
1. **Stellar's account model** — base reserve, `createAccount` vs `payment` op
2. **Freighter's permission architecture** — private keys never leave the extension
3. **Horizon API** — balances as `BalanceLine[]`, native XLM vs custom tokens
4. **Transaction lifecycle** — Build → Sign → Submit; `setTimeout()` is mandatory
5. **Next.js + Web3** — blockchain libraries must live in `"use client"` components

### Level 2 (Yellow Belt)
6. **Soroban SDK v22** — `#[contract]`, `#[contractimpl]`, `#[contracttype]`, `require_auth()`, persistent storage, TTL extension, `env.events().publish()`
7. **Stellar SDK v15 breaking change** — `StellarSdk.SorobanRpc` does not exist; must use `import { rpc as SorobanRpc } from "@stellar/stellar-sdk"`
8. **Soroban RPC flow** — simulate (get footprint) → `assembleTransaction` (adds resource fee) → sign → submit → poll `getTransaction()`
9. **ScVal encoding** — `Address.fromString(addr).toScVal()` for Address, `nativeToScVal(v, { type })` for primitives, `scValToNative()` to decode results
10. **Horizon 404 for unfunded accounts** — must catch and classify distinctly from "wallet not found" errors
11. **Error classification order matters** — check `wrong_network` before `wallet_not_found` or substring matches collide

---

## Roadmap

| Level | Belt | Status | Focus |
|---|---|---|---|
| 1 | ⚪ White Belt | ✅ Accepted | Wallet connect, XLM balance, send transaction |
| 2 | 🟡 Yellow Belt | 🔄 Submitted | Multi-wallet, Soroban contract, real-time events |
| 3 | 🟠 Orange Belt | ⏳ Next | Escrow contract, milestone payments, testing |
| 4 | 🟢 Green Belt | ⏳ | Production MVP, advanced contract features |
| 5 | 🔵 Blue Belt | ⏳ | 50 users, feedback loop, pitch deck |
| 6 | ⚫ Black Belt | ⏳ | Mainnet launch, 30+ real users, security audit |
| 7 | 🏆 Master Belt | ⏳ | Ecosystem acceleration, investor visibility |

The end goal is a fully decentralized freelance marketplace on Stellar with Soroban smart contract escrow, milestone payments, and on-chain reputation.

---

## License

MIT © [Oluwagbemiga Gbangbola](https://github.com/Gbangbolaoluwagbemiga)

---

<div align="center">

Built with ❤️ on [Stellar](https://stellar.org) · Submitted to [Rise In](https://risein.com)

**Yellow Belt — Level 2 · Stellar Journey to Mastery**

</div>
