"use client";

import { JobBoard } from "@/components/job-board";

export default function JobsPage() {
  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-10">
      {/* Page header */}
      <div className="mb-8 space-y-2 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.2)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-4 0v2M8 11h8M8 15h5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
              Job Board
            </h1>
            <p className="text-sm" style={{ color: "var(--text-4)" }}>
              Browse, post, and apply to work orders on the Stellar blockchain
            </p>
          </div>
        </div>
      </div>

      {/* Job board component */}
      <div className="animate-fade-in-up delay-100">
        <JobBoard />
      </div>
    </div>
  );
}
