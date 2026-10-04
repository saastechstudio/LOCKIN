import { SectionTitle } from "@/components/camp/section-title";
import { CardSession } from "@/components/camp/card-session";
import type { CampSessionWithAvailability } from "@/lib/actions/camp";

type SectionSessionsProps = {
  sessions: CampSessionWithAvailability[];
};

export function SectionSessions({ sessions }: SectionSessionsProps) {
  return (
    <section id="sessions" className="border-t-2 border-camp-gold bg-camp-charcoal px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="04"
          eyebrow="20 places par session"
          title="Choisis ta session"
          tone="dark"
          className="mb-12"
        />

        <div className="space-y-6">
          {sessions.map((session, i) => (
            <CardSession key={session.id} session={session} index={`S${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
