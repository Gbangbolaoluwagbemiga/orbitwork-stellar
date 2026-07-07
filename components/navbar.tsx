"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  LayoutDashboard,
  Briefcase,
  Send,
  FileCode2,
  ExternalLink,
  GitBranch,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { OrbitLogoMark } from "@/components/orbit-logo";
import { WalletButton } from "@/components/wallet-button";
import { useTheme } from "@/contexts/theme-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Job Board", href: "/jobs", icon: Briefcase },
  { label: "Send XLM", href: "/send", icon: Send },
  { label: "Contract", href: "/contract", icon: FileCode2 },
];

const EXTERNAL_LINKS = [
  {
    label: "Explorer",
    href: "https://stellar.expert/explorer/testnet/contract/CBWAGSMUHYU2LNFGQ6CJ4B6DCUJILOZZU4GNIGCYYWWQQBGCUOL3Q43H",
  },
  {
    label: "GitHub",
    href: "https://github.com/Gbangbolaoluwagbemiga/orbitwork-stellar",
  },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div ref={drawerRef} className="sticky top-0 z-50">
      {/* Main nav bar */}
      <nav
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/50 backdrop-blur-xl"
        style={{ background: "var(--nav-bg)" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <OrbitLogoMark size={34} />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Orbit<span className="text-accent font-bold">Work</span>
          </span>
          <Badge variant="outline" className="hidden sm:inline-flex font-mono text-xs text-primary border-primary/30">
            Testnet
          </Badge>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href, pathname);
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                <Icon className="size-3.5" />
                {link.label}
              </Link>
            );
          })}

          {/* External links */}
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border">
            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
              >
                {link.label}
                <ExternalLink className="size-3 opacity-50" />
              </a>
            ))}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <div className="hidden md:block">
            <WalletButton />
          </div>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              "md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-all border border-border",
              menuOpen ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
            )}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer with AnimatePresence */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-b border-border/50 backdrop-blur-xl"
            style={{ background: "var(--nav-bg)" }}
          >
            <div className="px-4 pt-3 pb-5 space-y-1">
              {/* Testnet badge */}
              <div className="flex items-center gap-2 pb-2">
                <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                  Testnet
                </Badge>
              </div>

              {/* Internal nav links */}
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href, pathname);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="flex-1">{link.label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </Link>
                );
              })}

              {/* External links */}
              {EXTERNAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  {link.label === "GitHub" ? (
                    <GitBranch className="size-4" />
                  ) : (
                    <ExternalLink className="size-4" />
                  )}
                  <span className="flex-1">{link.label}</span>
                  <ExternalLink className="size-3 opacity-40" />
                </a>
              ))}

              <div className="h-px bg-border my-2" />

              <div className="pt-1">
                <WalletButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 bg-secondary border border-border text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
