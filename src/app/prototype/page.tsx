"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Feather, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { PathView } from "./PathView";
import { LessonView } from "./LessonView";
import { ArenaView } from "./ArenaView";

type View = "path" | "lesson" | "arena";

const VIEWS = [
  { id: "path", label: "Path", icon: Compass, hint: "Your journey" },
  { id: "lesson", label: "Lesson", icon: Feather, hint: "Inscribe" },
  { id: "arena", label: "Arena", icon: Swords, hint: "Do battle" },
] as const;

const CELESTIAL_BG =
  "radial-gradient(ellipse 42% 34% at 14% 6%, rgba(245,158,11,0.10), transparent), radial-gradient(ellipse 38% 32% at 88% 10%, rgba(56,189,248,0.10), transparent), radial-gradient(ellipse 60% 45% at 50% 112%, rgba(217,119,6,0.08), transparent), #0B0F19";

const STARS =
  "radial-gradient(1px 1px at 12% 18%, rgba(226,232,240,0.7), transparent), radial-gradient(1px 1px at 32% 62%, rgba(125,211,252,0.6), transparent), radial-gradient(1.5px 1.5px at 55% 28%, rgba(226,232,240,0.5), transparent), radial-gradient(1px 1px at 72% 72%, rgba(251,191,36,0.5), transparent), radial-gradient(1px 1px at 85% 35%, rgba(226,232,240,0.6), transparent), radial-gradient(1px 1px at 22% 85%, rgba(226,232,240,0.5), transparent), radial-gradient(1.5px 1.5px at 65% 92%, rgba(125,211,252,0.4), transparent)";

export default function PrototypePage() {
  const [view, setView] = useState<View>("path");

  return (
    <main
      className="relative min-h-[100dvh] overflow-hidden"
      style={{ background: CELESTIAL_BG }}
    >
      {/* Deep atmospheric star field filling the whole monitor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: STARS }}
      />
      {/* Soft aurora blobs to fill desktop negative space */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 hidden h-96 w-96 rounded-full lg:block"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.10), transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-1/4 hidden h-96 w-96 rounded-full lg:block"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.10), transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="relative z-[1] flex min-h-[100dvh] flex-col lg:flex-row">
        {/* Desktop sidebar navigation */}
        <aside
          className="hidden shrink-0 flex-col justify-between border-r border-[rgba(148,163,184,0.12)] px-5 py-8 lg:flex lg:w-72"
          style={{ background: "rgba(11,15,25,0.55)", backdropFilter: "blur(16px)" }}
        >
          <div>
            <div className="mb-10 flex flex-col items-start">
              <h1
                className="font-arabic text-3xl font-bold text-amber-200"
                dir="rtl"
                lang="ar"
              >
                {"نَوَاة"}
              </h1>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.4em] text-slate-400">
                Nawā
              </p>
            </div>
            <nav className="flex flex-col gap-2">
              {VIEWS.map(({ id, label, icon: Icon, hint }) => {
                const active = view === id;
                return (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors",
                      active ? "text-[#160D02]" : "text-slate-300 hover:text-white",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill-desktop"
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: "linear-gradient(160deg, #FBBF24, #D97706)",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.45), 0 10px 26px -8px rgba(245,158,11,0.6)",
                        }}
                        transition={{ type: "spring", stiffness: 480, damping: 32 }}
                      />
                    )}
                    <span className="relative z-[1] flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold leading-tight">{label}</span>
                        <span
                          className={cn(
                            "text-[11px] leading-tight",
                            active ? "text-[#160D02]/70" : "text-slate-500",
                          )}
                        >
                          {hint}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            A gamified path to reading the Qur&apos;an in its own tongue.
          </p>
        </aside>

        {/* Mobile top bar + toggle */}
        <div className="flex flex-col items-center px-3 pt-5 lg:hidden">
          <div className="mb-4 flex flex-col items-center">
            <h1
              className="font-arabic text-2xl font-bold text-amber-200"
              dir="rtl"
              lang="ar"
            >
              {"نَوَاة"}
            </h1>
            <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-slate-400">
              Nawā
            </p>
          </div>
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
                      layoutId="nav-pill-mobile"
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
        </div>

        {/* Centered game stage */}
        <div className="flex flex-1 items-stretch justify-center px-3 py-4 lg:items-center lg:px-8 lg:py-8">
          <div className="relative h-[calc(100dvh-9.5rem)] w-full max-w-md overflow-hidden rounded-[2rem] border border-[rgba(148,163,184,0.14)] bg-[rgba(11,15,25,0.6)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_30px_70px_-30px_rgba(0,0,0,0.9)] lg:h-[calc(100dvh-4rem)] lg:max-w-2xl lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none">
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
      </div>
    </main>
  );
}
