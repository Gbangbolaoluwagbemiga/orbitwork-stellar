import { describe, it, expect } from "vitest";
import { shortAddress, explorerUrl, HORIZON_URL } from "../stellar";
import {
  CONTRACT_ID,
  SOROBAN_RPC_URL,
  STATUS_LABEL,
  EXPLORER_CONTRACT,
} from "../contract";

describe("shortAddress", () => {
  it("abbreviates a full Stellar public key", () => {
    const full = "GBXXX1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234YYYY";
    const short = shortAddress(full);
    expect(short).toBe("GBXXX1…YYYY");
  });

  it("preserves first 6 and last 4 characters", () => {
    const addr = "GAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBCCCC";
    const result = shortAddress(addr);
    expect(result.startsWith("GAAAAA")).toBe(true);
    expect(result.endsWith("CCCC")).toBe(true);
    expect(result).toContain("…");
  });
});

describe("explorerUrl", () => {
  it("builds a valid Stellar Expert testnet URL", () => {
    const hash = "abc123def456";
    const url = explorerUrl(hash);
    expect(url).toBe(
      "https://stellar.expert/explorer/testnet/tx/abc123def456"
    );
  });

  it("appends the hash to the base explorer URL", () => {
    const hash = "deadbeef";
    expect(explorerUrl(hash)).toContain(hash);
    expect(explorerUrl(hash)).toContain("stellar.expert");
  });
});

describe("contract constants", () => {
  it("CONTRACT_ID is a valid Soroban contract address (starts with C)", () => {
    expect(CONTRACT_ID).toMatch(/^C[A-Z2-7]{55}$/);
  });

  it("SOROBAN_RPC_URL points to the testnet RPC", () => {
    expect(SOROBAN_RPC_URL).toContain("soroban-testnet.stellar.org");
  });

  it("EXPLORER_CONTRACT URL contains the contract ID", () => {
    expect(EXPLORER_CONTRACT).toContain(CONTRACT_ID);
    expect(EXPLORER_CONTRACT).toContain("stellar.expert");
  });
});

describe("STATUS_LABEL", () => {
  it("maps 0 to Open", () => {
    expect(STATUS_LABEL[0]).toBe("Open");
  });

  it("maps 1 to Completed", () => {
    expect(STATUS_LABEL[1]).toBe("Completed");
  });

  it("maps 2 to Cancelled", () => {
    expect(STATUS_LABEL[2]).toBe("Cancelled");
  });
});

describe("Horizon config", () => {
  it("HORIZON_URL targets the testnet", () => {
    expect(HORIZON_URL).toContain("horizon-testnet.stellar.org");
  });
});
