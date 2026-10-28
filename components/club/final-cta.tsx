import Link from "next/link";

import { JOIN_HREF, LOCKIN_TRIP_HREF } from "@/lib/club/membership";
import { ClubButton } from "./button";
import { ClubLogo } from "./logo";
import { Reveal } from "./reveal";

const LEGAL = [
  { href: "/legal/cgu", label: "CGU" },
  { href: "/legal/cgv", label: "CGV" },
  { href: "/legal/confidentialite", label: "Confidentialité" },
  { href: "/legal/charte-moderation", label: "Charte" },
  { href: "/legal/mentions", label: "Mentions légales" },
];

/** Appel final plein écran sombre, puis pied de page. */
export function ClubFinalCta() {
  return (
    <>
      <section data-tone="dark" className="club-grain flex min-h-[80svh] items-center bg-club-night text-club-ivory">
        <div className="club-container py-28 text-center">
          <Reveal blur as="h2">
            <span className="club-display club-h1 mx-auto block max-w-4xl text-balance">
              Le cercle commence par un choix : <em className="text-club-pierre">le tien</em>.
            </span>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-8 max-w-lg text-[17px] text-club-ivory/70">
              Réserve ton Lockin Trip. Ton numéro de membre fera le reste.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ClubButton href={LOCKIN_TRIP_HREF} size="lg" arrow>
              Découvrir le Lockin Trip
            </ClubButton>
            <ClubButton href={JOIN_HREF} variant="glass" size="lg">
              J&apos;ai mon numéro
            </ClubButton>
          </Reveal>
        </div>
      </section>

      <footer data-tone="dark" className="bg-club-night pb-10 text-club-ivory/70">
        <div className="club-container flex flex-col gap-8 border-t border-club-ivory/10 pt-10 md:flex-row md:items-center md:justify-between">
          <span className="text-club-pierre">
            <ClubLogo />
          </span>
          <nav aria-label="Informations légales">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="underline-offset-[6px] hover:text-club-ivory hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-[12px]">© {new Date().getFullYear()} Lockin Social Club</p>
        </div>
      </footer>
    </>
  );
}
