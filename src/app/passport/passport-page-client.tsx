"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { unlockCityAction } from "@/app/actions/progress";
import { CityCard } from "@/components/passport/CityCard";
import { PASSPORT_CITIES } from "@/data/passportCities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGamificationStore } from "@/store/useGamificationStore";

export function PassportPageClient() {
  const hibrCurrency = useGamificationStore((s) => s.hibrCurrency);
  const unlockedCities = useGamificationStore((s) => s.unlockedCities);
  const setHibrCurrency = useGamificationStore((s) => s.setHibrCurrency);
  const addUnlockedCity = useGamificationStore((s) => s.addUnlockedCity);
  const progressHydrated = useGamificationStore((s) => s.progressHydrated);

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
      addUnlockedCity(cityId);
      setJustUnlocked(cityId);
      window.setTimeout(() => setJustUnlocked(null), 1800);
      if (typeof result.currency === "number") {
        setHibrCurrency(result.currency);
      } else {
        setHibrCurrency(hibrCurrency - cost);
      }
    });
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1 text-white/70">
        <Link href="/">
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </Button>

      <section className="glass-panel glow-amber relative overflow-hidden space-y-4 rounded-3xl px-5 py-8 sm:px-8">
        <div
          className="pointer-events-none absolute -end-8 top-0 size-48 rounded-full bg-amber-400/15 blur-3xl"
          aria-hidden
        />
        <Badge variant="secondary" className="gap-1.5 border-amber-400/20 bg-amber-500/10 text-amber-100">
          <MapPin className="size-3.5" />
          Passport
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Your dialect cities
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          Earn Hibr by finishing lessons, then unlock cities on your learning map. Progress syncs to
          your account.
        </p>
        <p className="font-mono text-sm text-amber-100/90">
          {progressHydrated ? hibrCurrency : "—"} Hibr available
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
              canAfford={hibrCurrency >= city.cost}
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
