import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getOrCreateDbUser } from "@/lib/auth";
import { getCampSession } from "@/lib/actions/camp";
import { BookingFlow } from "@/components/camp/booking-flow";

// Dépend de la base (disponibilité en temps réel) — pas de prérendu
// statique. Un compte suffit (proxy.ts) : le club, lui, vient après le trip.
export const dynamic = "force-dynamic";

export default async function CampReservationPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId: slug } = await params;
  const user = await getOrCreateDbUser();
  const session = await getCampSession(slug);
  if (!session) notFound();

  return (
    <div>
      <div className="border-b border-lk-line px-6 py-5">
        <Link
          href="/lockintrip"
          className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] text-camp-charcoal uppercase hover:text-camp-gold"
        >
          <ArrowLeft className="size-3.5" /> lockin trip
        </Link>
      </div>

      {session.remainingSpots <= 0 ? (
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <p className="font-display text-xl text-camp-charcoal">
            Cette session est complète
          </p>
          <p className="mt-2 text-sm text-lk-stone-3">
            Les places restantes se comptent en temps réel : reviens un peu
            plus tard ou choisis l&apos;autre session.
          </p>
        </div>
      ) : (
        <BookingFlow session={session} initialFullName={user.name ?? ""} email={user.email} />
      )}
    </div>
  );
}
