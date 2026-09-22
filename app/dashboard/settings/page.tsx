import Link from "next/link";
import { ArrowRight, CreditCard, Sparkles, User as UserIcon } from "lucide-react";

import { getOrCreateDbUser } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import { createPortalSession } from "@/lib/actions/stripe";
import { hasComplimentaryAccess } from "@/lib/premium";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/dashboard/profile-form";

const STATUS_LABELS: Record<string, string> = {
  trialing: "Essai en cours",
  active: "Membre actif",
  past_due: "Paiement en retard",
  canceled: "Résilié",
};

export default async function SettingsPage() {
  const user = await getOrCreateDbUser();
  const isComplimentary = hasComplimentaryAccess(user.email);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez votre profil et votre abonnement Lock In.
        </p>
      </div>

      <Card className="surface">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <UserIcon className="size-4 text-brand-blue" />
          <CardTitle className="text-base">Profil membre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="text-foreground">{user.name}</p>
            <p>{user.email}</p>
          </div>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      <Card className="surface">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-brand-blue" />
            <CardTitle className="text-base">Coach IA</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Choisis l&apos;apparence, le ton et le nom de ton mentor
            d&apos;excellence.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/settings/ai">
              Configurer mon Coach IA <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="surface">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <CreditCard className="size-4 text-brand-blue" />
          <CardTitle className="text-base">Abonnement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Statut</span>
            <Badge variant={isComplimentary || user.stripeSubscriptionStatus === "active" ? "default" : "outline"}>
              {isComplimentary
                ? "Premium (offert)"
                : user.stripeSubscriptionStatus
                  ? (STATUS_LABELS[user.stripeSubscriptionStatus] ?? user.stripeSubscriptionStatus)
                  : "Aucun abonnement"}
            </Badge>
          </div>

          {isComplimentary ? (
            <p className="text-xs text-muted-foreground">
              Accès premium offert à ce compte, aucun paiement requis.
            </p>
          ) : isStripeConfigured ? (
            <form action={createPortalSession}>
              <Button type="submit" variant="outline" className="w-full">
                Gérer mon abonnement
              </Button>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">
              La gestion des paiements sera bientôt disponible.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
