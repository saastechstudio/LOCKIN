import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Hero } from "@/components/marketing/hero";
import { PillarsSection } from "@/components/marketing/pillars-section";
import { Pillars } from "@/components/marketing/pillars";
import { MethodologySection } from "@/components/marketing/methodology-section";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { ExitIntentPopup } from "@/components/marketing/exit-intent-popup";
import { StickyCtaBar } from "@/components/marketing/sticky-cta-bar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background bg-noise">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <PillarsSection />
        <Pillars />
        <MethodologySection />
        <Pricing />
        <Faq />
      </main>
      <SiteFooter />
      <StickyCtaBar />
      <ExitIntentPopup />
    </div>
  );
}
