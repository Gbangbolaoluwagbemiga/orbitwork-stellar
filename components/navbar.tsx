"use client";

import { OrbitLogoMark } from "@/components/orbit-logo";
import { WalletButton } from "@/components/wallet-button";
import { useTheme } from "@/contexts/theme-context";

export function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b"
      style={{
        background: "var(--surface-nav)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "var(--border-nav)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <OrbitLogoMark size={34} />
        <span className="text-lg font-semibold tracking-tight">
          <span style={{ color: "var(--text-1)" }}>Orbit</span>
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

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <WalletButton />
      </div>
    </nav>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
      style={{
        background: "var(--surface-hover)",
        border: "1px solid var(--border-card)",
        color: isDark ? "#a78bfa" : "#7c3aed",
      }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
