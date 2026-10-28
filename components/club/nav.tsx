"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { JOIN_HREF } from "@/lib/club/membership";
import { ClubButton } from "./button";
import { ClubLogo } from "./logo";

const EASE = [0.22, 1, 0.36, 1] as const;

const LINKS = [
  { href: "#club", label: "Le club" },
  { href: "#manifeste", label: "Manifeste" },
  { href: "#lieux", label: "Lieux" },
  { href: "#adhesion", label: "Adhésion" },
  { href: "#faq", label: "FAQ" },
];

/** Barre flottante arrondie : beige translucide et flou, plus dense une fois la page défilée. */
export function ClubNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Navigation principale"
        className={cn(
          "mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 rounded-[20px] border px-4 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-700 ease-club sm:px-6",
          scrolled || open
            ? "border-club-concrete/30 bg-club-ivory/85 shadow-[0_18px_50px_-30px_rgba(29,29,29,0.35)]"
            : "border-club-pierre/25 bg-club-pierre/20",
        )}
      >
        <Link
          href="/club"
          aria-label="Lockin Social Club, accueil"
          className={cn(
            "transition-colors duration-700 ease-club",
            scrolled || open ? "text-club-bordeaux" : "text-club-ivory",
          )}
        >
          <ClubLogo onLight={scrolled || open} />
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={cn(
                  "text-[13px] tracking-[0.04em] underline-offset-[6px] transition-colors duration-500 ease-club hover:underline",
                  scrolled ? "text-club-ink-soft hover:text-club-ink" : "text-club-ivory/80 hover:text-club-ivory",
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ClubButton href={JOIN_HREF} size="sm" arrow className="hidden sm:inline-flex">
            Rejoindre
          </ClubButton>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="club-menu"
            className={cn(
              "flex size-11 items-center justify-center rounded-[12px] transition-colors duration-500 ease-club lg:hidden",
              scrolled || open ? "text-club-ink hover:bg-club-pierre-soft" : "text-club-ivory hover:bg-club-ivory/10",
            )}
          >
            <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
            <span aria-hidden className="relative block h-3 w-5">
              <span
                className={cn(
                  "absolute left-0 h-px w-5 bg-current transition-transform duration-500 ease-club",
                  open ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 h-px w-5 bg-current transition-transform duration-500 ease-club",
                  open ? "top-1.5 -rotate-45" : "top-3",
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="club-menu"
            initial={reduce ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mx-auto mt-2 max-w-[1280px] rounded-[20px] border border-club-concrete/30 bg-club-ivory/95 p-6 backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col">
              {LINKS.map((link) => (
                <li key={link.href} className="border-b border-club-concrete/25 last:border-none">
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="club-display block py-4 text-[1.75rem] text-club-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <ClubButton href={JOIN_HREF} size="lg" arrow className="mt-6 w-full">
              Rejoindre
            </ClubButton>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
