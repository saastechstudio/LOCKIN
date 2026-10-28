"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

type Token = { w: string; em?: boolean };

const TEXT: Token[] = [
  ..."Ton environnement façonne ton".split(" ").map((w) => ({ w })),
  { w: "ambition.", em: true },
  ..."Les gens avec qui tu passes ton temps décident de ce que tu oses.".split(" ").map((w) => ({ w })),
  ..."Le Lockin Trip t'a mis dans une pièce avec des personnes qui".split(" ").map((w) => ({ w })),
  { w: "avancent.", em: true },
  ..."Le club garde cette pièce ouverte, toute l'année.".split(" ").map((w) => ({ w })),
];

function Word({ token, progress, range }: { token: Token; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className={token.em ? "italic text-club-pierre" : undefined}>
      {token.w}{" "}
    </motion.span>
  );
}

/** Manifeste plein écran : section haute et collante, les mots s'allument au défilement. */
export function ClubManifesto() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section
      id="manifeste"
      ref={ref}
      data-tone="dark"
      aria-label="Manifeste"
      className={reduce ? "club-grain bg-club-bordeaux-deep py-28 text-club-ivory" : "club-grain relative h-[260vh] bg-club-bordeaux-deep text-club-ivory"}
    >
      <div className={reduce ? "club-container" : "club-container sticky top-0 flex h-screen items-center"}>
        <p className="club-display max-w-5xl text-[clamp(1.9rem,4.6vw,4rem)] leading-[1.12] text-balance">
          {reduce
            ? TEXT.map((t, i) => (
                <span key={i} className={t.em ? "italic text-club-pierre" : undefined}>
                  {t.w}{" "}
                </span>
              ))
            : TEXT.map((t, i) => {
                const start = (i / TEXT.length) * 0.82;
                const end = start + 0.08;
                return <Word key={i} token={t} progress={scrollYProgress} range={[start, end]} />;
              })}
        </p>
      </div>
    </section>
  );
}
