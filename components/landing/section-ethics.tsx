import Link from "next/link";

export function SectionEthics() {
  return (
    <section>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-lk-stone-3 uppercase">
            Éthique &amp; respect
          </p>
          <h2 className="mt-8 text-4xl font-semibold tracking-tight text-camp-charcoal sm:text-5xl">
            Charte Lockin
          </h2>
        </div>

        <div className="border-t border-lk-line pt-10 lg:col-span-7 lg:mt-[4.5rem]">
          <p className="text-2xl leading-snug font-medium tracking-tight text-camp-charcoal sm:text-3xl">
            Respect, discipline, entraide, éthique. Aucun manque de respect,
            aucune insulte, aucune toxicité.
          </p>
          <Link
            href="/legal/charte-moderation"
            className="mt-10 inline-block text-sm font-medium text-camp-charcoal underline decoration-camp-hairline underline-offset-8 transition-colors hover:decoration-camp-charcoal"
          >
            Lire la charte complète
          </Link>
        </div>
      </div>
    </section>
  );
}
