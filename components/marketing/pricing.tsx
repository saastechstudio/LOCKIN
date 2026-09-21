import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  "Tracking illimité d'OKRs",
  "Check-in quotidien guidé",
  "Coach IA d'excellence 24/7",
  "Accès à l'annuaire des membres",
  "14 jours d'essai gratuit",
];

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
          Un tarif, un engagement clair
        </h2>
        <p className="mt-4 text-muted-foreground">
          Accédez à l&apos;intégralité du club, sans surprise.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Mensuel</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-serif text-4xl text-foreground">14,90 €</span>
              <span className="text-sm text-muted-foreground">/ mois</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-2.5 text-left text-sm text-muted-foreground">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full" size="lg">
              <Link href="/sign-up">Rejoindre le Club</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="glass relative border-gold/40">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
            2 mois offerts
          </Badge>
          <CardHeader>
            <p className="text-sm text-muted-foreground">Annuel</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-serif text-4xl text-foreground">149 €</span>
              <span className="text-sm text-muted-foreground">/ an</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-2.5 text-left text-sm text-muted-foreground">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full" size="lg">
              <Link href="/sign-up">Rejoindre le Club</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
