"use client";

import { motion } from "framer-motion";
import { Check, Lock, Sparkles, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type NodeState = "done" | "active" | "locked";

interface PathNode {
  id: string;
  label: string;
  state: NodeState;
  icon?: "star" | "crown";
}

interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  nodes: PathNode[];
}

const CHAPTERS: Chapter[] = [
  {
    id: "c1",
    title: "Chapter I: The Core Inscriptions",
    subtitle: "The letterforms & first sacred sounds",
    nodes: [
      { id: "n1", label: "The Alphabet", state: "done" },
      { id: "n2", label: "Short Vowels", state: "done" },
      { id: "n3", label: "Intro to Verbs", state: "active", icon: "star" },
      { id: "n4", label: "Sun & Moon Letters", state: "locked" },
      { id: "n5", label: "The First Trial", state: "locked", icon: "crown" },
    ],
  },
  {
    id: "c2",
    title: "Chapter II: Root & Pattern",
    subtitle: "Trilateral roots and the loom of forms",
    nodes: [
      { id: "n6", label: "The Root System", state: "locked" },
      { id: "n7", label: "Form I Verbs", state: "locked" },
      { id: "n8", label: "Active Participles", state: "locked", icon: "star" },
      { id: "n9", label: "Building Nouns", state: "locked" },
      { id: "n10", label: "The Second Trial", state: "locked", icon: "crown" },
    ],
  },
];

// Gentle winding offsets for a celestial trail.
const OFFSETS = ["0%", "22%", "6%", "-18%", "0%"];

function NodeGlyph({ node }: { node: PathNode }) {
  if (node.state === "done") return <Check className="h-6 w-6" strokeWidth={3} />;
  if (node.state === "locked") return <Lock className="h-5 w-5" strokeWidth={2.5} />;
  if (node.icon === "crown") return <Crown className="h-6 w-6" strokeWidth={2.5} />;
  return <Sparkles className="h-6 w-6" strokeWidth={2.5} />;
}

function ConstellationNode({ node, index }: { node: PathNode; index: number }) {
  const isActive = node.state === "active";
  const isDone = node.state === "done";
  const isLocked = node.state === "locked";

  return (
    <div
      className="flex flex-col items-center gap-2.5"
      style={{ transform: `translateX(${OFFSETS[index % OFFSETS.length]})` }}
    >
      <motion.button
        whileTap={isLocked ? undefined : { scale: 0.92, y: 2 }}
        whileHover={isLocked ? undefined : { scale: 1.06 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        className={cn(
          "relative flex h-[68px] w-[68px] items-center justify-center rounded-full",
          isDone && "text-[#04140D]",
          isActive && "text-[#160D02]",
          isLocked && "text-slate-500",
        )}
        style={{
          background: isDone
            ? "linear-gradient(160deg, #4ADE80, #059669)"
            : isActive
              ? "linear-gradient(160deg, #FBBF24, #D97706)"
              : "rgba(148,163,184,0.06)",
          border: isLocked
            ? "1px solid rgba(148,163,184,0.18)"
            : "1px solid rgba(255,255,255,0.35)",
          boxShadow: isDone
            ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 8px 22px -6px rgba(16,185,129,0.5)"
            : isActive
              ? "inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 26px -6px rgba(245,158,11,0.6)"
              : "inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: isLocked ? "blur(8px)" : undefined,
        }}
      >
        {/* pulsing ambient ring on the active/unlocked node */}
        {isActive && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(245,158,11,0.5)",
                "0 0 0 16px rgba(245,158,11,0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <NodeGlyph node={node} />
      </motion.button>

      <span
        className={cn(
          "max-w-[120px] text-center text-xs font-medium leading-tight text-balance",
          isLocked ? "text-slate-500" : "text-slate-200",
        )}
      >
        {node.label}
      </span>

      {isActive && (
        <motion.span
          initial={{ y: -3, opacity: 0.7 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
        >
          Begin
        </motion.span>
      )}
    </div>
  );
}

export function PathView() {
  return (
    <div className="relative mx-auto h-full max-w-md overflow-y-auto pb-24">
      {/* faint star field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 12%, rgba(226,232,240,0.6), transparent), radial-gradient(1px 1px at 68% 22%, rgba(125,211,252,0.5), transparent), radial-gradient(1.5px 1.5px at 42% 44%, rgba(226,232,240,0.4), transparent), radial-gradient(1px 1px at 82% 60%, rgba(251,191,36,0.4), transparent), radial-gradient(1px 1px at 30% 78%, rgba(226,232,240,0.5), transparent)",
        }}
      />

      {CHAPTERS.map((chapter) => (
        <section key={chapter.id}>
          {/* Sticky chapter header */}
          <div className="sticky top-0 z-10 px-4 py-3">
            <div
              className="flex items-center justify-between rounded-2xl px-5 py-4"
              style={{
                background: "rgba(15,23,42,0.72)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(245,158,11,0.18)",
                boxShadow: "0 8px 30px -12px rgba(0,0,0,0.7)",
              }}
            >
              <div>
                <h2 className="text-base font-semibold tracking-tight text-slate-100">
                  {chapter.title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">{chapter.subtitle}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
          </div>

          {/* Winding constellation trail */}
          <div className="relative flex flex-col items-center gap-11 px-4 py-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-6 left-1/2 -z-0 w-px -translate-x-1/2"
              style={{
                background:
                  "repeating-linear-gradient(rgba(125,211,252,0.35) 0 6px, transparent 6px 16px)",
              }}
            />
            {chapter.nodes.map((node, i) => (
              <div key={node.id} className="relative z-[1]">
                <ConstellationNode node={node} index={i} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
