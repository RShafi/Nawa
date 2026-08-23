"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

type AppStoreHydratorProps = {
  children: React.ReactNode;
  /** When true, always re-fetch (e.g. after login). */
  force?: boolean;
};

/**
 * Hydrates the unified V1 app store (Hibr, vocab, FSRS, cities, path nodes).
 */
export function AppStoreHydrator({ children, force = false }: AppStoreHydratorProps) {
  const hydrate = useAppStore((s) => s.hydrate);
  const status = useAppStore((s) => s.status);

  useEffect(() => {
    if (force || status === "idle") {
      void hydrate();
    }
  }, [force, hydrate, status]);

  return <>{children}</>;
}
