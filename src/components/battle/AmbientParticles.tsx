"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { usePageVisible } from "@/hooks/usePageVisible";

function StardustParticle({ index, paused }: { index: number; paused: boolean }) {
  const config = useMemo(() => {
    const seed = index * 7919 + 13;
    return {
      left: `${(seed * 17) % 100}%`,
      bottom: `${(seed * 11) % 40}%`,
      size: 2 + (index % 4),
      duration: 10 + (index % 11),
      delay: (index % 7) * 1.2,
      drift: ((index % 5) - 2) * 12,
    };
  }, [index]);

  return (
    <motion.div
      layout={false}
      className="absolute rounded-full bg-amber-500/20 shadow-[0_0_6px_rgba(245,158,11,0.35)]"
      style={{
        left: config.left,
        bottom: config.bottom,
        width: config.size,
        height: config.size,
      }}
      animate={
        paused
          ? { y: 0, x: 0, opacity: 0.25 }
          : {
              y: [0, -80 - index * 6, -160 - index * 10],
              x: [0, config.drift, config.drift * 0.5],
              opacity: [0, 0.55, 0.35, 0],
            }
      }
      transition={
        paused
          ? { duration: 0.2 }
          : {
              duration: config.duration,
              repeat: Infinity,
              delay: config.delay,
              ease: "easeInOut",
            }
      }
    />
  );
}

/** Lightweight floating stardust — pauses when the tab is hidden. */
export function AmbientParticles({ count = 12 }: { count?: number }) {
  const pageVisible = usePageVisible();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <StardustParticle key={i} index={i} paused={!pageVisible} />
      ))}
    </div>
  );
}
