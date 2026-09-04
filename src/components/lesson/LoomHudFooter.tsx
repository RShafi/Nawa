"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

const LoomHudFooterHostContext = createContext<HTMLElement | null>(null);

export function LoomHudFooterProvider({
  host,
  children,
}: {
  host: HTMLElement | null;
  children: ReactNode;
}) {
  return (
    <LoomHudFooterHostContext.Provider value={host}>{children}</LoomHudFooterHostContext.Provider>
  );
}

/** Renders step footers into the left HUD panel without lifting state. */
export function LoomHudFooterPortal({ children }: { children: ReactNode }) {
  const host = useContext(LoomHudFooterHostContext);
  if (!host) return null;
  return createPortal(children, host);
}
