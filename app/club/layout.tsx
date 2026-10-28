import type { Metadata } from "next";
import { Fraunces } from "next/font/google";

import { SmoothScroll } from "@/components/club/smooth-scroll";

/** Titres du club : serif légère, italique pour les mots d'accent. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Lockin Social Club — Le cercle",
  description:
    "Un cercle privé d'entrepreneurs et de personnes ambitieuses : rencontres, événements, réseau. Accès sur candidature.",
};

export default function ClubLayout({ children }: LayoutProps<"/club">) {
  return (
    <div className={`${fraunces.variable} club flex-1`}>
      <SmoothScroll />
      {children}
    </div>
  );
}
