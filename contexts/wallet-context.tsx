"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface WalletState {
  address: string | null;
  network: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem("ow_wallet_address");
    if (saved) {
      setAddress(saved);
      setNetwork("TESTNET");
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const freighter = await import("@stellar/freighter-api");

      // Check if Freighter is installed
      const connResult = await freighter.isConnected();
      const installed =
        typeof connResult === "boolean" ? connResult : connResult.isConnected;

      if (!installed) {
        throw new Error(
          "Freighter wallet not found. Please install it from freighter.app"
        );
      }

      // Request access — this shows the Freighter popup
      const accessResult = await freighter.requestAccess();
      const addr =
        typeof accessResult === "string" ? accessResult : accessResult.address;

      if (!addr) throw new Error("No address returned from Freighter");

      // Get network info
      const netResult = await freighter.getNetwork();
      const net =
        typeof netResult === "string" ? netResult : netResult.network;

      setAddress(addr);
      setNetwork(net || "TESTNET");
      localStorage.setItem("ow_wallet_address", addr);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setError(msg);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setNetwork(null);
    setError(null);
    localStorage.removeItem("ow_wallet_address");
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <WalletContext.Provider
      value={{
        address,
        network,
        isConnected: !!address,
        isConnecting,
        error,
        connect,
        disconnect,
        clearError,
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
