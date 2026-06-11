import * as StellarSdk from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx";

let _server: StellarSdk.Horizon.Server | null = null;

function getServer(): StellarSdk.Horizon.Server {
  if (!_server) {
    _server = new StellarSdk.Horizon.Server(HORIZON_URL);
  }
  return _server;
}

export async function getXLMBalance(address: string): Promise<string> {
  const server = getServer();
  const account = await server.loadAccount(address);
  const native = account.balances.find((b) => b.asset_type === "native");
  return native ? parseFloat(native.balance).toFixed(7) : "0.0000000";
}

export async function accountExists(address: string): Promise<boolean> {
  try {
    await getServer().loadAccount(address);
    return true;
  } catch {
    return false;
  }
}

export interface SendResult {
  hash: string;
  success: boolean;
  ledger?: number;
}

/** Parses Horizon BadResponseError and returns a human-readable message. */
function parseHorizonError(err: unknown): string {
  if (!err || typeof err !== "object") return "Transaction failed";

  // Horizon BadResponseError from stellar-sdk
  const e = err as {
    response?: {
      data?: {
        extras?: {
          result_codes?: {
            transaction?: string;
            operations?: string[];
          };
        };
      };
    };
    message?: string;
  };

  const codes = e.response?.data?.extras?.result_codes;
  if (codes) {
    const txCode = codes.transaction ?? "";
    const opCodes = codes.operations?.join(", ") ?? "";
    const detail = [txCode, opCodes].filter(Boolean).join(" — ops: ");

    const friendly: Record<string, string> = {
      tx_bad_auth:
        "Signature invalid — make sure Freighter is set to Testnet, not Mainnet",
      tx_bad_seq:
        "Sequence number mismatch — please reload and try again",
      tx_insufficient_fee: "Fee too low — please try again",
      op_no_destination:
        "Destination account does not exist on testnet",
      op_underfunded: "Insufficient XLM balance",
      op_low_reserve:
        "Amount too low — new accounts need at least 1 XLM",
    };

    const readable =
      friendly[txCode] ??
      codes.operations?.map((c) => friendly[c] ?? c).join("; ") ??
      detail;

    return readable || "Transaction rejected by Stellar network";
  }

  // Plain object thrown by StellarWalletsKit (e.g. {code: -3, message: "..."})
  const kitErr = err as { message?: string; code?: number };
  if (kitErr.message) return kitErr.message;

  if (e.message) return e.message;
  return "Transaction failed — check console for details";
}

/**
 * Builds a Stellar transaction and signs + submits it.
 *
 * `signFn` is injected from the wallet context so that signing always goes
 * through a fully-initialised StellarWalletsKit instance — avoiding the race
 * where stellar.ts imports the kit before modules are registered.
 */
export async function sendXLM(
  sourceAddress: string,
  destination: string,
  amount: string,
  signFn: (xdr: string) => Promise<string>
): Promise<SendResult> {
  // ── Validation ──────────────────────────────────────────────────────────
  if (!StellarSdk.StrKey.isValidEd25519PublicKey(destination)) {
    throw new Error("Invalid destination Stellar address");
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const server = getServer();

  // ── Operation selection ──────────────────────────────────────────────────
  const destExists = await accountExists(destination);

  if (!destExists && amountNum < 1) {
    throw new Error(
      "New accounts require a minimum of 1 XLM to activate on-chain"
    );
  }

  const account = await server.loadAccount(sourceAddress);

  const builder = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (destExists) {
    builder.addOperation(
      StellarSdk.Operation.payment({
        destination,
        asset: StellarSdk.Asset.native(),
        amount: amountNum.toFixed(7),
      })
    );
  } else {
    builder.addOperation(
      StellarSdk.Operation.createAccount({
        destination,
        startingBalance: amountNum.toFixed(7),
      })
    );
  }

  const transaction = builder.setTimeout(30).build();

  // ── Sign ────────────────────────────────────────────────────────────────
  let signedXdr: string;
  try {
    signedXdr = await signFn(transaction.toXDR());
  } catch (err) {
    // Convert kit plain-object errors to proper Error
    const msg = parseHorizonError(err);
    throw new Error(msg);
  }

  if (!signedXdr) {
    throw new Error("Signing was cancelled or returned no result");
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );

  try {
    const response = await server.submitTransaction(signedTx);
    return { hash: response.hash, success: true, ledger: response.ledger };
  } catch (err) {
    throw new Error(parseHorizonError(err));
  }
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function explorerUrl(hash: string): string {
  return `${EXPLORER_BASE}/${hash}`;
}
