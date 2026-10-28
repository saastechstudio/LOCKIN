import { ClubBenefits } from "@/components/club/benefits";
import { ClubFaq } from "@/components/club/faq";
import { ClubFinalCta } from "@/components/club/final-cta";
import { ClubFit } from "@/components/club/fit";
import { ClubHero } from "@/components/club/hero";
import { ClubJourney } from "@/components/club/journey";
import { ClubManifesto } from "@/components/club/manifesto";
import { ClubMemberCard } from "@/components/club/member-card";
import { ClubMembership } from "@/components/club/membership";
import { ClubNav } from "@/components/club/nav";
import { ClubProblem } from "@/components/club/problem";

export default function Home() {
  return (
    <>
      <ClubNav />
      <main>
        <ClubHero />
        <ClubProblem />
        <ClubManifesto />
        <ClubBenefits />
        <ClubJourney />
        <ClubFit />
        <ClubMemberCard />
        <ClubMembership />
        <ClubFaq />
        <ClubFinalCta />
      </main>
    </>
  );
}
