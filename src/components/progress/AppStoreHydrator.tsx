"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

type AppStoreHydratorProps = {
  children: React.ReactNode;
  /** When true, re-fetch once on mount (e.g. after login / star map entry). */
  force?: boolean;
};

/**
 * Hydrates the unified V1 app store (Hibr, vocab, FSRS, cities, path nodes).
 *
 * Important: `force` must not re-trigger on every `status` change — `hydrate()`
 * always transitions status (idle/ready → loading → idle/ready), which would
 * otherwise create an infinite update loop and freeze the page (Star Map).
 */
export function AppStoreHydrator({ children, force = false }: AppStoreHydratorProps) {
  const hydrate = useAppStore((s) => s.hydrate);
  const status = useAppStore((s) => s.status);
  const didForceRef = useRef(false);

  useEffect(() => {
    if (force) {
      if (didForceRef.current) return;
      didForceRef.current = true;
      void hydrate();
      return;
    }

    if (status === "idle") {
      void hydrate();
    }
  }, [force, hydrate, status]);

  return <>{children}</>;
}
