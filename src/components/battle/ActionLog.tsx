"use client";

import { useEffect, useRef } from "react";
import { ScrollText } from "lucide-react";
import { useBattleStore } from "@/store/useBattleStore";

export function ActionLog({ compact = false }: { compact?: boolean }) {
  const log = useBattleStore((s) => s.log);
  const listRef = useRef<HTMLUListElement>(null);
  const latest = log[log.length - 1];

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [log.length]);

  if (compact) {
    return (
      <p className="truncate" title={latest}>
        {latest ?? "…"}
      </p>
    );
  }

  return (
    <aside className="glass-panel pointer-events-auto flex max-h-28 w-full flex-col overflow-hidden rounded-2xl border border-white/10">
      <div className="flex items-center gap-1.5 border-b border-white/8 px-3 py-1.5">
        <ScrollText className="size-3.5 text-white/40" />
        <p className="text-[10px] tracking-[0.18em] text-white/45 uppercase">Combat log</p>
      </div>
      <ul
        ref={listRef}
        className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-1.5 text-[11px] leading-snug text-white/60"
      >
        {log.length === 0 ? (
          <li className="text-white/35">Actions appear here.</li>
        ) : (
          log.slice(-6).map((line, i, arr) => (
            <li
              key={`${i}-${line.slice(0, 24)}`}
              className={i === arr.length - 1 ? "font-medium text-white" : ""}
            >
              {line}
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
