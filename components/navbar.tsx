"use client";

import { OrbitLogoMark } from "@/components/orbit-logo";
import { WalletButton } from "@/components/wallet-button";

export function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b"
      style={{
        background: "rgba(4,4,15,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <OrbitLogoMark size={34} />
        <span className="text-lg font-semibold tracking-tight">
          <span className="text-white">Orbit</span>
          <span style={{ color: "#06b6d4" }}>Work</span>
        </span>
        <span
          className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs rounded-full font-mono"
          style={{
            background: "rgba(99,102,241,0.15)",
            color: "#818cf8",
            border: "1px solid rgba(99,102,241,0.25)",
          }}
        >
          Testnet
        </span>
      </div>

      {/* Right side */}
      <WalletButton />
    </nav>
  );
}
