import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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

  return (
    <div>
      <div className="border-b-2 border-camp-brown px-6 py-5">
        <Link
          href="/camp"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.1em] text-camp-brown uppercase hover:text-camp-gold-ink"
        >
          <ArrowLeft className="size-3.5" /> lock-in camp
        </Link>
      </div>

      {session.remainingSpots <= 0 ? (
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <p className="font-display text-xl font-bold text-camp-brown uppercase">
            Cette session est complète
          </p>
          <p className="mt-2 text-sm text-camp-brown/60">
            Les places restantes se comptent en temps réel : reviens un peu
            plus tard ou choisis l&apos;autre session.
          </p>
        </div>
      ) : (
        <BookingFlow session={session} />
      )}
    </div>
  );
}
