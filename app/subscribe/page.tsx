import { redirect } from "next/navigation";
import { Flame, ShieldCheck, Sparkle } from "lucide-react";

import { getOrCreateDbUser } from "@/lib/auth";
import { hasPremiumAccess, requiresSubscription } from "@/lib/premium";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { SubscribeFaq } from "@/components/marketing/subscribe-faq";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getOrCreateDbUser();
  const { error } = await searchParams;

  if (!requiresSubscription() || hasPremiumAccess(user)) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto min-h-svh max-w-3xl px-6 py-20">
      <div className="space-y-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-rose/25 bg-brand-prune/5 px-4 py-1.5 text-xs tracking-[0.2em] text-brand-rose uppercase">
          <Flame className="size-3.5" />
          Dernière étape
        </span>
        <h1 className="font-display text-4xl font-thin text-foreground sm:text-5xl">
          Verrouille ton accès, {user.name?.split(" ")[0] ?? "Membre"}.
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Le Club Lock In est réservé aux membres engagés. Choisis ta formule pour
          débloquer le Coach IA, ton audit personnalisé et le suivi quotidien —
          14 jours d&apos;essai gratuit, sans engagement.
        </p>
      </div>

      {error === "stripe-not-configured" && (
        <p className="mx-auto mt-6 max-w-xl rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          La facturation n&apos;est pas encore configurée. Réessaie dans un instant
          ou contacte le support.
        </p>
      )}

      <PricingCards />

      <div className="mx-auto mt-16 grid max-w-2xl gap-4 sm:grid-cols-3">
        <TrustPoint icon={ShieldCheck} label="Paiement sécurisé Stripe" />
        <TrustPoint icon={Sparkle} label="14 jours d'essai gratuit" />
        <TrustPoint icon={Flame} label="Résiliable à tout moment" />
      </div>

      <div className="mx-auto mt-20 max-w-2xl">
        <h2 className="font-display text-center text-2xl text-foreground">
          Questions fréquentes
        </h2>
        <SubscribeFaq />
      </div>
    </div>
  );
}

function TrustPoint({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card/50 px-4 py-3 text-xs text-muted-foreground">
      <Icon className="size-4 shrink-0 text-brand-prune" />
      {label}
    </div>
  );
}
