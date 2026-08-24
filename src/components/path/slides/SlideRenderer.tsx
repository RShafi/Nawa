"use client";

import { useCallback, useEffect, useState } from "react";
import type { CurriculumSlide } from "@/data/curriculum";
import { InfoSlide } from "@/components/path/slides/InfoSlide";
import { ListeningSlide } from "@/components/path/slides/ListeningSlide";
import { MatchingSlide } from "@/components/path/slides/MatchingSlide";
import { MorphologySlide } from "@/components/path/slides/MorphologySlide";
import { PhoneticSlide } from "@/components/path/slides/PhoneticSlide";
import { ShapeSlide } from "@/components/path/slides/ShapeSlide";
import { SyntaxSlide } from "@/components/path/slides/SyntaxSlide";
import { TranslationSlide } from "@/components/path/slides/TranslationSlide";
import { VocabSlide } from "@/components/path/slides/VocabSlide";

export function SlideRenderer({
  slide,
  onComplete,
}: {
  slide: CurriculumSlide;
  onComplete: () => void;
}) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((k) => k + 1);
  }, [slide.id]);

  const done = useCallback(() => onComplete(), [onComplete]);

  const interaction = slide.interaction;

  switch (interaction.type) {
    case "info":
      return <InfoSlide key={key} data={interaction.data} onComplete={done} />;
    case "vocab":
      return <VocabSlide key={key} data={interaction.data} onComplete={done} />;
    case "listening":
      return <ListeningSlide key={key} data={interaction.data} onComplete={done} />;
    case "translation":
      return <TranslationSlide key={key} data={interaction.data} onComplete={done} />;
    case "phonetic":
      return <PhoneticSlide key={key} data={interaction.data} onComplete={done} />;
    case "shape":
      return <ShapeSlide key={key} data={interaction.data} onComplete={done} />;
    case "morphology":
      return <MorphologySlide key={key} data={interaction.data} onComplete={done} />;
    case "syntax":
      return <SyntaxSlide key={key} data={interaction.data} onComplete={done} />;
    case "matching":
      return <MatchingSlide key={key} data={interaction.data} onComplete={done} />;
    default:
      return null;
  }
}
