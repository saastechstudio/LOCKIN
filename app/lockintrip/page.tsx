import { getCampSessions } from "@/lib/actions/camp";
import { Hero } from "@/components/camp/hero";
import { SectionIncluded } from "@/components/camp/section-included";
import { SectionProgram } from "@/components/camp/section-program";
import { SectionProgramLockIn } from "@/components/camp/section-program-lockin";
import { SectionDailyStructure } from "@/components/camp/section-daily-structure";
import { SectionActivities } from "@/components/camp/section-activities";
import { SectionExcursionFun } from "@/components/camp/section-excursion-fun";
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
      <SectionProgramLockIn />
      <SectionDailyStructure />
      <SectionActivities />
      <SectionExcursionFun />
      <SectionWhy />
      <SectionSessions sessions={sessions} />
      <Footer />
    </>
  );
}
