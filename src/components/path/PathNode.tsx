"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Flame, Lock, Play, Star } from "lucide-react";
import { usePageVisible } from "@/hooks/usePageVisible";
import { cn } from "@/lib/utils";

export type PathNodeKind = "LESSON" | "TRIAL";

export type PathNodeState = {
  kind: PathNodeKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  unlocked: boolean;
  done: boolean;
  isContinue: boolean;
  globalIndex: number;
};

export type PathNodeProps = {
  node: PathNodeState;
  onTap?: () => void;
};

export function PathNode({ node, onTap }: PathNodeProps) {
  const { kind, title, subtitle, href, unlocked, done, isContinue, globalIndex } = node;
  const locked = !unlocked;
  const floatDuration = 3.6 + (globalIndex % 4) * 0.35;
  const isActive = isContinue && !done && !locked;
  const isTrial = kind === "TRIAL";
  const pageVisible = usePageVisible();

  const stone = (
    <motion.div
      layout={false}
      animate={
        !pageVisible
          ? { y: 0 }
          : isActive
            ? {
                y: [-2, 2, -2],
                boxShadow: [
                  "0px 0px 15px rgba(245,158,11,0.4)",
                  "0px 0px 30px rgba(245,158,11,0.8)",
                  "0px 0px 15px rgba(245,158,11,0.4)",
                ],
              }
            : done
              ? { y: [-2, 2, -2], opacity: [0.95, 1, 0.95] }
              : locked
                ? { y: 0 }
                : { y: [-3, 3, -3] }
      }
      transition={
        !pageVisible
          ? { duration: 0.15 }
          : isActive
            ? { repeat: Infinity, duration: 2, ease: "easeInOut" }
            : {
                repeat: Infinity,
                duration: done ? 2.8 : floatDuration,
                ease: "easeInOut",
              }
      }
      whileTap={locked ? undefined : { scale: 0.94 }}
      whileHover={
        locked
          ? undefined
          : {
              scale: 1.08,
              boxShadow: done
                ? "inset 0 4px 12px rgba(0,0,0,0.5), 0 0 28px rgba(245,158,11,0.55)"
                : "0px 0px 20px rgba(245,158,11,0.6)",
            }
      }
      className={cn(
        "relative flex size-20 items-center justify-center rounded-full border-2 transition-colors duration-300",
        locked
          ? "border-slate-700 bg-slate-900/80 text-slate-600 shadow-none grayscale"
          : done
            ? isTrial
              ? "border-rose-400 bg-gradient-to-b from-rose-400 to-amber-600 text-amber-950 shadow-[inset_0_4px_12px_rgba(0,0,0,0.45),0_0_24px_rgba(244,63,94,0.35)]"
              : "border-amber-400 bg-gradient-to-b from-amber-400 to-amber-600 text-amber-950 shadow-[inset_0_4px_12px_rgba(0,0,0,0.45),0_0_24px_rgba(245,158,11,0.35)]"
            : isActive
              ? isTrial
                ? "border-rose-300 bg-slate-800 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)]"
                : "border-amber-300 bg-slate-800 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)]"
              : isTrial
                ? "border-rose-500/40 bg-slate-800 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)] hover:border-rose-500/60"
                : "border-amber-500/30 bg-slate-800 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)] hover:border-amber-500/50",
      )}
    >
      {locked ? (
        <Lock className="size-6 text-slate-600" />
      ) : done ? (
        <Check className="size-7 text-amber-950" strokeWidth={2.5} />
      ) : isTrial ? (
        <Flame className={cn("size-7", isActive ? "fill-rose-300 text-rose-300" : "text-rose-300/90")} />
      ) : isActive ? (
        <Star className="size-7 fill-amber-300 text-amber-300" />
      ) : (
        <Play className="size-6 fill-amber-200/80 text-amber-200/80" />
      )}
    </motion.div>
  );

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {locked ? (
        stone
      ) : (
        <Link href={href} onClick={onTap} className="group pointer-events-auto">
          {stone}
        </Link>
      )}

      <div className="max-w-[9rem] space-y-0.5">
        {isTrial ? (
          <p className="text-[9px] font-semibold tracking-[0.16em] text-rose-300/80 uppercase">
            Trial
          </p>
        ) : null}
        <p
          className={cn(
            "font-display text-xs font-semibold leading-tight",
            locked ? "text-slate-600" : done ? "text-amber-200/90" : "text-white/85",
          )}
        >
          {title}
        </p>
        <p className="line-clamp-2 text-[10px] leading-snug text-white/40">{subtitle}</p>
      </div>
    </div>
  );
}
