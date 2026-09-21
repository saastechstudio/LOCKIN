import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createCheckoutSession } from "@/lib/actions/stripe";
import { isStripeConfigured, PRICE_MONTHLY, PRICE_YEARLY } from "@/lib/stripe";

const FEATURES = [
  "Tracking illimité d'OKRs",
  "Check-in quotidien guidé",
  "Coach IA d'excellence 24/7 (business & lifestyle)",
  "Audit d'onboarding personnalisé + feuille de route",
  "Accès à l'annuaire des membres",
];

const MONTHLY_PRICE = 9.9;
const YEARLY_PRICE = 89.9;
const YEARLY_EQUIVALENT_MONTHLY = MONTHLY_PRICE * 12;
const SAVINGS_PERCENT = Math.round(
  ((YEARLY_EQUIVALENT_MONTHLY - YEARLY_PRICE) / YEARLY_EQUIVALENT_MONTHLY) * 100,
);

function CheckoutButton({ priceId, label }: { priceId?: string; label: string }) {
  if (!isStripeConfigured || !priceId) {
    return (
      <Button className="w-full" size="lg" disabled>
        Bientôt disponible
      </Button>
    );
  }

  return (
    <form action={createCheckoutSession.bind(null, priceId)}>
      <Button type="submit" className="w-full" size="lg">
        {label}
      </Button>
    </form>
  );
}

export function PricingCards() {
  return (
    <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
      <Card className="glass">
        <CardHeader>
          <p className="text-sm text-muted-foreground">Mensuel</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-4xl text-foreground">
              {MONTHLY_PRICE.toFixed(2).replace(".", ",")} €
            </span>
            <span className="text-sm text-muted-foreground">/ mois</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-2.5 text-left text-sm text-muted-foreground">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-prune" />
                {f}
              </li>
            ))}
          </ul>
          <CheckoutButton priceId={PRICE_MONTHLY} label="Rejoindre le Club" />
        </CardContent>
      </Card>

      <Card className="glass relative border-brand-prune/40">
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Économisez {SAVINGS_PERCENT}%
        </Badge>
        <CardHeader>
          <p className="text-sm text-muted-foreground">Annuel</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl text-foreground">
              {YEARLY_PRICE.toFixed(2).replace(".", ",")} €
            </span>
            <span className="text-sm text-muted-foreground">/ an</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground/70 line-through">
            {YEARLY_EQUIVALENT_MONTHLY.toFixed(2).replace(".", ",")} € au tarif mensuel
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-2.5 text-left text-sm text-muted-foreground">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-brand-prune" />
                {f}
              </li>
            ))}
          </ul>
          <CheckoutButton priceId={PRICE_YEARLY} label="Rejoindre le Club" />
        </CardContent>
      </Card>

      <p className="col-span-full flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-brand-rose" />
        Paiement sécurisé par Stripe · 14 jours d&apos;essai gratuit · Résiliable à tout
        moment
      </p>
    </div>
  );
}

export { MONTHLY_PRICE, YEARLY_PRICE, SAVINGS_PERCENT };
