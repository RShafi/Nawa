"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BustanGarden } from "@/components/bustan/BustanGarden";
import { Button } from "@/components/ui/button";

export function BustanPageClient() {
  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
      <Button asChild variant="ghost" size="sm" className="-ms-2 gap-1">
        <Link href="/">
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </Button>
      <BustanGarden />
    </main>
  );
}
