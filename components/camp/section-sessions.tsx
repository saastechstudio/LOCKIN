import { SectionTitle } from "@/components/camp/section-title";
import { CardSession } from "@/components/camp/card-session";
import type { CampSessionWithAvailability } from "@/lib/actions/camp";

type SectionSessionsProps = {
  sessions: CampSessionWithAvailability[];
};

export function SectionSessions({ sessions }: SectionSessionsProps) {
  return (
    <section id="sessions" className="bg-camp-white px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="08"
          eyebrow="20 places par session"
          title="Choisis ta session"
          className="mb-6"
        />
        <p className="mb-12 max-w-xl border-l-2 border-camp-gold pl-4 text-sm leading-relaxed text-camp-charcoal/70">
          Les Lock-In Camp sont réservés aux membres du Lockin Social Club.
          L&apos;inscription au club est gratuite : si tu n&apos;es pas encore
          membre, on te la propose au moment de réserver.
        </p>

        <div className="space-y-6">
          {sessions.map((session, i) => (
            <CardSession key={session.id} session={session} index={`S${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
