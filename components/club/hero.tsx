"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { FOUNDING_CIRCLE, foundingSeatsLeft } from "@/lib/club/founding";
import { ClubButton } from "./button";
import { APPLY_HREF } from "./nav";
import { PhotoFrame } from "./photo-frame";
import { Reveal } from "./reveal";

const EASE = [0.22, 1, 0.36, 1] as const;
const BADGES = ["Sur candidature", "Entrepreneurs & ambitieux", "Rencontres · Événements · Réseau"];

export function ClubHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Trois profondeurs : le collage respire au défilement.
  const yBack = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.2]);

  const left = foundingSeatsLeft();
  const filled = FOUNDING_CIRCLE.taken / FOUNDING_CIRCLE.total;

  return (
    <section
      ref={ref}
      data-tone="dark"
      aria-labelledby="club-hero-title"
      className="club-grain relative flex min-h-[100svh] items-center overflow-hidden bg-club-night pt-28 pb-16 text-club-ivory lg:pt-32"
    >
      {/* Faisceau de lumière bordeaux, très diffus. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 -z-10 h-[120%] w-[140%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(107,31,43,0.55)_0%,rgba(82,22,32,0.25)_35%,transparent_65%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-club-night" />

      <div className="club-container grid items-center gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
        <motion.div style={{ y: textY, opacity: textOpacity }}>
          <Reveal immediate className="flex flex-wrap gap-2">
            {BADGES.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-club-pierre/30 bg-club-ivory/[0.04] px-3 py-1 text-[12px] leading-5 text-club-pierre backdrop-blur-sm"
              >
                {badge}
              </span>
            ))}
          </Reveal>

          <Reveal immediate delay={0.12} className="mt-8">
            <p className="club-eyebrow text-club-pierre">Lockin Social Club</p>
          </Reveal>

          <Reveal immediate blur delay={0.2} as="h1">
            <span id="club-hero-title" className="club-display club-h1 mt-5 block text-balance">
              Ton environnement façonne ton <em className="text-club-pierre">ambition</em>.
            </span>
          </Reveal>

          <Reveal immediate delay={0.4}>
            <p className="mt-6 max-w-[34rem] text-[17px] text-club-ivory/75">
              Un cercle privé d&apos;entrepreneurs et de personnes ambitieuses. Des rencontres choisies, des
              événements, un réseau qui t&apos;élève. On y entre sur candidature.
            </p>
          </Reveal>

          <Reveal immediate delay={0.52} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ClubButton href={APPLY_HREF} size="lg" arrow>
              Postuler
            </ClubButton>
            <ClubButton href="#club" variant="glass" size="lg">
              Découvrir le club
            </ClubButton>
          </Reveal>

          <Reveal immediate delay={0.66} className="mt-10 max-w-sm">
            <div className="flex items-baseline justify-between text-[12px] tracking-[0.04em] text-club-ivory/70">
              <span className="text-[11px] tracking-[0.26em] text-club-pierre uppercase">Cercle fondateur</span>
              <span>
                <span className="text-club-ivory">{left}</span> places sur {FOUNDING_CIRCLE.total}
              </span>
            </div>
            <div
              role="meter"
              aria-label="Places du cercle fondateur déjà attribuées"
              aria-valuemin={0}
              aria-valuemax={FOUNDING_CIRCLE.total}
              aria-valuenow={FOUNDING_CIRCLE.taken}
              aria-valuetext={`${left} places restantes sur ${FOUNDING_CIRCLE.total}`}
              className="mt-3 h-px w-full bg-club-ivory/15"
            >
              <motion.div
                className="h-px origin-left bg-club-pierre"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: filled }}
                transition={{ duration: reduce ? 0 : 1.8, delay: 0.9, ease: EASE }}
              />
            </div>
          </Reveal>
        </motion.div>

        {/* Collage : trois cadres à des profondeurs différentes. */}
        <div className="relative mx-auto h-[440px] w-full max-w-[520px] sm:h-[540px] lg:h-[620px]">
          <motion.div style={{ y: yBack }} className="absolute top-0 right-0 h-[62%] w-[58%]">
            <Reveal immediate delay={0.3} className="h-full">
              <PhotoFrame
                alt="Un lieu du club"
                placeholder="Lieu réel du club : béton, pierre, lumière du soir."
                captionTop
                className="h-full border border-club-ivory/10"
              />
            </Reveal>
          </motion.div>
          <motion.div style={{ y: yMid }} className="absolute top-[22%] left-0 h-[58%] w-[52%]">
            <Reveal immediate delay={0.45} className="h-full">
              <PhotoFrame
                alt="Des membres en conversation"
                placeholder="Membres réels, échange autour d'une table."
                className="h-full border border-club-ivory/10 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]"
              />
            </Reveal>
          </motion.div>
          <motion.div style={{ y: yFront }} className="absolute right-[8%] bottom-0 h-[34%] w-[40%]">
            <Reveal immediate delay={0.6} className="h-full">
              <PhotoFrame
                alt="Un détail d'événement du club"
                placeholder="Détail d'un événement."
                className="h-full border border-club-ivory/10 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]"
              />
            </Reveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
