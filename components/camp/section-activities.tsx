import { SectionTitle } from "@/components/camp/section-title";
import { SPORT_ACTIVITIES } from "@/lib/camp/data";

/**
 * Vitrine des 6 activités sportives (le choix se fait réellement dans le
 * parcours de réservation, jour par jour — cf. BookingFlow). Ici, une
 * grille de blocs à angles droits, pas des pastilles ni des icônes
 * circulaires.
 */
export function SectionActivities() {
  return (
    <section
      id="activites"
      className="border-t-2 border-camp-brown bg-camp-cream px-6 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="05"
          eyebrow="Chaque matin"
          title="Activités sportives quotidiennes"
          description="Une activité au choix, chaque jour du séjour."
          className="mb-12"
        />

        <div className="grid grid-cols-2 gap-px border-2 border-camp-brown bg-camp-brown sm:grid-cols-3 lg:grid-cols-6">
          {SPORT_ACTIVITIES.map((activity, i) => (
            <div
              key={activity.id}
              className="flex flex-col items-center gap-2 bg-camp-cream p-6 text-center"
            >
              <span className="font-mono text-[11px] font-bold text-camp-gold-ink">
                0{i + 1}
              </span>
              <span className="text-3xl">{activity.emoji}</span>
              <span className="font-mono text-xs font-bold tracking-[0.06em] text-camp-brown uppercase">
                {activity.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
