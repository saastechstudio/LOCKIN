import { ArrowRight } from "lucide-react";

import { db } from "@/lib/db";
import { getOrCreateDbUser } from "@/lib/auth";
import { NetworkDirectory } from "@/components/dashboard/network-directory";
import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/icons/discord-icon";
import { DISCORD_INVITE_URL } from "@/lib/social-links";

export default async function NetworkPage() {
  const user = await getOrCreateDbUser();

  const members = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      avatarUrl: true,
      email: true,
      sector: true,
      skills: true,
      bio: true,
    },
  });

  const otherMembers = members.filter((m) => m.id !== user.id);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">Réseau & Entraide</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {otherMembers.length} membre{otherMembers.length > 1 ? "s" : ""} du
          club. Filtrez par secteur ou compétences pour créer les bonnes
          connexions.
        </p>
      </div>

      <div className="surface mb-6 flex flex-col items-start justify-between gap-4 rounded-xl p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-blue/25 bg-brand-blue/10">
            <DiscordIcon className="size-5 text-brand-blue" />
          </div>
          <div>
            <p className="font-display text-base text-foreground">
              Intègre le mouvement
            </p>
            <p className="text-xs text-muted-foreground">
              Retrouve les membres du club en direct sur Discord.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
            Rejoindre le Discord <ArrowRight className="size-4" />
          </a>
        </Button>
      </div>

      <NetworkDirectory members={otherMembers} />
    </div>
  );
}
