import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { CTAButton } from "@/components/camp/cta-button";
import { CAMP_PRICE_PER_PERSON, CAMP_SESSIONS_SEED, sessionDurationDays } from "@/lib/camp/data";

/**
 * Hero fond blanc pur — pas de dégradé, pas de visuel photo, pas de bloc
 * noir plein écran : la typographie massive en noir charbon et le logo
 * doré mat font le travail. Les deux CTA pointent vers les sections plus
 * bas de la même page (ancre), pas vers une route séparée — c'est une
 * landing page single-page.
 */
export function Hero() {
  const [session1, session2] = CAMP_SESSIONS_SEED;
  const days = sessionDurationDays(new Date(session1.startDate), new Date(session1.endDate));

  return (
    <section className="bg-camp-white px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="flex items-center gap-2.5">
          <Image src="/logo-mark.png" alt="" width={28} height={33} className="h-7 w-auto" />
          <span className="font-display text-sm tracking-[0.2em] text-camp-charcoal uppercase">
            lock in
          </span>
        </div>

        <div className="space-y-6 border-t-2 border-camp-gold pt-8">
          <p className="font-mono text-xs font-semibold tracking-[0.3em] text-camp-gold uppercase">
            Édition Phuket — {days} jours
          </p>
          <h1 className="font-display max-w-3xl text-5xl leading-[0.95] font-bold text-camp-charcoal uppercase sm:text-7xl">
            Lock-In Camp
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-camp-charcoal/60 sm:text-lg">
            10 jours de discipline, sport, mindset et performance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border-2 border-camp-hairline bg-camp-hairline sm:grid-cols-3">
          <div className="bg-camp-white p-5">
            <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-camp-charcoal/50 uppercase">
              Session 1
            </p>
            <p className="font-display mt-1 text-lg font-bold text-camp-charcoal">
              {format(new Date(session1.startDate), "d", { locale: fr })} →{" "}
              {format(new Date(session1.endDate), "d MMM yyyy", { locale: fr })}
            </p>
          </div>
          <div className="bg-camp-white p-5">
            <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-camp-charcoal/50 uppercase">
              Session 2
            </p>
            <p className="font-display mt-1 text-lg font-bold text-camp-charcoal">
              {format(new Date(session2.startDate), "d", { locale: fr })} →{" "}
              {format(new Date(session2.endDate), "d MMM yyyy", { locale: fr })}
            </p>
          </div>
          <div className="bg-camp-white p-5">
            <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-camp-charcoal/50 uppercase">
              Investissement
            </p>
            <p className="font-display mt-1 text-lg font-bold text-camp-charcoal">
              {CAMP_PRICE_PER_PERSON.toLocaleString("fr-FR")} €{" "}
              <span className="text-camp-gold">· vol Paris inclus</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <CTAButton asChild>
            <a href="#sessions">Réserver ma place</a>
          </CTAButton>
          <CTAButton asChild variant="secondary">
            <a href="#programme">Voir le programme</a>
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
