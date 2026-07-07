"use client";

import { useState } from "react";
import { useWallet } from "@/contexts/wallet-context";

type Rating = 1 | 2 | 3 | 4 | 5;
type Category = "ux" | "contracts" | "payments" | "other";

const CATEGORY_LABELS: Record<Category, string> = {
  ux: "UI / Experience",
  contracts: "Smart Contracts",
  payments: "XLM Payments",
  other: "Other",
};

export function FeedbackForm() {
  const { address, isConnected } = useWallet();
  const [rating, setRating] = useState<Rating | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const canSubmit = rating !== null && category !== null && message.trim().length >= 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // Store feedback locally (no backend — browser session)
    const entry = {
      timestamp: new Date().toISOString(),
      wallet: address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "anonymous",
      rating,
      category,
      message: message.trim(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("orbitwork_feedback") ?? "[]");
      existing.push(entry);
      localStorage.setItem("orbitwork_feedback", JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className="rounded-2xl p-8 text-center space-y-4 animate-fade-in"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-card)",
        }}
      >
        <div
          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center text-2xl"
          style={{ background: "rgba(16,185,129,0.15)" }}
        >
          ✓
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-emerald-400">Thank you for your feedback!</p>
          <p className="text-sm" style={{ color: "var(--text-4)" }}>
            Your input helps improve OrbitWork for the Stellar community.
          </p>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setRating(null);
            setCategory(null);
            setMessage("");
          }}
          className="px-5 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{
            border: "1px solid var(--border-card)",
            color: "var(--text-3)",
          }}
        >
          Leave Another
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 space-y-6 animate-fade-in-up"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(167,139,250,0.15)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>
            Share Your Feedback
          </p>
          <p className="text-xs" style={{ color: "var(--text-4)" }}>
            {isConnected
              ? `Connected as ${address?.slice(0, 6)}…${address?.slice(-4)}`
              : "Anonymous feedback welcome"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star rating */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-4)" }}>
            Overall Rating
          </p>
          <div className="flex gap-1.5">
            {([1, 2, 3, 4, 5] as Rating[]).map((star) => {
              const active = hoveredStar !== null ? star <= hoveredStar : rating !== null && star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  className="transition-all duration-100"
                  style={{ fontSize: "1.75rem", lineHeight: 1, transform: active ? "scale(1.15)" : "scale(1)" }}
                  aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                >
                  <span style={{ color: active ? "#f59e0b" : "var(--text-5)", filter: active ? "drop-shadow(0 0 4px rgba(245,158,11,0.4))" : "none" }}>
                    ★
                  </span>
                </button>
              );
            })}
            {rating && (
              <span className="ml-2 text-sm self-center" style={{ color: "var(--text-4)" }}>
                {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
              </span>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-4)" }}>
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background:
                    category === cat
                      ? "rgba(167,139,250,0.2)"
                      : "var(--surface-card-alt)",
                  color: category === cat ? "#a78bfa" : "var(--text-3)",
                  border: `1px solid ${category === cat ? "rgba(167,139,250,0.35)" : "var(--border-subtle)"}`,
                }}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label
            htmlFor="feedback-message"
            className="text-xs uppercase tracking-wider"
            style={{ color: "var(--text-4)" }}
          >
            Your Message
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What do you love? What could be better? Any feature requests?"
            rows={4}
            required
            minLength={5}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all duration-200"
            style={{
              background: "var(--surface-input)",
              border: "1px solid var(--border-input)",
              color: "var(--text-1)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-input)")}
          />
          <p className="text-xs text-right" style={{ color: "var(--text-5)" }}>
            {message.length} chars
          </p>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canSubmit
              ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
              : "rgba(167,139,250,0.2)",
            boxShadow: canSubmit ? "0 0 20px rgba(167,139,250,0.2)" : "none",
          }}
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}
