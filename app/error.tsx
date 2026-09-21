"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background bg-noise px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <h1 className="font-display mt-6 text-2xl text-foreground">
        Une erreur est survenue
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        Quelque chose s&apos;est mal passé de notre côté. Réessaie, ou
        reviens plus tard si le problème persiste.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => reset()}>Réessayer</Button>
        <Button asChild variant="outline">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}
