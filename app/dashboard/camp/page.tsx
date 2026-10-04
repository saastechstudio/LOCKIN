import { Plane } from "lucide-react";

import { getCampSessions } from "@/lib/actions/camp";
import { CAMP_EDITION } from "@/lib/camp/data";
import { CardSession } from "@/components/camp/card-session";
import { SectionTitle } from "@/components/camp/section-title";

// Les places restantes dépendent des réservations en base — jamais de
// prérendu statique (et la base n'existe pas forcément au moment du build).
export const dynamic = "force-dynamic";

export default async function CampPage() {
  const sessions = await getCampSessions();

  return (
    <div className="camp-scope -m-4 min-h-[calc(100vh-5rem)] rounded-xl p-6 sm:-m-6 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-camp-brown text-camp-cream">
            <Plane className="size-5" />
          </div>
          <SectionTitle eyebrow="Lock-In Camp" title={CAMP_EDITION} />
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <CardSession key={session.id} session={session} />
          ))}
        </div>
      </div>
    </div>
  );
}
