import "server-only";

import type { AuditRoadmapPhase } from "@/lib/db/schema";

export const isResendConfigured = Boolean(process.env.RESEND_API_KEY);

const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL ?? "Lock In <notifications@lockin.club>";

type Pillar = {
  name: string;
  message: string;
};

// Ordre alphabétique officiel des 6 piliers du Club.
const PILLARS: Pillar[] = [
  {
    name: "Ambition",
    message:
      "Vise plus haut aujourd'hui. Une décision ambitieuse prise maintenant vaut dix décisions timides remises à demain.",
  },
  {
    name: "Discipline",
    message:
      "La discipline, c'est faire ce qui doit être fait même sans motivation. Exécute ta priorité du jour, sans négociation.",
  },
  {
    name: "Éducation financière",
    message:
      "Chaque jour est une occasion d'apprendre à mieux gérer, investir et faire fructifier ce que tu construis.",
  },
  {
    name: "Éthique",
    message:
      "Construis un succès dont tu seras fier dans dix ans. Les raccourcis coûtent toujours plus cher qu'ils ne rapportent.",
  },
  {
    name: "Humilité",
    message:
      "Reste étudiant de ton métier. Écoute, remets-toi en question, et progresse un peu plus vite que la veille.",
  },
  {
    name: "Vie saine",
    message:
      "Ton corps est l'outil qui porte tous tes objectifs. Sommeil, sport, alimentation : protège-le aujourd'hui.",
  },
];

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((current - start) / 86_400_000);
}

export type DailyMotivationContent = {
  title: string;
  body: string;
};

/**
 * Deterministic daily message — rotates through the 6 pillars by day of
 * year, personalized with the member's first name and (when available)
 * the main goal captured during their onboarding audit. No AI call: it
 * has to be reliable and free to run for every user, every day.
 */
export function buildDailyMotivationContent(params: {
  firstName: string;
  majorGoal?: string | null;
  roadmap?: AuditRoadmapPhase[] | null;
  date?: Date;
}): DailyMotivationContent {
  const { firstName, majorGoal, date = new Date() } = params;
  const pillar = PILLARS[dayOfYear(date) % PILLARS.length];

  const goalLine = majorGoal
    ? ` Garde le cap vers ton objectif : ${majorGoal}.`
    : "";

  return {
    title: `${pillar.name} — ton rendez-vous du jour`,
    body: `${firstName}, ${pillar.message}${goalLine}`,
  };
}

/**
 * Sends the daily motivation email via Resend's HTTP API directly (no SDK
 * dependency) — a no-op returning `false` until RESEND_API_KEY is set, same
 * graceful-degradation pattern as the other optional integrations
 * (`isWhopConfigured`, `isResendConfigured`).
 */
export async function sendDailyMotivationEmail(params: {
  to: string;
  title: string;
  body: string;
}): Promise<boolean> {
  if (!isResendConfigured) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: params.to,
      subject: `Lock In — ${params.title}`,
      html: `<p style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#111827">${params.body}</p>`,
    }),
  });

  return response.ok;
}
