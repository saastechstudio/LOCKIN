import { UserButton } from "@clerk/nextjs";

import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/db/schema";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  trialing: { label: "Essai en cours", variant: "outline" },
  active: { label: "Membre actif", variant: "default" },
  past_due: { label: "Paiement en retard", variant: "secondary" },
  canceled: { label: "Résilié", variant: "secondary" },
};

export function DashboardTopbar({ user }: { user: User }) {
  const firstName = user.name?.split(" ")[0] ?? "Membre";
  const status = user.stripeSubscriptionStatus
    ? STATUS_LABELS[user.stripeSubscriptionStatus]
    : null;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-6 backdrop-blur-md">
      <div>
        <p className="font-serif text-lg text-foreground">
          {greeting()}, {firstName}
        </p>
        <p className="text-xs text-muted-foreground">
          Verrouille ton focus. Exécute avec excellence.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant={status?.variant ?? "outline"}>
          {status?.label ?? "Aucun abonnement"}
        </Badge>
        <UserButton
          appearance={{
            elements: { avatarBox: "size-9 ring-1 ring-gold/30 rounded-full" },
          }}
        />
      </div>
    </header>
  );
}
