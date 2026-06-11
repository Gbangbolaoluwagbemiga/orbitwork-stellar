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

export async function sendXLM(
  sourceAddress: string,
  destination: string,
  amount: string
): Promise<SendResult> {
  // Validate destination
  if (!StellarSdk.StrKey.isValidEd25519PublicKey(destination)) {
    throw new Error("Invalid destination Stellar address");
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const server = getServer();

  // Check destination exists; if not, use createAccount op instead of payment
  const destExists = await accountExists(destination);

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
    // createAccount requires minimum 1 XLM
    if (amountNum < 1) {
      throw new Error(
        "New accounts require a minimum of 1 XLM to be created on-chain"
      );
    }
    builder.addOperation(
      StellarSdk.Operation.createAccount({
        destination,
        startingBalance: amountNum.toFixed(7),
      })
    );
  }

  const transaction = builder.setTimeout(30).build();

  // Sign via StellarWalletsKit — works for any connected wallet (Freighter,
  // Albedo, xBull, Rabet, Hana, LOBSTR, etc.)
  const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit");

  const { signedTxXdr } = await StellarWalletsKit.signTransaction(
    transaction.toXDR(),
    { networkPassphrase: NETWORK_PASSPHRASE }
  );

  const signedXdr = signedTxXdr;

  if (!signedXdr) {
    throw new Error("Transaction signing was rejected or failed");
  }

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );

  const response = await server.submitTransaction(signedTx);

  return {
    hash: response.hash,
    success: true,
    ledger: response.ledger,
  };
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function explorerUrl(hash: string): string {
  return `${EXPLORER_BASE}/${hash}`;
}
