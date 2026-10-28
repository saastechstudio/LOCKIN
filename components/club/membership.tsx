import { LOCKIN_TRIP_HREF, JOIN_HREF, PRICE_LABEL } from "@/lib/club/membership";
import { ClubButton } from "./button";
import { Reveal } from "./reveal";

const INCLUDED = [
  "Le fil, les profils et la messagerie privée entre membres",
  "Les groupes par ville, sport, métier ou thème",
  "L'entraide en questions et réponses",
  "Objectifs à 30 jours, routines et progression",
  "L'annuaire de mentors et les défis",
];

export function ClubMembership() {
  return (
    <section id="adhesion" className="club-section">
      <div className="club-container">
        <Reveal>
          <p className="club-eyebrow text-club-bordeaux">Adhésion</p>
        </Reveal>
        <Reveal blur delay={0.1} as="h2">
          <span className="club-display club-h2 mt-6 block max-w-3xl text-balance">
            Un an offert, <em className="text-club-bordeaux">puis {PRICE_LABEL} par an</em>.
          </span>
        </Reveal>

        <Reveal delay={0.15} className="mt-14">
          <div className="grid overflow-hidden rounded-[22px] border border-club-concrete/50 lg:grid-cols-[1fr_1.1fr]">
            <div data-tone="dark" className="club-grain bg-club-bordeaux-deep p-8 text-club-ivory lg:p-12">
              <dl className="grid grid-cols-2 gap-8">
                <div>
                  <dt className="text-[11px] tracking-[0.26em] text-club-pierre uppercase">Première année</dt>
                  <dd className="club-display mt-3 text-[2.6rem] leading-none">Offerte</dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-[0.26em] text-club-pierre uppercase">Ensuite</dt>
                  <dd className="club-display mt-3 text-[2.6rem] leading-none">
                    {PRICE_LABEL}
                    <span className="ml-1 font-sans text-[14px] text-club-ivory/60">/ an TTC</span>
                  </dd>
                </div>
              </dl>
              <p className="mt-8 text-[14px] text-club-ivory/70">
                L&apos;année offerte commence le jour où tu entres dans le club avec ton numéro de membre, au
                début de ton séjour.
              </p>
            </div>

            <div className="p-8 lg:p-12">
              <h3 className="club-display text-[1.5rem]">Ce que tu rejoins</h3>
              <ul className="mt-6 space-y-3.5 text-[15px] text-club-ink-soft">
                {INCLUDED.map((t) => (
                  <li key={t} className="flex gap-3">
                    <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-club-bordeaux" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ClubButton href={LOCKIN_TRIP_HREF} size="lg" arrow>
                  Découvrir le Lockin Trip
                </ClubButton>
                <ClubButton href={JOIN_HREF} variant="outline" size="lg">
                  J&apos;ai mon numéro
                </ClubButton>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
