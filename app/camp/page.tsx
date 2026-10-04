import Image from "next/image";
import { Check } from "lucide-react";

import { getCampSessions } from "@/lib/actions/camp";
import {
  CAMP_DAY_STRUCTURE,
  CAMP_INCLUDED_ITEMS,
  CAMP_PROGRAM_BLOCKS,
  EXCURSIONS,
  SPORT_ACTIVITIES,
} from "@/lib/camp/data";
import { SectionTitle } from "@/components/camp/section-title";
import { CardSession } from "@/components/camp/card-session";

// Les places restantes dépendent des réservations en base — jamais de
// prérendu statique, et cette page doit rester accessible sans compte.
export const dynamic = "force-dynamic";

export default async function LockInCampScreen() {
  const sessions = await getCampSessions();

  return (
    <div className="mx-auto max-w-3xl space-y-14 px-6 py-14">
      {/* A) Présentation */}
      <div className="space-y-5 text-center">
        <div className="overflow-hidden rounded-2xl border border-camp-border shadow-soft-md">
          <Image
            src="/camp-hero.jpg"
            alt="Lock-In Camp — Édition Phuket"
            width={1024}
            height={1024}
            priority
            className="h-auto w-full"
          />
        </div>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-camp-brown-soft">
          Le Lock-In Camp – Édition Phuket est une immersion de 10 jours
          dédiée à la discipline, au sport, au mindset et au business.
        </p>
      </div>

      {/* B) Sessions */}
      <section className="space-y-4">
        <SectionTitle eyebrow="Sessions" title="Choisis ta session" description="20 places par session." />
        <div className="space-y-3">
          {sessions.map((session) => (
            <CardSession key={session.id} session={session} />
          ))}
        </div>
      </section>

      {/* C) Inclus dans le prix */}
      <section className="space-y-4">
        <SectionTitle eyebrow="2 500 €" title="Inclus dans le prix" />
        <div className="rounded-lg border border-camp-border bg-camp-card p-5">
          <ul className="space-y-2 text-sm text-camp-brown-deep">
            {CAMP_INCLUDED_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-3.5 shrink-0 text-camp-sand" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SPORT_ACTIVITIES.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-camp-border bg-camp-card py-4 text-center"
            >
              <span className="text-2xl">{activity.emoji}</span>
              <span className="text-xs font-medium text-camp-brown-deep">{activity.name}</span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-camp-border bg-camp-card p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-camp-brown-soft">
            2h de programme Lock-In par jour
          </p>
          <ul className="grid grid-cols-2 gap-2 text-sm text-camp-brown-deep">
            {CAMP_PROGRAM_BLOCKS.map((block) => (
              <li key={block} className="flex items-center gap-2">
                <Check className="size-3.5 shrink-0 text-camp-sand" />
                {block}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* D) Excursions disponibles */}
      <section className="space-y-4">
        <SectionTitle eyebrow="2 au choix" title="Excursions disponibles" />
        <div className="grid gap-2 sm:grid-cols-2">
          {EXCURSIONS.map((excursion) => (
            <div
              key={excursion.id}
              className="flex items-center gap-3 rounded-lg border border-camp-border bg-camp-card px-4 py-3"
            >
              <span className="text-xl">{excursion.emoji}</span>
              <span className="text-sm font-medium text-camp-brown-deep">{excursion.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* E) Programme journalier type */}
      <section className="space-y-4">
        <SectionTitle eyebrow="Chaque jour" title="Programme journalier type" />
        <div className="rounded-lg border border-camp-border bg-camp-card p-5">
          <div className="space-y-4">
            {CAMP_DAY_STRUCTURE.map((block) => (
              <div key={block.period} className="flex gap-3">
                <span className="w-24 shrink-0 text-xs font-semibold text-camp-sand">
                  {block.period}
                </span>
                <div>
                  <p className="text-sm font-medium text-camp-brown-deep">{block.title}</p>
                  <p className="text-xs text-camp-brown-soft">{block.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
