"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Feather, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { PathView } from "./PathView";
import { LessonView } from "./LessonView";
import { ArenaView } from "./ArenaView";

type View = "path" | "lesson" | "arena";

const VIEWS: { id: View; label: string; icon: typeof Compass }[] = [
  { id: "path", label: "Path", icon: Compass },
  { id: "lesson", label: "Lesson", icon: Feather },
  { id: "arena", label: "Arena", icon: Swords },
];

export default function PrototypePage() {
  const [view, setView] = useState<View>("path");

  return (
    <main
      className="flex min-h-[100dvh] flex-col items-center px-3 py-5"
      style={{
        background:
          "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(245,158,11,0.1), transparent), radial-gradient(ellipse 70% 45% at 100% 8%, rgba(56,189,248,0.08), transparent), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(217,119,6,0.06), transparent), #0B0F19",
      }}
    >
      {/* Wordmark */}
      <div className="mb-4 flex flex-col items-center">
        <h1 className="font-arabic text-2xl font-bold text-amber-200" dir="rtl" lang="ar">
          {"نَوَاة"}
        </h1>
        <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-slate-400">
          Nawā
        </p>
      </div>

      {/* View toggle */}
      <div
        className="flex w-full max-w-md items-center gap-1 rounded-2xl p-1.5"
        style={{
          background: "rgba(15,23,42,0.7)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(245,158,11,0.18)",
        }}
      >
        {VIEWS.map(({ id, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "text-[#160D02]" : "text-slate-400 hover:text-slate-200",
              )}
            >
              {active && (
                <motion.span
                  layoutId="astral-toggle-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "linear-gradient(160deg, #FBBF24, #D97706)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 20px -6px rgba(245,158,11,0.6)",
                  }}
                  transition={{ type: "spring", stiffness: 480, damping: 32 }}
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
        <div
          className="relative h-[calc(100dvh-9.5rem)] overflow-hidden rounded-[2rem]"
          style={{
            background: "rgba(11,15,25,0.6)",
            border: "1px solid rgba(148,163,184,0.14)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.04), 0 30px 70px -30px rgba(0,0,0,0.9)",
          }}
        >
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
