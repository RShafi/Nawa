"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { logout } from "@/app/login/actions";
import { ArabicText } from "@/components/common/ArabicText";
import { TashkeelToggle } from "@/components/common/TashkeelToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const NAV_LINKS = [
  {
    href: "/path",
    label: "Learning Path",
    match: (p: string) => p === "/path" || p.startsWith("/path/") || p.startsWith("/lesson"),
  },
  {
    href: "/arena",
    label: "Arena",
    match: (p: string) => p.startsWith("/arena"),
  },
  {
    href: "/passports",
    label: "Passports",
    match: (p: string) => p.startsWith("/passport"),
  },
  { href: "/review", label: "Review", match: (p: string) => p.startsWith("/review") },
] as const;

type NavbarProps = {
  email?: string | null;
};

export function Navbar({ email }: NavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!userRef.current?.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="glass-panel-strong glow-emerald mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl px-3 py-2.5 sm:px-4"
      >
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/50 opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px] shadow-emerald-400/80" />
          </span>
          <span className="flex items-baseline gap-1.5 tracking-tight">
            <ArabicText className="text-lg leading-none text-emerald-100 sm:text-xl">نَوَاة</ArabicText>
            <span className="text-white/25">|</span>
            <span className="text-base font-semibold text-white/95 sm:text-lg">Nawā</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-xl px-3 py-1.5 text-sm transition-colors",
                  active ? "text-white" : "text-white/55 hover:text-white/90",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-white/8"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="relative z-[1]">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <HibrBadge />
          <TashkeelToggle />
          <Button
            variant="ghost"
            size="icon"
            className="relative size-8 text-white/70 hover:bg-white/8 hover:text-white"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>

          {email ? (
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => setUserOpen((v) => !v)}
                className="glass-panel flex max-w-[9rem] items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs text-white/80 transition hover:bg-white/8 sm:max-w-[12rem]"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-semibold text-emerald-200 uppercase">
                  {email.slice(0, 1)}
                </span>
                <span className="hidden truncate sm:inline">{email}</span>
                <ChevronDown className="size-3.5 shrink-0 opacity-60" />
              </button>
              <AnimatePresence>
                {userOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="glass-panel-strong absolute end-0 top-[calc(100%+8px)] z-50 min-w-[10rem] overflow-hidden rounded-xl p-1 shadow-2xl"
                  >
                    <form action={logout}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/8 hover:text-white"
                      >
                        <LogOut className="size-3.5" />
                        Log out
                      </button>
                    </form>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : (
            <Button asChild size="sm" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              <Link href="/login">Log In</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-white/70 md:hidden"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="glass-panel-strong mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-2xl p-2 md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm",
                  link.match(pathname) ? "bg-white/8 text-white" : "text-white/65",
                )}
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function HibrBadge() {
  const hibr = useAppStore((s) => s.hibrBalance);
  const hydrated = useAppStore((s) => s.status === "ready");
  const hydrate = useAppStore((s) => s.hydrate);
  const prev = useRef(hibr);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (prev.current !== hibr) {
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 500);
      prev.current = hibr;
      return () => window.clearTimeout(t);
    }
  }, [hibr]);

  return (
    <Link
      href="/passports"
      className={cn(
        "glow-amber glass-panel inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-amber-100 transition hover:bg-amber-400/10",
        bump && "ring-1 ring-amber-300/50",
      )}
      title="Hibr ink"
    >
      <InkDropIcon className="size-3.5 shrink-0 text-amber-300" />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={hydrated ? hibr : "…"}
          initial={{ y: 8, opacity: 0, scale: 0.85 }}
          animate={{ y: 0, opacity: 1, scale: bump ? 1.12 : 1 }}
          exit={{ y: -8, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="font-mono text-xs font-semibold tabular-nums sm:text-sm"
        >
          {hydrated ? hibr : "—"}
        </motion.span>
      </AnimatePresence>
      <span className="hidden text-[10px] tracking-wide text-amber-200/70 uppercase sm:inline">
        Hibr
      </span>
    </Link>
  );
}

function InkDropIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.2c.4 0 .7.2.9.5 1.8 2.6 5.6 7.6 5.6 11a6.5 6.5 0 1 1-13 0c0-3.4 3.8-8.4 5.6-11 .2-.3.5-.5.9-.5Z" />
      <path
        d="M9.2 15.2c.4 1.8 1.7 3 3.3 3.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
