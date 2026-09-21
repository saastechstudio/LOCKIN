import { FaqList, SUBSCRIPTION_FAQ } from "@/components/marketing/faq-list";

export function Faq() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl text-foreground sm:text-4xl">
          Questions fréquentes
        </h2>
        <p className="mt-4 text-muted-foreground">
          Tout ce qu&apos;il faut savoir avant de rejoindre le club.
        </p>
        <FaqList items={SUBSCRIPTION_FAQ} />
      </div>
    </section>
  );
}
