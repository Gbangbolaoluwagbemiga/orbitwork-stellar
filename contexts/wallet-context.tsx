"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface WalletContextType {
  address: string | null;
  walletId: string | null;
  network: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
  /** Signs an XDR-encoded transaction through the active wallet module. */
  sign: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Singleton init guard — the kit uses global signals so we only call init() once
let _kitReady = false;

async function getKit() {
  const { StellarWalletsKit, Networks } = await import(
    "@creit.tech/stellar-wallets-kit"
  );

  if (!_kitReady) {
    const { FreighterModule } = await import(
      "@creit.tech/stellar-wallets-kit/modules/freighter"
    );
    const { AlbedoModule } = await import(
      "@creit.tech/stellar-wallets-kit/modules/albedo"
    );
    const { RabetModule } = await import(
      "@creit.tech/stellar-wallets-kit/modules/rabet"
    );
    const { xBullModule } = await import(
      "@creit.tech/stellar-wallets-kit/modules/xbull"
    );
    const { HanaModule } = await import(
      "@creit.tech/stellar-wallets-kit/modules/hana"
    );
    const { LobstrModule } = await import(
      "@creit.tech/stellar-wallets-kit/modules/lobstr"
    );

    StellarWalletsKit.init({
      network: Networks.TESTNET,
      modules: [
        new FreighterModule(),
        new AlbedoModule(),
        new RabetModule(),
        new xBullModule(),
        new HanaModule(),
        new LobstrModule(),
      ],
    });

    _kitReady = true;
  }

  return StellarWalletsKit;
}

function extractMessage(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  // Kit throws plain objects like { code: -1, message: "..." }
  const obj = err as Record<string, unknown>;
  if (typeof obj.message === "string") return obj.message;
  return "";
}

const SILENT_PATTERNS = ["closed", "cancel", "dismiss", "reject", "user denied", "disconnected port"];

function isSilentClose(msg: string): boolean {
  const lower = msg.toLowerCase();
  return !msg || SILENT_PATTERNS.some((p) => lower.includes(p));
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [network] = useState<string>("TESTNET");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore session from kit's own localStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const kit = await getKit();
        const { address: saved } = await kit.getAddress();
        if (saved) {
          setAddress(saved);
          // Restore the wallet ID from kit state
          const { selectedModuleId } = await import(
            "@creit.tech/stellar-wallets-kit/state"
          );
          setWalletId(selectedModuleId.value ?? null);
        }
      } catch {
        // No previous session — normal on first visit
      }
    })();
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const kit = await getKit();

      // authModal renders the kit's wallet picker UI and resolves with { address }
      const { address: addr } = await kit.authModal({});

      const { selectedModuleId } = await import(
        "@creit.tech/stellar-wallets-kit/state"
      );

      setAddress(addr);
      setWalletId(selectedModuleId.value ?? null);
    } catch (err: unknown) {
      const msg = extractMessage(err);
      // Silence dismissals — kit throws plain objects or strings for close/cancel
      if (!isSilentClose(msg)) {
        setError(msg || "Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      const kit = await getKit();
      await kit.disconnect();
    } catch {
      // ignore disconnect errors
    }
    setAddress(null);
    setWalletId(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const sign = useCallback(async (xdr: string): Promise<string> => {
    // Pre-flight: if Freighter is reachable, verify it is on Testnet before
    // opening the signing popup — avoids a silent tx_bad_auth from Horizon.
    try {
      const { getNetworkDetails } = await import("@stellar/freighter-api");
      const details = await getNetworkDetails();
      const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
      if (details.networkPassphrase && details.networkPassphrase !== TESTNET_PASSPHRASE) {
        const name = details.network || "Mainnet";
        throw new Error(
          `Freighter is set to ${name}. Open Freighter → click the network name → select "Test SDF Network" (Testnet), then try again.`
        );
      }
    } catch (err) {
      // Re-throw only our own network-mismatch error; ignore extension-not-available etc.
      if (err instanceof Error && err.message.startsWith("Freighter is set to")) throw err;
    }

    const kit = await getKit();
    const { signedTxXdr } = await kit.signTransaction(xdr, {
      networkPassphrase: "Test SDF Network ; September 2015",
    });
    if (!signedTxXdr) throw new Error("Signing returned no result");
    return signedTxXdr;
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        walletId,
        network,
        isConnected: !!address,
        isConnecting,
        error,
        connect,
        disconnect,
        clearError,
        sign,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
