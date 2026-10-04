import { getCampSessions } from "@/lib/actions/camp";
import { Hero } from "@/components/camp/hero";
import { SectionIncluded } from "@/components/camp/section-included";
import { SectionProgram } from "@/components/camp/section-program";
import { SectionWhy } from "@/components/camp/section-why";
import { SectionSessions } from "@/components/camp/section-sessions";
import { Footer } from "@/components/camp/footer";

// Les places restantes dépendent des réservations en base — jamais de
// prérendu statique, et cette page doit rester accessible sans compte.
export const dynamic = "force-dynamic";

export default async function LockInCampLanding() {
  const sessions = await getCampSessions();

  return (
    <>
      <Hero />
      <SectionIncluded />
      <SectionProgram />
      <SectionWhy />
      <SectionSessions sessions={sessions} />
      <Footer />
    </>
  );
}
