import { SectionTitle } from "@/components/camp/section-title";
import { SPORT_ACTIVITIES } from "@/lib/camp/data";

/**
 * Liste en colonnes — pas de cartes, pas de pastilles, pas d'icônes
 * circulaires. Fond blanc uniforme, filets fins comme seule séparation
 * entre les colonnes (le choix se fait réellement dans le parcours de
 * réservation, jour par jour — cf. BookingFlow).
 */
export function SectionActivities() {
  return (
    <section id="activites" className="bg-camp-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="05"
          eyebrow="Chaque matin"
          title="Activités sportives quotidiennes"
          description="Une activité au choix, chaque jour du séjour."
          className="mb-12"
        />

        <div className="grid grid-cols-2 border-t border-l border-camp-hairline sm:grid-cols-3 lg:grid-cols-6">
          {SPORT_ACTIVITIES.map((activity, i) => (
            <div
              key={activity.id}
              className="flex flex-col items-center gap-2 border-r border-b border-camp-hairline px-4 py-8 text-center"
            >
              <span className="font-mono text-[11px] font-bold text-camp-gold">0{i + 1}</span>
              <span className="text-2xl">{activity.emoji}</span>
              <span className="font-mono text-xs font-bold tracking-[0.06em] text-camp-charcoal uppercase">
                {activity.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
