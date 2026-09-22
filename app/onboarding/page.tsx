import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, HeartPulse, Rocket, Sparkle } from "lucide-react";

import { getOrCreateDbUser } from "@/lib/auth";
import { hasPremiumAccess, requiresSubscription } from "@/lib/premium";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OnboardingWelcomePage() {
  const user = await getOrCreateDbUser();

  if (requiresSubscription() && !hasPremiumAccess(user)) {
    redirect("/subscribe");
  }

  const firstName = user.name?.split(" ")[0] ?? "Membre";

  return (
    <div className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-16">
      <div className="space-y-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-coral/25 bg-brand-blue/5 px-4 py-1.5 text-xs tracking-[0.2em] text-brand-coral uppercase">
          <Sparkle className="size-3.5" />
          Bienvenue, {firstName}
        </span>
        <h1 className="font-display text-3xl text-foreground sm:text-4xl">
          Avant tout, faisons ton audit d&apos;entrée
        </h1>
        <p className="mx-auto max-w-lg text-muted-foreground">
          5 minutes pour cerner qui tu es et où tu vas. Le Coach IA s&apos;en
          sert pour construire ton programme sur mesure : ton frein
          principal, ta feuille de route et tes premières actions.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card className="surface">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <HeartPulse className="size-4 shrink-0 text-brand-coral" />
            <CardTitle className="font-display text-lg">
              Volet personnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tes motivations profondes, tes freins psychologiques, ta routine
              actuelle et ton niveau de discipline, pour identifier ce qui te
              pousse vraiment et ce qui te retient.
            </p>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Rocket className="size-4 shrink-0 text-brand-blue" />
            <CardTitle className="font-display text-lg">
              Volet professionnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ton secteur, ton niveau de revenus et tes objectifs
              professionnels, pour calibrer une feuille de route réaliste et
              ambitieuse.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/onboarding/audit">
            Commencer l&apos;audit <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Plus tard, j&apos;irai directement au dashboard
        </Link>
      </div>
    </div>
  );
}
