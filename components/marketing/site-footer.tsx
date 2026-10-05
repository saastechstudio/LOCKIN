import Link from "next/link";

import { DiscordIcon } from "@/components/icons/discord-icon";
import { DISCORD_INVITE_URL } from "@/lib/social-links";
import { Logo } from "@/components/lockin/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center md:flex-row md:justify-between md:text-left">
        <Logo size="sm" />

        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          L&apos;excellence n&apos;est pas une destination, c&apos;est une quête.
        </p>

        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href="/legal/mentions" className="hover:text-brand-blue">
            Mentions légales
          </Link>
          <Link href="/legal/cgv" className="hover:text-brand-blue">
            CGV
          </Link>
          <Link href="/legal/cgu" className="hover:text-brand-blue">
            CGU
          </Link>
          <Link href="/legal/confidentialite" className="hover:text-brand-blue">
            Confidentialité
          </Link>
          <Link href="/legal/charte-moderation" className="hover:text-brand-blue">
            Charte de modération
          </Link>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Rejoindre le Discord"
            className="flex size-9 items-center justify-center rounded-none bg-brand-dark text-brand-blue transition-transform hover:scale-105"
          >
            <DiscordIcon className="size-4" />
          </a>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground/60">
        © {new Date().getFullYear()} Lock In. Tous droits réservés.
      </p>
    </footer>
  );
}
