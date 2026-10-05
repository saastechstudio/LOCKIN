import type { Metadata } from "next";

import { LandingLayout } from "@/components/landing/landing-layout";
import { Hero } from "@/components/landing/hero";
import { SectionWhatIsLockin } from "@/components/landing/section-what-is-lockin";
import { SectionInside } from "@/components/landing/section-inside";
import { SectionMotivation } from "@/components/landing/section-motivation";
import { SectionEthics } from "@/components/landing/section-ethics";

export const metadata: Metadata = {
  title: "Lockin Social Club — Mouvement mondial de discipline",
  description: "Discipline, objectifs, entraide, réseau. Un club mondial, gratuit.",
};

export default function Home() {
  return (
    <LandingLayout>
      <Hero />
      <SectionWhatIsLockin />
      <SectionInside />
      <SectionMotivation />
      <SectionEthics />
    </LandingLayout>
  );
}
