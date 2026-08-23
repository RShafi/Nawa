"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { unlockCityAction } from "@/app/actions/progress";
import { CityCard } from "@/components/passport/CityCard";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";
import { PASSPORT_CITIES } from "@/data/passportCities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";

export function PassportPageClient() {
  return (
    <AppStoreHydrator force>
      <PassportInner />
    </AppStoreHydrator>
  );
}

function PassportInner() {
  const hibrBalance = useAppStore((s) => s.hibrBalance);
  const unlockedCities = useAppStore((s) => s.unlockedCities);
  const status = useAppStore((s) => s.status);
  const setHibrBalance = useAppStore((s) => s.setHibrBalance);
  const unlockCityOptimistic = useAppStore((s) => s.unlockCityOptimistic);
  const hydrate = useAppStore((s) => s.hydrate);

  const [error, setError] = useState<string | null>(null);
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function unlock(cityId: string, cost: number) {
    setError(null);
    startTransition(async () => {
      const result = await unlockCityAction(cityId, cost);
      if (!result.ok) {
        setError(result.error ?? "Could not unlock city.");
        return;
      }
      unlockCityOptimistic(cityId);
      setJustUnlocked(cityId);
      window.setTimeout(() => setJustUnlocked(null), 2200);
      if (typeof result.currency === "number") {
        setHibrBalance(result.currency);
      } else {
        setHibrBalance(hibrBalance - cost);
      }
      void hydrate();
    });
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1 text-white/70">
        <Link href="/path">
          <ArrowLeft className="size-4" />
          Back to Path
        </Link>
      </Button>

      <section className="glass-panel glow-amber relative space-y-4 overflow-hidden rounded-3xl px-5 py-8 sm:px-8">
        <div
          className="pointer-events-none absolute -end-8 top-0 size-48 rounded-full bg-amber-400/15 blur-3xl"
          aria-hidden
        />
        <Badge
          variant="secondary"
          className="gap-1.5 border-amber-400/20 bg-amber-500/10 text-amber-100"
        >
          <MapPin className="size-3.5" />
          Pillar 3 · Passports
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Dialect cities
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          Spend Hibr from Arena wins and Reviews to stamp a city. Enter Hub opens dialect practice
          (chat coming soon).
        </p>
        <p className="font-mono text-sm text-amber-100/90">
          {status === "ready" ? hibrBalance : "—"} Hibr available
        </p>
      </section>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {PASSPORT_CITIES.map((city) => {
          const unlocked = unlockedCities.includes(city.id);
          return (
            <CityCard
              key={city.id}
              city={city}
              unlocked={unlocked}
              canAfford={hibrBalance >= city.cost}
              pending={pending}
              justUnlocked={justUnlocked === city.id}
              onUnlock={() => unlock(city.id, city.cost)}
            />
          );
        })}
      </div>
    </main>
  );
}
