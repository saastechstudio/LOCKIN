import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Hero } from "@/components/marketing/hero";
import { Pillars } from "@/components/marketing/pillars";
import { Pricing } from "@/components/marketing/pricing";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background bg-noise">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Pillars />
        <Pricing />
      </main>
      <SiteFooter />
    </div>
  );
}
