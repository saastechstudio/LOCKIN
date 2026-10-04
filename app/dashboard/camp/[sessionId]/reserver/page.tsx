import { notFound } from "next/navigation";

import { getCampSession, getUserCampRegistration } from "@/lib/actions/camp";
import { BookingFlow } from "@/components/camp/booking-flow";

// Même raison que app/dashboard/camp/page.tsx : dépend de la base et de
// l'utilisateur courant (pré-remplissage d'une éventuelle pré-inscription).
export const dynamic = "force-dynamic";

export default async function CampReservationPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId: slug } = await params;
  const session = await getCampSession(slug);
  if (!session) notFound();

  const existing = await getUserCampRegistration(session.id);

  return (
    <div className="camp-scope -m-4 min-h-[calc(100vh-5rem)] rounded-xl p-6 sm:-m-6 sm:p-8">
      <BookingFlow
        session={session}
        initialFullName={existing?.fullName}
        initialEmail={existing?.email}
      />
    </div>
  );
}
