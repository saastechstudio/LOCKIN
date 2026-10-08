import Link from "next/link";

import { DiscordIcon } from "@/components/icons/discord-icon";
import { DISCORD_INVITE_URL } from "@/lib/social-links";
import { Logo } from "@/components/lockin/logo";
import { SLOGAN } from "@/components/lockin/primitives";

export function SiteFooter() {
  return (
    <footer className="border-t border-lk-line py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center md:flex-row md:justify-between md:text-left">
        <Logo size="sm" />

        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          {SLOGAN}
        </p>

        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href="/legal/mentions" className="hover:text-lk-black">
            Mentions légales
          </Link>
          <Link href="/legal/cgv" className="hover:text-lk-black">
            CGV
          </Link>
          <Link href="/legal/cgu" className="hover:text-lk-black">
            CGU
          </Link>
          <Link href="/legal/confidentialite" className="hover:text-lk-black">
            Confidentialité
          </Link>
          <Link href="/legal/charte-moderation" className="hover:text-lk-black">
            Charte de modération
          </Link>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Rejoindre le Discord"
            className="flex size-9 items-center justify-center border border-lk-line text-lk-black transition-colors hover:bg-lk-black hover:text-lk-white"
          >
            <DiscordIcon className="size-4" />
          </a>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground/60">
        © {new Date().getFullYear()} Lockin Social Club. Tous droits réservés.
      </p>
    </footer>
  );
}
