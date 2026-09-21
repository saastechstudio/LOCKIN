import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background bg-noise">
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand-blue/10">
          <Compass className="size-6 text-brand-blue" />
        </div>
        <h1 className="font-display mt-6 text-3xl text-foreground">
          Page introuvable
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Cette page n&apos;existe pas ou a été déplacée. Vérifie
          l&apos;adresse ou reviens à l&apos;accueil.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Mon dashboard</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
