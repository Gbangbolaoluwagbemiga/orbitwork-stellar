"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { JobBoard } from "@/components/job-board";

export default function JobsPage() {
  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-10">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/10 border border-accent/20">
            <Briefcase className="size-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Job Board</h1>
            <p className="text-sm text-muted-foreground">
              Browse, post, and apply to work orders on the Stellar blockchain
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <JobBoard />
      </motion.div>
    </div>
  );
}
