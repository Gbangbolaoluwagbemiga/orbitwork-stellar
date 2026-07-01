"use client";

import { useState, useEffect, useRef } from "react";
import { OrbitLogoMark } from "@/components/orbit-logo";
import { WalletButton } from "@/components/wallet-button";
import { useTheme } from "@/contexts/theme-context";

const NAV_LINKS = [
  { label: "Dashboard", href: "#dashboard" },
  { label: "Smart Contract", href: "#contract" },
  { label: "Send XLM", href: "#send" },
  {
    label: "Explorer",
    href: "https://stellar.expert/explorer/testnet/contract/CBWAGSMUHYU2LNFGQ6CJ4B6DCUJILOZZU4GNIGCYYWWQQBGCUOL3Q43H",
    external: true,
  },
  {
    label: "GitHub",
    href: "https://github.com/Gbangbolaoluwagbemiga/orbitwork-stellar",
    external: true,
  },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Close drawer on route scroll (anchor click)
  function handleNavLinkClick() {
    setMenuOpen(false);
  }

  return (
    <div ref={drawerRef} className="sticky top-0 z-50">
      {/* ── Main bar ── */}
      <nav
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b"
        style={{
          background: "var(--surface-nav)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderColor: "var(--border-nav)",
        }}
      >
        {/* Logo */}
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

        {/* Desktop: nav links + controls */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-sm font-medium transition-colors hover:text-indigo-400"
              style={{ color: "var(--text-3)" }}
            >
              {link.label}
              {link.external && (
                <span className="ml-0.5 text-xs opacity-50">↗</span>
              )}
            </a>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {/* Wallet button — hidden on mobile (shown in drawer) */}
          <div className="hidden md:block">
            <WalletButton />
          </div>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-1.5 transition-all"
            style={{
              background: menuOpen ? "rgba(99,102,241,0.15)" : "var(--surface-hover)",
              border: "1px solid var(--border-card)",
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className="block w-4 h-0.5 rounded-full transition-all duration-300 origin-center"
              style={{
                background: "var(--text-2)",
                transform: menuOpen ? "translateY(4px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block w-4 h-0.5 rounded-full transition-all duration-300"
              style={{
                background: "var(--text-2)",
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? "scaleX(0)" : "scaleX(1)",
              }}
            />
            <span
              className="block w-4 h-0.5 rounded-full transition-all duration-300 origin-center"
              style={{
                background: "var(--text-2)",
                transform: menuOpen ? "translateY(-4px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: menuOpen ? "400px" : "0px",
          borderBottom: menuOpen ? "1px solid var(--border-nav)" : "none",
          background: "var(--surface-nav)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="px-4 pt-3 pb-5 space-y-1">
          {/* Testnet badge on mobile */}
          <div className="flex items-center gap-2 pb-2">
            <span
              className="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-mono"
              style={{
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
            >
              Testnet
            </span>
          </div>

          {/* Nav links */}
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              onClick={handleNavLinkClick}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                color: "var(--text-2)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)";
                (e.currentTarget as HTMLElement).style.color = "#a78bfa";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
              }}
            >
              <span>{link.label}</span>
              {link.external ? (
                <span className="text-xs opacity-40">↗</span>
              ) : (
                <span className="text-xs opacity-40">→</span>
              )}
            </a>
          ))}

          {/* Divider */}
          <div
            className="my-2"
            style={{ height: "1px", background: "var(--border-subtle)" }}
          />

          {/* Wallet button full width */}
          <div className="pt-1">
            <WalletButton />
          </div>
        </div>
      </div>
    </div>
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
