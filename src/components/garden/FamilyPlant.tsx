"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArabicText } from "@/components/common/ArabicText";
import {
  displayArabic,
  isLessonDone,
  plantReadingLevel,
  readingLabel,
  readingModeFromLevel,
  registerReady,
  stemForPlant,
  type FsrsLite,
  type PlantDef,
  type StemNode,
  type TreeRow,
} from "@/data/garden";
import { cn } from "@/lib/utils";
import type { TashkeelMode } from "@/types/arabic";

type FamilyPlantProps = {
  plant: PlantDef;
  completed: string[];
  deck: string[];
  fsrs: FsrsLite[];
  trees: TreeRow[];
  nextId: string | null;
  grewId: string | null;
};

export function FamilyPlant({
  plant,
  completed,
  deck,
  fsrs,
  trees,
  nextId,
  grewId,
}: FamilyPlantProps) {
  const stem = stemForPlant(plant);
  const grown = stem.filter((node) => isLessonDone(node.id, completed, deck));
  const next = stem.find((node) => node.id === nextId) ?? null;
  const waiting = stem.filter((node) => !isLessonDone(node.id, completed, deck) && node.id !== nextId);
  const wordGrown = plant.frames.some((frame) => isLessonDone(frame.lessonId, completed, deck));
  const mode = readingModeFromLevel(plantReadingLevel(plant.rootId, fsrs, trees));
  const ready = registerReady(plant, completed, deck);

  return (
    <article className="space-y-5">
      {wordGrown ? (
        <header className="flex items-end justify-between gap-3">
          <div>
            <ArabicText size="lg" forceFull className="text-emerald-50">
              {plant.letters}
            </ArabicText>
            <p className="text-sm text-white/60">{plant.gloss}</p>
          </div>
          <p className="text-xs text-white/45">{readingLabel(mode)}</p>
        </header>
      ) : null}

      <ol className="relative ms-1 space-y-3 border-s border-emerald-400/30 ps-6">
        {grown.map((node) => (
          <GrownNode
            key={node.id}
            node={node}
            fresh={grewId === node.id}
            mode={node.kind === "frame" ? mode : "full"}
            rootId={plant.rootId}
            fsrs={fsrs}
            trees={trees}
          />
        ))}
        {next ? (
          <li className="relative">
            <span className="absolute top-5 size-3 -start-[calc(1.5rem+6px)] rounded-full border-2 border-dashed border-emerald-200 bg-background" />
            <Link
              href={`/lesson/${next.id}`}
              className="block rounded-2xl border border-dashed border-emerald-300/80 bg-emerald-500/10 px-4 py-4 transition hover:bg-emerald-500/15"
            >
              <p className="text-xs font-medium text-emerald-100/80">Still open</p>
              <p className="mt-1 text-xl font-semibold text-white">{next.title}</p>
              <p className="mt-1 text-sm text-white/70">{next.task}</p>
            </Link>
          </li>
        ) : null}
      </ol>

      {waiting.length > 0 ? (
        <ul className="space-y-1 ps-7">
          {waiting.map((node) => (
            <li key={node.id} className="text-sm text-white/35">
              {node.title}
            </li>
          ))}
        </ul>
      ) : null}

      {ready ? (
        <p className="ps-7 text-sm text-white/50">
          You can hear these words in Damascus or Cairo.{" "}
          <Link href="/passports" className="text-white/70 underline underline-offset-2">
            Cities
          </Link>
        </p>
      ) : null}
    </article>
  );
}

function GrownNode({
  node,
  fresh,
  mode,
  rootId,
  fsrs,
  trees,
}: {
  node: StemNode;
  fresh: boolean;
  mode: TashkeelMode;
  rootId: string;
  fsrs: FsrsLite[];
  trees: TreeRow[];
}) {
  return (
    <li className="relative">
      <span
        className={cn(
          "absolute top-4 size-2.5 -start-[calc(1.5rem+5px)] rounded-full bg-emerald-400",
          fresh && "ring-4 ring-emerald-400/30",
        )}
      />
      <motion.div
        initial={fresh ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className={cn(
          "rounded-2xl border px-4 py-3",
          fresh ? "border-emerald-300/70 bg-emerald-500/15" : "border-white/10 bg-white/5",
        )}
      >
        <GrownBody node={node} mode={mode} rootId={rootId} fsrs={fsrs} trees={trees} />
      </motion.div>
    </li>
  );
}

function GrownBody({
  node,
  mode,
  rootId,
  fsrs,
  trees,
}: {
  node: StemNode;
  mode: TashkeelMode;
  rootId: string;
  fsrs: FsrsLite[];
  trees: TreeRow[];
}) {
  if (node.kind === "shapes" && node.shapes) {
    return (
      <div className="space-y-2">
        <div dir="rtl" className="flex flex-wrap justify-end gap-3">
          {node.shapes.map((shape) => (
            <span
              key={shape}
              lang="ar"
              className="font-arabic text-3xl text-amber-50 [unicode-bidi:isolate]"
            >
              {shape}
            </span>
          ))}
        </div>
        <p className="text-sm text-white/55">{node.title}</p>
      </div>
    );
  }

  if (node.kind === "sentence" && node.arabic) {
    return (
      <div className="space-y-1">
        <ArabicText size="md" forceFull className="text-amber-50">
          {node.arabic}
        </ArabicText>
        {node.meaning ? <p className="text-sm text-white/70">{node.meaning}</p> : null}
      </div>
    );
  }

  const arabic =
    node.kind === "frame" && node.arabic
      ? displayArabic(node.arabic, rootId, fsrs, trees)
      : node.arabic;

  return (
    <div className="flex items-baseline justify-between gap-3">
      {arabic ? (
        <ArabicText size={node.kind === "letter" || node.kind === "vowel" ? "lg" : "md"} mode={mode} className="text-amber-50">
          {arabic}
        </ArabicText>
      ) : null}
      <p dir="ltr" className="text-sm text-white/55 [unicode-bidi:isolate]">
        {node.title}
      </p>
    </div>
  );
}
