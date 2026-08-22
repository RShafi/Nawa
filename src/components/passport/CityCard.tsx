"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { PassportCity } from "@/data/passportCities";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CITY_SCENES: Record<string, { gradient: string; accent: string }> = {
  damascus: {
    gradient: "from-rose-950/90 via-amber-950/50 to-[#090A0F]",
    accent: "rgba(251, 113, 133, 0.35)",
  },
  cairo: {
    gradient: "from-amber-950/90 via-orange-950/40 to-[#090A0F]",
    accent: "rgba(251, 191, 36, 0.4)",
  },
  amman: {
    gradient: "from-sky-950/90 via-slate-900/50 to-[#090A0F]",
    accent: "rgba(56, 189, 248, 0.35)",
  },
  beirut: {
    gradient: "from-violet-950/80 via-fuchsia-950/40 to-[#090A0F]",
    accent: "rgba(217, 70, 239, 0.35)",
  },
  riyadh: {
    gradient: "from-emerald-950/90 via-teal-950/40 to-[#090A0F]",
    accent: "rgba(52, 211, 153, 0.35)",
  },
};

type CityCardProps = {
  city: PassportCity;
  unlocked: boolean;
  canAfford: boolean;
  pending?: boolean;
  justUnlocked?: boolean;
  onUnlock: () => void;
};

export function CityCard({
  city,
  unlocked,
  canAfford,
  pending,
  justUnlocked,
  onUnlock,
}: CityCardProps) {
  const scene = CITY_SCENES[city.id] ?? CITY_SCENES.cairo!;

  return (
    <motion.article
      layout
      whileHover={{ y: unlocked ? -4 : -2 }}
      className={cn(
        "relative min-h-[13.5rem] overflow-hidden rounded-3xl border border-white/10",
        unlocked && "shimmer-border",
      )}
      style={{
        boxShadow: unlocked ? `0 0 36px -10px ${scene.accent}` : undefined,
      }}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", scene.gradient)} />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.06), transparent 45%)",
        }}
      />

      <div className="relative z-[1] flex h-full flex-col justify-between p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.2em] text-white/50 uppercase">Dialect city</p>
          <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {city.name}
          </h3>
          <p className="font-arabic text-xl leading-loose text-white/75" dir="rtl" lang="ar">
            {city.arabicName}
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-white/60 sm:text-base">
            {city.description}
          </p>
        </div>

        {unlocked ? (
          <p className="mt-5 text-sm text-emerald-200/90">Open for dialect practice soon.</p>
        ) : null}
      </div>

      {!unlocked ? (
        <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-3 bg-black/35 backdrop-blur-[6px]">
          <div className="glass-panel-strong flex size-14 items-center justify-center rounded-2xl">
            <Lock className="size-6 text-white/80" />
          </div>
          <p className="font-mono text-sm font-semibold text-amber-100 tabular-nums">
            {city.cost} Hibr
          </p>
          <Button
            disabled={pending || !canAfford}
            onClick={onUnlock}
            size="sm"
            className="bg-white/10 text-white hover:bg-white/15"
          >
            {canAfford ? "Purchase visa" : "Need more ink"}
          </Button>
        </div>
      ) : null}

      {unlocked ? (
        <div className="pointer-events-none absolute end-4 top-4 z-[3]">
          <AnimatePresence mode="wait">
            {justUnlocked ? (
              <VisaStamp key="anim" />
            ) : (
              <motion.div
                key="static"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rotate-[-12deg]"
              >
                <VisaStampStatic />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </motion.article>
  );
}

function VisaStamp() {
  return (
    <motion.div
      initial={{ scale: 2.2, opacity: 0, rotate: -28 }}
      animate={{ scale: 1, opacity: 1, rotate: -12 }}
      transition={{ type: "spring", stiffness: 260, damping: 14 }}
    >
      <VisaStampStatic />
    </motion.div>
  );
}

function VisaStampStatic() {
  return (
    <div className="rounded-lg border-2 border-emerald-400/70 bg-emerald-500/10 px-3 py-2 text-center shadow-[0_0_24px_-4px_rgba(52,211,153,0.55)] backdrop-blur-sm">
      <p className="text-[10px] font-bold tracking-[0.18em] text-emerald-200 uppercase">
        Visa Granted
      </p>
      <p className="font-arabic text-sm leading-loose text-emerald-100" dir="rtl" lang="ar">
        مُعْتَمَد
      </p>
    </div>
  );
}
