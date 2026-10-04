import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Hero } from "@/components/marketing/hero";
import { ModulesShowcase } from "@/components/marketing/modules-showcase";
import { HomeModuleLockInCamp } from "@/components/marketing/home-module-lock-in-camp";
import { JoinCta } from "@/components/marketing/join-cta";
import { ExitIntentPopup } from "@/components/marketing/exit-intent-popup";
import { StickyCtaBar } from "@/components/marketing/sticky-cta-bar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ModulesShowcase />
        <HomeModuleLockInCamp />
        <JoinCta />
      </main>
      <SiteFooter />
      <StickyCtaBar />
      <ExitIntentPopup />
    </div>
  );
}
