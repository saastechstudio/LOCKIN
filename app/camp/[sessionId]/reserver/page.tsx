import { notFound } from "next/navigation";

import { getCampSession } from "@/lib/actions/camp";
import { BookingFlow } from "@/components/camp/booking-flow";

// Dépend de la base (disponibilité en temps réel) — pas de prérendu
// statique. Accessible sans compte : aucun appel à l'auth ici.
export const dynamic = "force-dynamic";

export default async function CampReservationPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId: slug } = await params;
  const session = await getCampSession(slug);
  if (!session) notFound();

  if (session.remainingSpots <= 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-14 text-center">
        <p className="font-display text-xl text-camp-brown-deep">
          Cette session est complète.
        </p>
        <p className="mt-2 text-sm text-camp-brown-soft">
          Les places restantes se comptent en temps réel : reviens un peu
          plus tard ou choisis l&apos;autre session.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-14">
      <BookingFlow session={session} />
    </div>
  );
}
