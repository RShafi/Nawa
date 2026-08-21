"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { TashkeelToggle } from "@/components/common/TashkeelToggle";
import { ArabicText } from "@/components/common/ArabicText";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-border/80 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Nawā</h1>
          <span className="text-muted-foreground text-sm">|</span>
          <ArabicText className="text-xl font-semibold sm:text-2xl">نَوَاة</ArabicText>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <TashkeelToggle />
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>
        </div>
      </div>
    </header>
  );
}
