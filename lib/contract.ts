import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc as SorobanRpc } from "@stellar/stellar-sdk";

export const CONTRACT_ID = "CBWAGSMUHYU2LNFGQ6CJ4B6DCUJILOZZU4GNIGCYYWWQQBGCUOL3Q43H";
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const EXPLORER_TX = "https://stellar.expert/explorer/testnet/tx";
export const EXPLORER_CONTRACT = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`;

export interface WorkOrder {
  id: number;
  client: string;
  title: string;
  amount: string; // in XLM (converted from stroops)
  status: 0 | 1 | 2;
  createdAt: number;
}

export const STATUS_LABEL: Record<number, string> = {
  0: "Open",
  1: "Completed",
  2: "Cancelled",
};

let _server: SorobanRpc.Server | null = null;

function getRpc(): SorobanRpc.Server {
  if (!_server) {
    _server = new SorobanRpc.Server(SOROBAN_RPC_URL, {
      allowHttp: false,
    });
  }
  return _server;
}

/** Read total work-order count from contract (no signing needed). */
export async function getOrderCount(): Promise<number> {
  const rpc = getRpc();
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  // Use a throwaway keypair for read-only simulation
  const dummyKey = StellarSdk.Keypair.random();
  const account = new StellarSdk.Account(dummyKey.publicKey(), "0");

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "1000000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("get_count"))
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  const result = sim.result?.retval;
  if (!result) return 0;
  return Number(StellarSdk.scValToNative(result));
}

/** Read a work order by ID. */
export async function getOrder(id: number): Promise<WorkOrder | null> {
  const rpc = getRpc();
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const dummyKey = StellarSdk.Keypair.random();
  const account = new StellarSdk.Account(dummyKey.publicKey(), "0");

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "1000000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "get_order",
        StellarSdk.nativeToScVal(id, { type: "u64" })
      )
    )
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) return null;

  const retval = sim.result?.retval;
  if (!retval) return null;

  const native = StellarSdk.scValToNative(retval) as {
    id: bigint;
    client: string;
    title: string;
    amount: bigint;
    status: number;
    created_at: bigint;
  } | null;

  if (!native) return null;

  return {
    id: Number(native.id),
    client: native.client,
    title: native.title,
    amount: (Number(native.amount) / 10_000_000).toFixed(7),
    status: native.status as 0 | 1 | 2,
    createdAt: Number(native.created_at),
  };
}

export interface CreateOrderParams {
  clientAddress: string;
  title: string;
  amountXlm: string;
  signFn: (xdr: string) => Promise<string>;
}

export interface ContractCallResult {
  hash: string;
  orderId: number;
}

/** Build, simulate, sign, and submit a create_order call. */
export async function createOrder({
  clientAddress,
  title,
  amountXlm,
  signFn,
}: CreateOrderParams): Promise<ContractCallResult> {
  // ── Validation ───────────────────────────────────────────────
  if (!title.trim()) throw new Error("Title cannot be empty");
  const xlm = parseFloat(amountXlm);
  if (isNaN(xlm) || xlm <= 0) throw new Error("Amount must be greater than 0");
  if (xlm > 900_000_000) throw new Error("Amount too large");

  const stroops = BigInt(Math.round(xlm * 10_000_000));
  const rpc = getRpc();
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  // ── Load account ─────────────────────────────────────────────
  let account: StellarSdk.Account;
  try {
    account = await rpc.getAccount(clientAddress);
  } catch {
    throw new Error("Account not found on Stellar testnet — fund it via the faucet first");
  }

  // ── Build tx ─────────────────────────────────────────────────
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "1000000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "create_order",
        StellarSdk.Address.fromString(clientAddress).toScVal(),
        StellarSdk.nativeToScVal(title.trim(), { type: "string" }),
        StellarSdk.nativeToScVal(stroops, { type: "i128" })
      )
    )
    .setTimeout(30)
    .build();

  // ── Simulate to get footprint + fee ──────────────────────────
  const sim = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) {
    const msg = sim.error ?? "Simulation failed";
    if (msg.includes("insufficient")) throw new Error("Insufficient balance to cover fees");
    throw new Error(`Contract error: ${msg}`);
  }

  // ── Assemble (adds footprint + resource fee) ─────────────────
  const assembled = SorobanRpc.assembleTransaction(tx, sim).build();

  // ── Sign via wallet ──────────────────────────────────────────
  let signedXdr: string;
  try {
    signedXdr = await signFn(assembled.toXDR());
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : (err as { message?: string })?.message ?? "Signing rejected";
    throw new Error(msg);
  }

  // ── Submit ────────────────────────────────────────────────────
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );

  const sendResp = await rpc.sendTransaction(signedTx);
  if (sendResp.status === "ERROR") {
    throw new Error(`Submission failed: ${sendResp.errorResult ?? "unknown error"}`);
  }

  // ── Poll until confirmed ─────────────────────────────────────
  const hash = sendResp.hash;
  let attempts = 0;
  while (attempts < 20) {
    await new Promise((r) => setTimeout(r, 1500));
    const status = await rpc.getTransaction(hash);
    if (status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      const retval = status.returnValue;
      const orderId = retval ? Number(StellarSdk.scValToNative(retval)) : 0;
      return { hash, orderId };
    }
    if (status.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain — check your balance and try again");
    }
    attempts++;
  }

  throw new Error("Transaction timed out — check Stellar Explorer for status");
}

/** Fetch recent contract events from Horizon. */
export async function fetchContractEvents(limit = 10): Promise<ContractEvent[]> {
  try {
    const rpc = getRpc();
    const ledger = await rpc.getLatestLedger();
    const startLedger = Math.max(1, ledger.sequence - 2000);

    const resp = await rpc.getEvents({
      startLedger,
      filters: [
        {
          type: "contract",
          contractIds: [CONTRACT_ID],
        },
      ],
      limit,
    });

    return resp.events.reverse().map((e) => ({
      id: e.id,
      ledger: e.ledger,
      txHash: e.txHash,
      topic: e.topic.map((t) => String(StellarSdk.scValToNative(t))).join(" · "),
      value: (() => {
        try {
          const v = StellarSdk.scValToNative(e.value) as unknown[];
          if (Array.isArray(v) && v.length >= 3) {
            return `Order #${v[0]} · ${(Number(v[1]) / 10_000_000).toFixed(2)} XLM · "${v[2]}"`;
          }
          return JSON.stringify(v);
        } catch {
          return "—";
        }
      })(),
    }));
  } catch {
    return [];
  }
}

export interface ContractEvent {
  id: string;
  ledger: number;
  txHash: string;
  topic: string;
  value: string;
}
