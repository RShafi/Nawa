import { parse, Path, type Font } from "opentype.js";

import {
  CALLIGRAPHY_VIEWBOX_WIDTH,
  resolveCalligraphyLetters,
  resolveCalligraphyPlan,
  type CalligraphyMode,
} from "@/lib/calligraphyPaths";

export { resolveCalligraphyLetters, resolveCalligraphyPlan };
export type { CalligraphyMode };

export const GLYPH_FONT_URL = "/fonts/Amiri-Regular.ttf";
export const CALLIGRAPHY_VIEWBOX_HEIGHT = 400;

const MARK_AREA_THRESHOLD = 1200;
const MARK_SIZE_THRESHOLD = 32;
const TASHKEEL_RE = /[\u064B-\u065F\u0670\u0617-\u061A\u06D6-\u06ED]/g;

function splitBareAndTashkeel(letter: string): { bare: string; tashkeel: readonly string[] } {
  const tashkeel = [...(letter.match(TASHKEEL_RE) ?? [])];
  const bare = letter.replace(TASHKEEL_RE, "");
  return { bare: bare || letter, tashkeel };
}

function tashkeelMarksForLetter(
  font: Font,
  tashkeel: readonly string[],
  anchorX: number,
  bodyPath: Path,
  fontSize: number,
): { d: string; cx: number; cy: number }[] {
  if (tashkeel.length === 0) return [];

  const bbox = bodyPath.getBoundingBox();
  const markSize = fontSize * 0.42;
  const markY = bbox.y1 - markSize * 0.35;

  return tashkeel.map((mark, index) => {
    const offsetX =
      anchorX + (index - (tashkeel.length - 1) / 2) * markSize * 0.25;
    const path = font.getPath(mark, offsetX, markY, markSize);
    const markBox = path.getBoundingBox();
    return {
      d: path.toPathData(2),
      cx: (markBox.x1 + markBox.x2) / 2,
      cy: (markBox.y1 + markBox.y2) / 2,
    };
  });
}

let fontPromise: Promise<Font> | null = null;

async function fetchAndParseFont(): Promise<Font> {
  const response = await fetch(GLYPH_FONT_URL);
  if (!response.ok) {
    throw new Error(`Failed to load calligraphy font (${response.status})`);
  }
  const buffer = await response.arrayBuffer();
  return parse(buffer);
}

export function loadCalligraphyFont(): Promise<Font> {
  fontPromise ??= fetchAndParseFont();
  return fontPromise;
}

export type InkStrokeKind = "body" | "mark";

export type InkStroke = {
  id: string;
  letter: string;
  kind: InkStrokeKind;
  d: string;
  centerX: number;
  rtlLetterOrder: number;
  strokeIndex: number;
  globalIndex: number;
  /** Framer delay — index from the right × 0.8 s (body strokes only). */
  letterDelay: number;
  markCenter?: { cx: number; cy: number };
};

export type GlyphScene = {
  strokes: InkStroke[];
  baselineY: number;
  letterCount: number;
  mode: CalligraphyMode;
  displayText: string;
};

/** Pause before the next letter's body stroke (sequential RTL choreography). */
export const LETTER_START_DELAY = 0.55;

function fontSizeForLetterCount(count: number): number {
  if (count <= 1) return 160;
  if (count <= 3) return 148;
  if (count <= 5) return 118;
  if (count <= 7) return 96;
  return Math.max(72, Math.floor(640 / count));
}

function typographicBaselineY(font: Font, fontSize: number): number {
  const scale = fontSize / font.unitsPerEm;
  const ascent = font.ascender * scale;
  const descent = Math.abs(font.descender * scale);
  const contentHeight = ascent + descent;
  const padding = 40;
  return padding + ascent + (CALLIGRAPHY_VIEWBOX_HEIGHT - padding * 2 - contentHeight) / 2;
}

function slotCenterX(index: number, total: number, mode: CalligraphyMode): number {
  if (total <= 1) return CALLIGRAPHY_VIEWBOX_WIDTH / 2;
  // Word mode packs graphemes tighter so writing reads as one continuous word.
  const margin = mode === "word" ? Math.max(96, 160 - total * 8) : Math.max(72, 120 - total * 4);
  const usable = CALLIGRAPHY_VIEWBOX_WIDTH - margin * 2;
  const step = usable / (total - 1);
  return CALLIGRAPHY_VIEWBOX_WIDTH - margin - step * index;
}

function splitPathIntoContours(source: Path): Path[] {
  const contours: Path[] = [];
  let current = new Path();

  for (const cmd of source.commands) {
    if (cmd.type === "M") {
      if (current.commands.length > 0) {
        contours.push(current);
        current = new Path();
      }
      current.moveTo(cmd.x, cmd.y);
      continue;
    }

    if (cmd.type === "L") current.lineTo(cmd.x, cmd.y);
    else if (cmd.type === "C") current.curveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
    else if (cmd.type === "Q") current.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
    else if (cmd.type === "Z") current.closePath();
  }

  if (current.commands.length > 0) contours.push(current);
  return contours;
}

function contourArea(path: Path): number {
  const bbox = path.getBoundingBox();
  return (bbox.x2 - bbox.x1) * (bbox.y2 - bbox.y1);
}

function isMarkContour(path: Path): boolean {
  const bbox = path.getBoundingBox();
  const width = bbox.x2 - bbox.x1;
  const height = bbox.y2 - bbox.y1;
  const area = width * height;
  return area < MARK_AREA_THRESHOLD || (width < MARK_SIZE_THRESHOLD && height < MARK_SIZE_THRESHOLD);
}

function decomposeGlyphPath(path: Path): { bodyD: string; marks: { d: string; cx: number; cy: number }[] } {
  const contours = splitPathIntoContours(path);
  const bodyParts: string[] = [];
  const marks: { d: string; cx: number; cy: number }[] = [];

  for (const contour of contours) {
    const d = contour.toPathData(2);
    if (!d) continue;

    if (isMarkContour(contour)) {
      const bbox = contour.getBoundingBox();
      marks.push({
        d,
        cx: (bbox.x1 + bbox.x2) / 2,
        cy: (bbox.y1 + bbox.y2) / 2,
      });
    } else {
      bodyParts.push(d);
    }
  }

  if (bodyParts.length === 0 && contours.length > 0) {
    const ranked = [...contours].sort((a, b) => contourArea(b) - contourArea(a));
    const primary = ranked[0]!;
    bodyParts.push(primary.toPathData(2));

    for (let i = 1; i < ranked.length; i++) {
      const contour = ranked[i]!;
      const bbox = contour.getBoundingBox();
      marks.push({
        d: contour.toPathData(2),
        cx: (bbox.x1 + bbox.x2) / 2,
        cy: (bbox.y1 + bbox.y2) / 2,
      });
    }
  }

  return { bodyD: bodyParts.join(" "), marks };
}

function centeredGlyphPath(
  font: Font,
  letter: string,
  centerX: number,
  baselineY: number,
  fontSize: number,
): Path {
  const probe = font.getPath(letter, 0, baselineY, fontSize);
  const bbox = probe.getBoundingBox();
  const glyphCenter = (bbox.x1 + bbox.x2) / 2;
  const x = centerX - glyphCenter;
  return font.getPath(letter, x, baselineY, fontSize);
}

type LayoutItem = { letter: string; centerX: number };

function layoutLetters(letters: readonly string[], mode: CalligraphyMode): LayoutItem[] {
  if (letters.length === 1) {
    return [{ letter: letters[0]!, centerX: CALLIGRAPHY_VIEWBOX_WIDTH / 2 }];
  }

  return letters.map((letter, index) => ({
    letter,
    centerX: slotCenterX(index, letters.length, mode),
  }));
}

function flattenLetterStrokes(
  letter: string,
  centerX: number,
  rtlLetterOrder: number,
  font: Font,
  baselineY: number,
  fontSize: number,
  startGlobalIndex: number,
): { strokes: InkStroke[]; nextGlobalIndex: number } {
  const { bare, tashkeel } = splitBareAndTashkeel(letter);
  const glyphPath = centeredGlyphPath(font, bare, centerX, baselineY, fontSize);
  const { bodyD, marks: nuqatMarks } = decomposeGlyphPath(glyphPath);
  const vowelMarks = tashkeelMarksForLetter(font, tashkeel, centerX, glyphPath, fontSize);
  const allMarks = [...nuqatMarks, ...vowelMarks];
  // Sequential playback: only the first letter of each new glyph waits a beat.
  const letterDelay = rtlLetterOrder > 0 ? LETTER_START_DELAY : 0;
  const strokes: InkStroke[] = [];
  let globalIndex = startGlobalIndex;

  if (bodyD) {
    strokes.push({
      id: `body-${letter}-${centerX}-${rtlLetterOrder}`,
      letter,
      kind: "body",
      d: bodyD,
      centerX,
      rtlLetterOrder,
      strokeIndex: 0,
      globalIndex,
      letterDelay,
    });
    globalIndex += 1;
  }

  allMarks.forEach((mark, markIndex) => {
    strokes.push({
      id: `mark-${letter}-${centerX}-${rtlLetterOrder}-${markIndex}`,
      letter,
      kind: "mark",
      d: mark.d,
      centerX,
      rtlLetterOrder,
      strokeIndex: markIndex + 1,
      globalIndex,
      letterDelay: 0,
      markCenter: { cx: mark.cx, cy: mark.cy },
    });
    globalIndex += 1;
  });

  return { strokes, nextGlobalIndex: globalIndex };
}

/** Build RTL ink choreography: body stroke first, nuqat/diacritics after, letter-by-letter from the right. */
export async function buildGlyphScene(
  letters: readonly string[],
  mode: CalligraphyMode = "letters",
  displayText = letters.join(" · "),
): Promise<GlyphScene> {
  const font = await loadCalligraphyFont();
  const fontSize = fontSizeForLetterCount(letters.length);
  const baselineY = typographicBaselineY(font, fontSize);
  const layout = layoutLetters(letters, mode);
  const rtlLayout = [...layout].sort((a, b) => b.centerX - a.centerX);

  const strokes: InkStroke[] = [];
  let globalIndex = 0;

  for (let rtlOrder = 0; rtlOrder < rtlLayout.length; rtlOrder++) {
    const item = rtlLayout[rtlOrder]!;
    const result = flattenLetterStrokes(
      item.letter,
      item.centerX,
      rtlOrder,
      font,
      baselineY,
      fontSize,
      globalIndex,
    );
    strokes.push(...result.strokes);
    globalIndex = result.nextGlobalIndex;
  }

  if (strokes.length === 0) {
    throw new Error(`No drawable strokes for: ${letters.join(", ")}`);
  }

  return { strokes, baselineY, letterCount: letters.length, mode, displayText };
}
