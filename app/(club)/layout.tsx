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
  title: "Lockin Social Club — Le réseau privé des membres du Lockin Trip",
  description:
    "Le réseau privé des membres du Lockin Trip : rencontres, événements, réseau. Première année offerte, puis 49 € par an.",
};

export default function ClubLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={`${fraunces.variable} club flex-1`}>
      <SmoothScroll />
      {children}
    </div>
  );
}
