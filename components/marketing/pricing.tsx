import { PricingCards } from "@/components/marketing/pricing-cards";

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl text-foreground sm:text-4xl">
          Un tarif, un engagement clair
        </h2>
        <p className="mt-4 text-muted-foreground">
          Accédez à l&apos;intégralité du club, sans surprise.
        </p>
      </div>

      <PricingCards />
    </section>
  );
}
