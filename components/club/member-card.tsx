"use client";

import { useId, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

import { LOCKIN_TRIP_HREF } from "@/lib/club/membership";
import { ClubButton } from "./button";
import { ClubMonogram } from "./logo";
import { Reveal } from "./reveal";

/** Carte de membre : le prénom s'écrit en direct, inclinaison 3D et reflet qui suivent la souris. */
export function ClubMemberCard() {
  const inputId = useId();
  const reduce = useReducedMotion();
  const [name, setName] = useState("");

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], reduce ? [0, 0] : [9, -9]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], reduce ? [0, 0] : [-12, 12]), { stiffness: 120, damping: 18 });
  const gx = useTransform(mx, [0, 1], [0, 100]);
  const gy = useTransform(my, [0, 1], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(247,244,239,0.2), transparent 55%)`;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  const shown = name.trim();

  return (
    <section data-tone="dark" className="club-section club-grain bg-club-night text-club-ivory">
      <div className="club-container grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Reveal>
            <p className="club-eyebrow text-club-pierre">Ta carte</p>
          </Reveal>
          <Reveal blur delay={0.1} as="h2">
            <span className="club-display club-h2 mt-6 block text-balance">
              Ton nom, <em className="text-club-pierre">dans le cercle</em>.
            </span>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-club-ivory/70">
              Écris ton prénom pour voir ta carte de membre. Ton numéro personnel t&apos;est remis par email
              quand ta place au Lockin Trip est confirmée.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-8 max-w-sm">
            <label htmlFor={inputId} className="text-[11px] tracking-[0.26em] text-club-pierre uppercase">
              Ton prénom
            </label>
            <input
              id={inputId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoComplete="given-name"
              placeholder="Camille"
              className="mt-3 h-14 w-full rounded-[14px] border border-club-ivory/25 bg-club-ivory/[0.05] px-5 text-[17px] text-club-ivory placeholder:text-club-ivory/35"
            />
            <ClubButton href={LOCKIN_TRIP_HREF} size="lg" arrow className="mt-5 w-full sm:w-auto">
              Réserver ma place au Lockin Trip
            </ClubButton>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="[perspective:1200px]">
          <motion.div
            animate={reduce ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto w-full max-w-[460px]"
          >
            <motion.div
              onPointerMove={onMove}
              onPointerLeave={onLeave}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              role="img"
              aria-label={shown ? `Carte de membre de ${shown}` : "Carte de membre du Lockin Social Club"}
              className="club-grain relative aspect-[1.586/1] w-full overflow-hidden rounded-[22px] border border-club-pierre/25 bg-[linear-gradient(135deg,#7e2b38_0%,#6b1f2b_45%,#521620_100%)] p-6 shadow-[0_50px_90px_-45px_rgba(0,0,0,0.9)] sm:p-8"
            >
              <motion.div aria-hidden style={{ background: glare }} className="pointer-events-none absolute inset-0" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 text-club-pierre">
                    <ClubMonogram className="size-8" />
                    <span className="flex flex-col leading-none">
                      <span className="text-[12px] font-medium tracking-[0.34em]">LOCKIN</span>
                      <span className="mt-1.5 text-[8px] tracking-[0.5em] opacity-70">SOCIAL CLUB</span>
                    </span>
                  </div>
                  <span className="text-[10px] tracking-[0.24em] text-club-pierre/80 uppercase">Membre</span>
                </div>

                <div>
                  <p
                    aria-hidden
                    className={`club-display truncate text-[clamp(1.9rem,4.4vw,2.7rem)] ${shown ? "text-club-ivory" : "text-club-ivory/30"}`}
                  >
                    {shown || "Ton prénom"}
                  </p>
                  <div className="mt-4 flex items-end justify-between text-[11px] tracking-[0.2em] text-club-pierre/85 uppercase">
                    <span>N° LT-••••••</span>
                    <span>1re année offerte</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
