"use client";

import { useState } from "react";

import { PRICE_LABEL } from "@/lib/club/membership";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

const FAQ = [
  {
    q: "Qui peut entrer dans le club\u00a0?",
    a: "Uniquement les personnes qui ont réservé un Lockin Trip. Il n'y a pas d'inscription libre : l'entrée se fait avec un numéro de membre.",
  },
  {
    q: "Quand puis-je entrer\u00a0?",
    a: "Au début de ton séjour. Avant cette date, ton numéro est refusé et le site t'indique quand revenir.",
  },
  {
    q: "Où trouver mon numéro de membre\u00a0?",
    a: "Il t'est envoyé par email quand ta place est confirmée. Il a la forme LT-XXXXXX et ne fonctionne que pour un seul compte.",
  },
  {
    q: "Combien ça coûte\u00a0?",
    a: `La première année est offerte, à compter du jour où tu entres dans le club. Ensuite, l'adhésion est de ${PRICE_LABEL} TTC par an.`,
  },
  {
    q: "Dois-je être membre du club pour réserver le Lockin Trip\u00a0?",
    a: "Non. Un simple compte suffit pour pré-inscrire ta place. Le club vient après le trip, pas avant.",
  },
  {
    q: "Et si je ne fais pas le Lockin Trip\u00a0?",
    a: "Tu ne peux pas entrer dans le club : il est réservé aux personnes du Lockin Trip.",
  },
];

export function ClubFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="club-section club-grain bg-club-sand">
      <div className="club-container grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <Reveal>
            <p className="club-eyebrow text-club-bordeaux">Questions</p>
          </Reveal>
          <Reveal blur delay={0.1} as="h2">
            <span className="club-display club-h2 mt-6 block text-balance">
              Ce qu&apos;on nous <em className="text-club-bordeaux">demande</em>.
            </span>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <ul className="border-t border-club-ink/70">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={item.q} className="border-b border-club-concrete/50">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex min-h-14 w-full items-center justify-between gap-6 py-5 text-left"
                    >
                      <span className="club-display text-[1.25rem] leading-snug">{item.q}</span>
                      <span
                        aria-hidden
                        className={cn(
                          "shrink-0 text-2xl leading-none text-club-bordeaux transition-transform duration-500 ease-club",
                          isOpen && "rotate-45",
                        )}
                      >
                        +
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-${i}`}
                    role="region"
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-500 ease-club motion-reduce:transition-none",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-6 text-[15px] text-club-ink-soft">{item.a}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
