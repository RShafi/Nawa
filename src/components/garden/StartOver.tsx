"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { resetProgressAction } from "@/app/actions/garden";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";

export function StartOver({
  className,
  onDone,
}: {
  className?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const clearGarden = useAppStore((s) => s.clearGarden);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setPending(true);
    setError(null);
    const result = await resetProgressAction();
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not start over.");
      return;
    }
    clearGarden();
    setOpen(false);
    onDone?.();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className={className ?? "text-sm text-white/55 underline-offset-2 hover:text-white hover:underline"}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        Start over
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-sm space-y-3 rounded-2xl border border-white/15 bg-slate-950 p-5">
                <p className="text-lg text-white">Start over?</p>
                <p className="text-sm text-white/75">
                  This clears your words and your score. You will begin again with the letter b.
                </p>
                {error ? <p className="text-sm text-rose-200">{error}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>
                    Keep my words
                  </Button>
                  <Button type="button" disabled={pending} onClick={() => void confirm()}>
                    {pending ? "Clearing…" : "Clear and start over"}
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
