"use client";

import { useState } from "react";
import { Star, CheckCircle2, MessageSquare } from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Rating = 1 | 2 | 3 | 4 | 5;
type Category = "ux" | "contracts" | "payments" | "other";

const CATEGORY_LABELS: Record<Category, string> = {
  ux: "UI / Experience",
  contracts: "Smart Contracts",
  payments: "XLM Payments",
  other: "Other",
};

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export function FeedbackForm() {
  const { address, isConnected } = useWallet();
  const [rating, setRating] = useState<Rating | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const canSubmit = rating !== null && category !== null && message.trim().length >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const entry = {
      timestamp: new Date().toISOString(),
      wallet: address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "anonymous",
      rating,
      category,
      message: message.trim(),
    };

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch {
      // fallback: save locally so nothing is lost
      try {
        const existing = JSON.parse(localStorage.getItem("orbitwork_feedback") ?? "[]");
        existing.push(entry);
        localStorage.setItem("orbitwork_feedback", JSON.stringify(existing));
      } catch {
        /* ignore */
      }
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="glass">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-emerald-500/15">
            <CheckCircle2 className="size-7 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-emerald-400">Thank you for your feedback!</p>
            <p className="text-sm text-muted-foreground">
              Your input helps improve OrbitWork for the Stellar community.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              setRating(null);
              setCategory(null);
              setMessage("");
            }}
          >
            Leave Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/15">
            <MessageSquare className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm text-foreground">Share Your Feedback</CardTitle>
            <CardDescription>
              {isConnected
                ? `Connected as ${address?.slice(0, 6)}…${address?.slice(-4)}`
                : "Anonymous feedback welcome"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star rating */}
          <div className="space-y-2">
            <Label>Overall Rating</Label>
            <div className="flex items-center gap-1.5">
              {([1, 2, 3, 4, 5] as Rating[]).map((star) => {
                const active = hoveredStar !== null ? star <= hoveredStar : rating !== null && star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                    className="transition-transform duration-100"
                    style={{ transform: active ? "scale(1.15)" : "scale(1)" }}
                  >
                    <Star
                      className={cn(
                        "size-7 transition-colors",
                        active
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]"
                          : "text-muted-foreground/40"
                      )}
                    />
                  </button>
                );
              })}
              {rating && (
                <span className="ml-2 text-sm text-muted-foreground self-center">
                  {RATING_LABELS[rating]}
                </span>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    category === cat
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-secondary/60 text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
                  )}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="feedback-message">Your Message</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do you love? What could be better? Any feature requests?"
              rows={4}
              required
              minLength={5}
            />
            <p className="text-xs text-right text-muted-foreground">
              {message.length} chars
            </p>
          </div>

          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="w-full"
            disabled={!canSubmit}
          >
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
