import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/icons/discord-icon";
import { DISCORD_INVITE_URL } from "@/lib/social-links";

export function DiscordCta() {
  return (
    <section className="px-6 py-16">
      <div className="surface mx-auto flex max-w-4xl flex-col items-center gap-5 rounded-2xl px-8 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-brand-blue/25 bg-brand-blue/10">
          <DiscordIcon className="size-6 text-brand-blue" />
        </div>
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">
          Intègre le mouvement
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Rejoins la communauté Lock In sur Discord et échange en direct avec
          des entrepreneurs qui avancent, comme toi, avec méthode.
        </p>
        <Button asChild size="lg">
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
            Rejoindre le Discord <ArrowRight className="size-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}
