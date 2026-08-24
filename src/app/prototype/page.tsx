"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Map, GraduationCap, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { PathView } from "./PathView";
import { LessonView } from "./LessonView";
import { ArenaView } from "./ArenaView";

type View = "path" | "lesson" | "arena";

const VIEWS: { id: View; label: string; icon: typeof Map }[] = [
  { id: "path", label: "Path", icon: Map },
  { id: "lesson", label: "Lesson", icon: GraduationCap },
  { id: "arena", label: "Arena", icon: Swords },
];

export default function PrototypePage() {
  const [view, setView] = useState<View>("path");

  return (
    <main className="flex min-h-[100dvh] flex-col items-center px-3 py-4">
      {/* View toggle */}
      <div className="glass-panel-strong flex w-full max-w-md items-center gap-1 rounded-2xl p-1.5">
        {VIEWS.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="toggle-pill"
                  className="absolute inset-0 rounded-xl bg-primary"
                  style={{ boxShadow: "0 4px 0 0 oklch(0.55 0.13 160), 0 6px 18px -4px oklch(0.78 0.14 160 / 50%)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                />
              )}
              <span className="relative z-[1] flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Phone frame */}
      <div className="mt-4 w-full max-w-md flex-1">
        <div className="glass-panel relative h-[calc(100dvh-7rem)] overflow-hidden rounded-[2rem] border border-border shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              {view === "path" && <PathView />}
              {view === "lesson" && <LessonView />}
              {view === "arena" && <ArenaView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
