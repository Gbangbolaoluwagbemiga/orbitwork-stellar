import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc as SorobanRpc } from "@stellar/stellar-sdk";

export const CONTRACT_ID = "CC7G2CIISSTNPMLNY5MWSO7EQIQZQFHXLGIY5WW4VY2VDXOGRKBMAXJZ";
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const EXPLORER_TX = "https://stellar.expert/explorer/testnet/tx";
export const EXPLORER_CONTRACT = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`;

export interface WorkOrder {
  id: number;
  client: string;
  title: string;
  description: string;
  amount: string;        // XLM (converted from stroops)
  duration: number;      // days
  status: 0 | 1 | 2;   // 0=open 1=completed 2=cancelled
  createdAt: number;
}

export interface Application {
  freelancer: string;
  coverLetter: string;
  timeline: number;     // proposed days
  appliedAt: number;
}

export const STATUS_LABEL: Record<number, string> = {
  0: "Open",
  1: "Completed",
  2: "Cancelled",
};

let _server: SorobanRpc.Server | null = null;

function getRpc(): SorobanRpc.Server {
  if (!_server) {
    _server = new SorobanRpc.Server(SOROBAN_RPC_URL, { allowHttp: false });
  }
  return _server;
}

async function simulateRead(op: StellarSdk.xdr.Operation) {
  const rpc = getRpc();
  const dummy = StellarSdk.Keypair.random();
  const account = new StellarSdk.Account(dummy.publicKey(), "0");
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "1000000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(30)
    .build();
  const sim = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) throw new Error(sim.error);
  return sim.result?.retval ?? null;
}

export async function getOrderCount(): Promise<number> {
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const retval = await simulateRead(contract.call("get_count"));
  if (!retval) return 0;
  return Number(StellarSdk.scValToNative(retval));
}

export async function getOrder(id: number): Promise<WorkOrder | null> {
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const retval = await simulateRead(
    contract.call("get_order", StellarSdk.nativeToScVal(id, { type: "u64" }))
  );
  if (!retval) return null;

  const native = StellarSdk.scValToNative(retval) as {
    id: bigint;
    client: string;
    title: string;
    description: string;
    amount: bigint;
    duration: number;
    status: number;
    created_at: bigint;
  } | null;

  if (!native) return null;

  return {
    id: Number(native.id),
    client: native.client,
    title: native.title,
    description: native.description ?? "",
    amount: (Number(native.amount) / 10_000_000).toFixed(7),
    duration: Number(native.duration),
    status: native.status as 0 | 1 | 2,
    createdAt: Number(native.created_at),
  };
}

export async function hasApplied(orderId: number, freelancer: string): Promise<boolean> {
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const retval = await simulateRead(
    contract.call(
      "has_applied",
      StellarSdk.nativeToScVal(orderId, { type: "u64" }),
      StellarSdk.Address.fromString(freelancer).toScVal()
    )
  );
  if (!retval) return false;
  return Boolean(StellarSdk.scValToNative(retval));
}

export async function getApplications(orderId: number): Promise<Application[]> {
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const retval = await simulateRead(
    contract.call("get_applications", StellarSdk.nativeToScVal(orderId, { type: "u64" }))
  );
  if (!retval) return [];
  const native = StellarSdk.scValToNative(retval) as Array<{
    freelancer: string;
    cover_letter: string;
    timeline: number;
    applied_at: bigint;
  }>;
  return (native ?? []).map((a) => ({
    freelancer: a.freelancer,
    coverLetter: a.cover_letter,
    timeline: Number(a.timeline),
    appliedAt: Number(a.applied_at),
  }));
}

export interface CreateOrderParams {
  clientAddress: string;
  title: string;
  description: string;
  amountXlm: string;
  duration: number;
  signFn: (xdr: string) => Promise<string>;
}

export interface ContractCallResult {
  hash: string;
  orderId: number;
}

export async function createOrder({
  clientAddress,
  title,
  description,
  amountXlm,
  duration,
  signFn,
}: CreateOrderParams): Promise<ContractCallResult> {
  if (!title.trim()) throw new Error("Title cannot be empty");
  if (!description.trim()) throw new Error("Description cannot be empty");
  const xlm = parseFloat(amountXlm);
  if (isNaN(xlm) || xlm <= 0) throw new Error("Amount must be greater than 0");
  if (xlm > 900_000_000) throw new Error("Amount too large");
  if (duration < 1) throw new Error("Duration must be at least 1 day");

  const stroops = BigInt(Math.round(xlm * 10_000_000));
  const rpc = getRpc();
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  let account: StellarSdk.Account;
  try {
    account = await rpc.getAccount(clientAddress);
  } catch {
    throw new Error("Account not found on Stellar testnet — fund it via the faucet first");
  }

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "1000000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "create_order",
        StellarSdk.Address.fromString(clientAddress).toScVal(),
        StellarSdk.nativeToScVal(title.trim(), { type: "string" }),
        StellarSdk.nativeToScVal(description.trim(), { type: "string" }),
        StellarSdk.nativeToScVal(stroops, { type: "i128" }),
        StellarSdk.nativeToScVal(duration, { type: "u32" })
      )
    )
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) {
    const msg = sim.error ?? "Simulation failed";
    if (msg.includes("insufficient")) throw new Error("Insufficient balance to cover fees");
    throw new Error(`Contract error: ${msg}`);
  }

  const assembled = SorobanRpc.assembleTransaction(tx, sim).build();

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

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sendResp = await rpc.sendTransaction(signedTx);
  if (sendResp.status === "ERROR") {
    throw new Error(`Submission failed: ${sendResp.errorResult ?? "unknown error"}`);
  }

  const hash = sendResp.hash;
  let attempts = 0;
  while (attempts < 20) {
    await new Promise((r) => setTimeout(r, 1500));
    const status = await rpc.getTransaction(hash);
    if (status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      const orderId = status.returnValue
        ? Number(StellarSdk.scValToNative(status.returnValue))
        : 0;
      return { hash, orderId };
    }
    if (status.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain — check your balance and try again");
    }
    attempts++;
  }

  throw new Error("Transaction timed out — check Stellar Explorer for status");
}

export interface ApplyParams {
  freelancerAddress: string;
  orderId: number;
  coverLetter: string;
  proposedTimeline: number;
  signFn: (xdr: string) => Promise<string>;
}

export async function applyToJob({
  freelancerAddress,
  orderId,
  coverLetter,
  proposedTimeline,
  signFn,
}: ApplyParams): Promise<{ hash: string }> {
  if (!coverLetter.trim()) throw new Error("Cover letter cannot be empty");
  if (proposedTimeline < 1) throw new Error("Timeline must be at least 1 day");

  const rpc = getRpc();
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  let account: StellarSdk.Account;
  try {
    account = await rpc.getAccount(freelancerAddress);
  } catch {
    throw new Error("Account not found on Stellar testnet — fund it via the faucet first");
  }

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "1000000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "apply_to_job",
        StellarSdk.nativeToScVal(orderId, { type: "u64" }),
        StellarSdk.Address.fromString(freelancerAddress).toScVal(),
        StellarSdk.nativeToScVal(coverLetter.trim(), { type: "string" }),
        StellarSdk.nativeToScVal(proposedTimeline, { type: "u32" })
      )
    )
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) {
    const msg = sim.error ?? "Simulation failed";
    if (msg.includes("already applied")) throw new Error("You have already applied to this job");
    if (msg.includes("not open")) throw new Error("This job is no longer accepting applications");
    if (msg.includes("cannot apply to own")) throw new Error("You cannot apply to your own job");
    throw new Error(`Contract error: ${msg}`);
  }

  const assembled = SorobanRpc.assembleTransaction(tx, sim).build();

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

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sendResp = await rpc.sendTransaction(signedTx);
  if (sendResp.status === "ERROR") {
    throw new Error(`Submission failed: ${sendResp.errorResult ?? "unknown error"}`);
  }

  const hash = sendResp.hash;
  let attempts = 0;
  while (attempts < 20) {
    await new Promise((r) => setTimeout(r, 1500));
    const status = await rpc.getTransaction(hash);
    if (status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return { hash };
    }
    if (status.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain — check your balance and try again");
    }
    attempts++;
  }

  throw new Error("Transaction timed out — check Stellar Explorer for status");
}

export async function fetchContractEvents(limit = 10): Promise<ContractEvent[]> {
  try {
    const rpc = getRpc();
    const ledger = await rpc.getLatestLedger();
    const startLedger = Math.max(1, ledger.sequence - 2000);

    const resp = await rpc.getEvents({
      startLedger,
      filters: [{ type: "contract", contractIds: [CONTRACT_ID] }],
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
          if (Array.isArray(v) && v.length >= 2) {
            const first = v[0];
            const second = v[1];
            if (typeof second === "bigint") {
              return `Order #${first} · ${(Number(second) / 10_000_000).toFixed(2)} XLM`;
            }
            return `Order #${first} · ${second} days`;
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
