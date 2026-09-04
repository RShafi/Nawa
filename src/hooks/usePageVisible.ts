"use client";

import { useSyncExternalStore } from "react";

function subscribeVisibility(onStoreChange: () => void): () => void {
  if (typeof document === "undefined") return () => {};

  const handler = () => onStoreChange();
  document.addEventListener("visibilitychange", handler);
  window.addEventListener("pagehide", handler);
  return () => {
    document.removeEventListener("visibilitychange", handler);
    window.removeEventListener("pagehide", handler);
  };
}

function getVisibilitySnapshot(): boolean {
  if (typeof document === "undefined") return true;
  return !document.hidden;
}

function getVisibilityServerSnapshot(): boolean {
  return true;
}

/** True when the page tab is visible and active. */
export function usePageVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    getVisibilitySnapshot,
    getVisibilityServerSnapshot,
  );
}
