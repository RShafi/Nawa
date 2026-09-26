"use client";

import { useState } from "react";
import Link from "next/link";
import { openRegisterAction } from "@/app/actions/garden";
import { DialectBridgeCard } from "@/components/dialect/DialectBridgeCard";
import { ArabicText } from "@/components/common/ArabicText";
import { AppStoreHydrator } from "@/components/progress/AppStoreHydrator";
import { Button } from "@/components/ui/button";
import { PLANTS, registerReady } from "@/data/garden";
import { useAppStore } from "@/store/useAppStore";

export function PassportPageClient() {
  return (
    <AppStoreHydrator>
      <Registers />
    </AppStoreHydrator>
  );
}

function Registers() {
  const completed = useAppStore((s) => s.completedLessonIds);
  const deck = useAppStore((s) => s.unlockedDeck);
  const cities = useAppStore((s) => s.unlockedCities);
  const hibr = useAppStore((s) => s.hibrBalance);
  const setHibr = useAppStore((s) => s.setHibrBalance);
  const unlockCity = useAppStore((s) => s.unlockCityOptimistic);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const readyPlants = PLANTS.filter((plant) => registerReady(plant, completed, deck));

  async function open(registerId: string, cost: number) {
    if (hibr < cost) {
      setError("Not enough score yet. Learn, review, or finish a sentence, then try again.");
      return;
    }
    setPending(registerId);
    setError(null);
    const result = await openRegisterAction(registerId);
    setPending(null);
    if (!result.ok) {
      setError(result.error ?? "Could not open that city.");
      return;
    }
    unlockCity(registerId);
    if (typeof result.hibrBalance === "number") setHibr(result.hibrBalance);
    setOpenId(registerId);
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
      <header className="space-y-2">
        <p className="text-xs tracking-wide text-emerald-200/80 uppercase">Cities</p>
        <h1 className="text-3xl font-semibold text-white">Hear it another way</h1>
        <p className="max-w-xl text-sm text-white/65">
          After two words from the same three letters, you can hear them the way people speak in Damascus or Cairo. Your score pays for that.
        </p>
        <p className="text-sm text-amber-100/80">Score: {hibr}</p>
      </header>

      {readyPlants.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          Learn two words from the same three letters, then come back.{" "}
          <Link href="/" className="text-emerald-200 underline">
            Home
          </Link>
        </div>
      ) : null}

      {error ? <p className="text-sm text-rose-200">{error}</p> : null}

      {readyPlants.map((plant) => (
        <section key={plant.rootId} className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div>
            <ArabicText size="md" forceFull className="text-emerald-50">
              {plant.letters}
            </ArabicText>
            <p className="text-sm text-white/55">{plant.gloss}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {plant.registers.map((register) => {
              const owned = cities.includes(register.id);
              return (
                <div key={register.id} className="rounded-xl border border-white/10 p-3">
                  <p className="text-white">{register.city}</p>
                  <ArabicText size="sm" forceFull className="text-amber-50">
                    {register.cityAr}
                  </ArabicText>
                  <p className="mt-1 text-xs text-white/50">
                    {register.dialect === "levantine" ? "Damascus speech" : "Cairo speech"} · {register.cost} score
                  </p>
                  {owned ? (
                    <Button
                      className="mt-3"
                      variant="outline"
                      onClick={() => {
                        setError(null);
                        setOpenId(register.id);
                      }}
                    >
                      Hear it
                    </Button>
                  ) : (
                    <Button
                      className="mt-3"
                      disabled={pending === register.id}
                      onClick={() => void open(register.id, register.cost)}
                    >
                      {pending === register.id ? "Opening…" : `Use ${register.cost} score`}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          {openId && plant.registers.some((register) => register.id === openId) ? (
            <DialectBridgeCard
              phraseId={plant.phraseId}
              focus={plant.registers.find((register) => register.id === openId)?.dialect ?? "msa"}
            />
          ) : null}
        </section>
      ))}
    </main>
  );
}
