"use client";

import { motion } from "framer-motion";
import { Check, Lock, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type NodeState = "done" | "active" | "locked";

interface PathNode {
  id: string;
  label: string;
  state: NodeState;
  icon?: "star" | "crown";
}

interface Unit {
  id: string;
  title: string;
  subtitle: string;
  nodes: PathNode[];
}

const UNITS: Unit[] = [
  {
    id: "u1",
    title: "Unit 1: Foundations",
    subtitle: "The Arabic alphabet & core sounds",
    nodes: [
      { id: "n1", label: "The Alphabet", state: "done" },
      { id: "n2", label: "Short Vowels", state: "done" },
      { id: "n3", label: "Intro to Verbs", state: "active", icon: "star" },
      { id: "n4", label: "Sun & Moon Letters", state: "locked" },
      { id: "n5", label: "Unit Boss", state: "locked", icon: "crown" },
    ],
  },
  {
    id: "u2",
    title: "Unit 2: Root & Pattern",
    subtitle: "Trilateral roots and word forms",
    nodes: [
      { id: "n6", label: "The Root System", state: "locked" },
      { id: "n7", label: "Form I Verbs", state: "locked" },
      { id: "n8", label: "Active Participles", state: "locked", icon: "star" },
      { id: "n9", label: "Building Nouns", state: "locked" },
      { id: "n10", label: "Unit Boss", state: "locked", icon: "crown" },
    ],
  },
];

// Zig-zag horizontal offsets for a playful winding trail.
const OFFSETS = ["0%", "18%", "8%", "-14%", "0%"];

function NodeIcon({ node }: { node: PathNode }) {
  if (node.state === "done") return <Check className="h-7 w-7" strokeWidth={3} />;
  if (node.state === "locked") return <Lock className="h-6 w-6" strokeWidth={2.5} />;
  if (node.icon === "crown") return <Crown className="h-7 w-7" strokeWidth={2.5} />;
  return <Star className="h-7 w-7 fill-current" strokeWidth={2.5} />;
}

function PathNodeButton({ node, index }: { node: PathNode; index: number }) {
  const isActive = node.state === "active";
  const isDone = node.state === "done";
  const isLocked = node.state === "locked";

  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{ transform: `translateX(${OFFSETS[index % OFFSETS.length]})` }}
    >
      <motion.button
        whileTap={isLocked ? undefined : { y: 6, boxShadow: "none" }}
        whileHover={isLocked ? undefined : { scale: 1.05 }}
        className={cn(
          "relative flex h-[72px] w-[72px] items-center justify-center rounded-full",
          "transition-colors",
          isDone && "bg-primary text-primary-foreground",
          isActive && "bg-[oklch(0.82_0.14_85)] text-[oklch(0.2_0.04_85)]",
          isLocked && "glass-panel text-muted-foreground",
        )}
        style={{
          boxShadow: isDone
            ? "0 7px 0 0 oklch(0.55 0.13 160), 0 8px 22px -4px oklch(0.78 0.14 160 / 55%)"
            : isActive
              ? "0 7px 0 0 oklch(0.58 0.13 70), 0 8px 22px -4px oklch(0.82 0.14 85 / 60%)"
              : "0 6px 0 0 oklch(0.1 0.02 265)",
        }}
      >
        {isActive && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            animate={{ boxShadow: ["0 0 0 0 oklch(0.82 0.14 85 / 55%)", "0 0 0 14px oklch(0.82 0.14 85 / 0%)"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <NodeIcon node={node} />
      </motion.button>

      <span
        className={cn(
          "max-w-[110px] text-center text-xs font-semibold leading-tight text-balance",
          isLocked ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {node.label}
      </span>

      {isActive && (
        <motion.span
          initial={{ y: -4, opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-full bg-[oklch(0.82_0.14_85)] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[oklch(0.2_0.04_85)]"
        >
          Start
        </motion.span>
      )}
    </div>
  );
}

export function PathView() {
  return (
    <div className="mx-auto h-full max-w-md overflow-y-auto pb-24">
      {UNITS.map((unit) => (
        <section key={unit.id}>
          {/* Sticky unit header */}
          <div className="sticky top-0 z-10 px-4 py-3">
            <div className="glass-panel-strong flex items-center justify-between rounded-2xl px-5 py-4 shadow-lg">
              <div>
                <h2 className="text-lg font-black tracking-tight text-foreground">{unit.title}</h2>
                <p className="text-xs text-muted-foreground">{unit.subtitle}</p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>
          </div>

          {/* Winding node trail */}
          <div className="relative flex flex-col items-center gap-10 px-4 py-10">
            {/* connecting dotted path behind nodes */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-6 left-1/2 -z-0 w-1 -translate-x-1/2 rounded-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(oklch(1 0 0 / 22%) 0 8px, transparent 8px 20px)",
              }}
            />
            {unit.nodes.map((node, i) => (
              <div key={node.id} className="relative z-[1]">
                <PathNodeButton node={node} index={i} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
