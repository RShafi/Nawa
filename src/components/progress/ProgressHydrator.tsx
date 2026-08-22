"use client";

import { useEffect } from "react";
import type { UserDashboardData } from "@/app/actions/progress";
import { useGamificationStore } from "@/store/useGamificationStore";
import { useNawaStore } from "@/store/nawa-store";

type ProgressHydratorProps = {
  data: UserDashboardData;
  children: React.ReactNode;
};

/**
 * Pushes server-fetched dashboard data into client stores once on mount / data change.
 */
export function ProgressHydrator({ data, children }: ProgressHydratorProps) {
  const hydrateUserState = useGamificationStore((s) => s.hydrateUserState);
  const hydrateLessonProgress = useNawaStore((s) => s.hydrateLessonProgress);

  useEffect(() => {
    hydrateUserState({
      currency: data.currency,
      trees: data.trees,
      unlockedCities: data.unlockedCities,
    });
    hydrateLessonProgress(data.completedLessonIds);
  }, [
    data.currency,
    data.trees,
    data.unlockedCities,
    data.completedLessonIds,
    hydrateUserState,
    hydrateLessonProgress,
  ]);

  return <>{children}</>;
}
