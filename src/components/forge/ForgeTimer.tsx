"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ForgeTimer({ seconds }: { seconds: number }) {
  const urgent = seconds < 10;

  return (
    <motion.div
      animate={urgent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={urgent ? { duration: 0.55, repeat: Infinity } : undefined}
      className={cn(
        "rounded-xl border px-4 py-2 font-mono text-2xl font-bold tabular-nums sm:text-3xl",
        urgent
          ? "border-red-500/60 bg-red-600/20 text-red-400"
          : "border-border bg-muted/40 text-foreground",
      )}
      aria-label={`${seconds} seconds left`}
    >
      {String(Math.max(0, seconds)).padStart(2, "0")}s
    </motion.div>
  );
}
