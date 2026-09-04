"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

/** Routes that always show the global taskbar. */
const ALWAYS_SHOW_NAV = new Set(["/", "/learning-path"]);

/** Routes where the global taskbar is hidden (immersive gameplay). */
const HIDE_NAV_PREFIXES = ["/arena", "/lesson/", "/loom/"] as const;

function shouldHideNav(pathname: string): boolean {
  if (ALWAYS_SHOW_NAV.has(pathname)) return false;
  return HIDE_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export type NavShellProps = {
  email?: string | null;
  children: React.ReactNode;
};

export function NavShell({ email, children }: NavShellProps) {
  const pathname = usePathname();
  const hideNav = shouldHideNav(pathname);

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {!hideNav ? <Navbar email={email} /> : null}
      <main className="relative flex w-full flex-1 flex-col">{children}</main>
    </div>
  );
}
