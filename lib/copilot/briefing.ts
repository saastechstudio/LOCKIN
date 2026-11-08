import "server-only";

import { z } from "zod";

import { COMPONENT_LABELS, COMPONENT_WITH_ARTICLE } from "@/lib/life-os/score";
import { PACE_LABELS } from "@/lib/life-os/goals";
import { formatValue } from "@/lib/life-os/habits";
import type { LifeOsSnapshot } from "@/lib/life-os/snapshot";
import type { EveningBriefing, MemoryKind, MorningBriefing } from "@/lib/db/schema";

/**
 * Briefings du copilote. Le contexte est l'instantané Life OS (score,
 * sphères, objectifs, habitudes, focus) plus la mémoire du membre ; la
 * réponse est structurée. Sans IA disponible, une version calculée prend le
 * relais : le cockpit n'est jamais vide.
 */

const MEMORY_KINDS = ["objectif", "projet", "habitude", "preference", "difficulte"] as const;

const memorySchema = z
  .array(
    z.object({
      kind: z.enum(MEMORY_KINDS),
      content: z
        .string()
        .max(200)
        .describe("Un fait durable sur le membre, en une phrase courte à la troisième personne."),
    }),
  )
  .max(3)
  .describe(
    "0 à 3 faits NOUVEAUX et durables appris dans le contexte (objectif, projet, habitude, préférence, difficulté récurrente). Vide si rien de neuf : ne répète jamais la mémoire existante.",
  );

export const morningSchema = z.object({
  headline: z.string().max(90).describe("Titre du jour, 4 à 9 mots, direct, au tutoiement."),
  summary: z.string().max(400).describe("Résumé de la journée qui commence, 2 phrases maximum."),
  priorities: z
    .array(
      z.object({
        title: z.string().max(90).describe("Action concrète, vérifiable aujourd'hui."),
        why: z.string().max(140).describe("Pourquoi elle compte, lié à un objectif ou une sphère."),
      }),
    )
    .min(1)
    .max(3),
  habits: z.array(z.string().max(80)).max(4).describe("Habitudes à réaliser aujourd'hui."),
  goalMoves: z
    .array(z.object({ goal: z.string().max(90), nextStep: z.string().max(120) }))
    .max(3)
    .describe("Pour les objectifs actifs : le prochain pas à faire aujourd'hui."),
  alerts: z
    .array(z.object({ level: z.enum(["info", "warning", "critical"]), message: z.string().max(160) }))
    .max(3)
    .describe("Alertes importantes : objectif à l'arrêt, sphère qui s'éteint, déséquilibre."),
  memories: memorySchema,
});

export const eveningSchema = z.object({
  headline: z.string().max(90),
  summary: z.string().max(400).describe("Bilan de la journée, 2 phrases maximum, honnête."),
  disciplineScore: z.number().int().min(0).max(100).describe("Évaluation de la discipline du jour sur 100."),
  disciplineComment: z.string().max(200),
  wins: z.array(z.string().max(120)).max(4),
  misses: z.array(z.string().max(120)).max(3),
  tomorrow: z.array(z.string().max(120)).min(1).max(3).describe("Suggestions concrètes pour demain."),
  memories: memorySchema,
});

export const COPILOT_SYSTEM = `Tu es le copilote LOCKIN, le copilote de vie du membre. Tu n'es ni un coach motivationnel ni un réseau social : tu es son partenaire intelligent, qui connaît sa vie (ses sphères, ses objectifs, ses habitudes, son score) et l'aide à rester LOCKED IN.

Règles :
- Tu tutoies, tu es direct, précis, chaleureux sans flatterie.
- Tu t'appuies UNIQUEMENT sur les données fournies. N'invente jamais un objectif, un chiffre, une habitude ou un événement.
- Chaque priorité est une action concrète faisable aujourd'hui, reliée à un objectif ou une sphère du membre.
- Si les données sont maigres, dis-le simplement et propose la première action qui créera de la donnée (créer un objectif, noter une habitude, lancer une session de focus).
- Garde l'équilibre de vie en tête : tu es le gardien de sa SphereLife.
- Réponds en français.`;

const pct = (n: number | null) => (n === null ? "n/a" : `${n}/100`);

export function buildContext(s: LifeOsSnapshot, memories: { kind: string; content: string }[]): string {
  const sphereName = new Map(s.spheres.map((sp) => [sp.id, sp.name]));
  const lines: string[] = [];
  lines.push(`Membre : ${s.firstName}. Date : ${s.today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}.`);
  lines.push(
    `LockIn Score du jour : ${s.score.score}/100 (${s.tier.label}), hier : ${s.yesterdayScore ?? "n/a"}. ` +
      Object.entries(s.score.components)
        .map(([k, v]) => `${COMPONENT_LABELS[k as keyof typeof COMPONENT_LABELS]} ${pct(v)}`)
        .join(", ") +
      `. Composante la plus faible : ${COMPONENT_LABELS[s.weakest]}.`,
  );
  lines.push(
    `Focus : ${s.focus.todayMinutes} min aujourd'hui, ${s.focus.weekMinutes} min sur 7 jours (${s.focus.previousWeekMinutes} la semaine d'avant).`,
  );
  if (s.todayFocus) {
    lines.push(
      `Priorité du jour : « ${s.todayFocus.task} » — ${s.todayFocus.done ? "faite" : "pas encore faite"}${s.todayFocus.rating ? `, discipline notée ${s.todayFocus.rating}/10` : ""}.`,
    );
  }
  lines.push(`Sphères de vie (équilibre ${pct(s.balance)}) :`);
  for (const sp of s.spheres) {
    lines.push(
      `- ${sp.name} : progression ${sp.stats.progress} %, énergie ${sp.stats.energy}, ${sp.stats.effortShare} % de l'effort sur 30 jours${sp.stats.idleDays === null ? ", aucune activité encore" : `, inactive depuis ${sp.stats.idleDays} j`}.`,
    );
  }
  if (s.goals.length === 0) lines.push("Objectifs : aucun.");
  for (const g of s.goals.slice(0, 8)) {
    lines.push(
      `- Objectif « ${g.title} »${g.sphereId ? ` (sphère ${sphereName.get(g.sphereId)})` : ""} : ${g.progress} %, ${PACE_LABELS[g.pace].toLowerCase()}${g.daysLeft !== null ? `, ${g.daysLeft} j restants` : ""}${g.nextTask ? `, prochaine tâche « ${g.nextTask} »` : ", aucune tâche ouverte"}${g.vision ? `. Vision : ${g.vision}` : ""}.`,
    );
  }
  if (s.habits.length === 0) lines.push("Habitudes : aucune.");
  for (const h of s.habits) {
    lines.push(
      `- Habitude « ${h.label} » : cible ${formatValue(h.target, h.unit)}, aujourd'hui ${formatValue(h.todayValue, h.unit)}${h.doneToday ? " (tenue)" : ""}, série ${h.streak} j, réussite 14 j ${h.success14} %.`,
    );
  }
  const upcoming = s.calendar.filter((c) => !c.done).slice(0, 6);
  if (upcoming.length > 0) {
    lines.push("Agenda 7 jours : " + upcoming.map((c) => `${c.title} (${c.date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })})`).join(" ; ") + ".");
  }
  const signals = [...s.sphereSignals.map((x) => x.message), ...s.insights.map((i) => `${i.title} — ${i.detail}`)];
  if (signals.length > 0) lines.push("Signaux détectés : " + signals.slice(0, 8).join(" | "));
  if (memories.length > 0) {
    lines.push("Mémoire du copilote (ce que tu sais déjà) :");
    for (const m of memories.slice(0, 25)) lines.push(`- [${m.kind}] ${m.content}`);
  }
  return lines.join("\n");
}

/** Briefing du matin calculé sans IA, à partir des mêmes données. */
export function fallbackMorning(s: LifeOsSnapshot): MorningBriefing {
  const openGoals = s.goals.filter((g) => g.progress < 100);
  const priorities: MorningBriefing["priorities"] = [];
  if (s.todayFocus && !s.todayFocus.done) {
    priorities.push({ title: s.todayFocus.task, why: "Ta priorité du jour : c'est elle qui fait la journée." });
  }
  for (const g of openGoals) {
    if (priorities.length >= 3) break;
    if (g.nextTask) priorities.push({ title: g.nextTask, why: `Fait avancer « ${g.title} » (${g.progress} %).` });
  }
  if (priorities.length === 0) {
    priorities.push(
      s.goals.length === 0
        ? { title: "Verrouille ton premier objectif", why: "Sans cap, le copilote ne peut pas t'emmener quelque part." }
        : { title: "Définis la prochaine tâche de ton objectif principal", why: "Un objectif sans prochaine action n'avance pas." },
    );
  }
  const alerts: MorningBriefing["alerts"] = [
    ...s.sphereSignals
      .filter((x) => x.tone === "critical" || x.tone === "warning")
      .map((x) => ({ level: x.tone === "critical" ? ("critical" as const) : ("warning" as const), message: x.message })),
    ...s.insights
      .filter((i) => i.tone === "critical")
      .map((i) => ({ level: "critical" as const, message: `${i.title}. ${i.detail}` })),
  ].slice(0, 3);
  return {
    headline: s.score.score >= 70 ? `${s.firstName}, garde l'élan` : `${s.firstName}, on verrouille la journée`,
    summary: `LockIn Score ${s.score.score}/100 (${s.tier.label.toLowerCase()}). Ton levier aujourd'hui : ${COMPONENT_WITH_ARTICLE[s.weakest]}.`,
    priorities: priorities.slice(0, 3),
    habits: s.habits.filter((h) => !h.doneToday).map((h) => `${h.label} — ${formatValue(h.target, h.unit)}`).slice(0, 4),
    goalMoves: openGoals
      .filter((g) => g.nextTask)
      .slice(0, 3)
      .map((g) => ({ goal: g.title, nextStep: g.nextTask! })),
    alerts,
  };
}

/** Bilan du soir calculé sans IA. */
export function fallbackEvening(s: LifeOsSnapshot): EveningBriefing {
  const wins: string[] = [];
  const misses: string[] = [];
  const done = s.habits.filter((h) => h.doneToday);
  if (done.length > 0) wins.push(`${done.length} habitude${done.length > 1 ? "s" : ""} tenue${done.length > 1 ? "s" : ""} : ${done.map((h) => h.label).join(", ")}.`);
  if (s.focus.todayMinutes > 0) wins.push(`${s.focus.todayMinutes} minutes de travail profond.`);
  if (s.todayFocus?.done) wins.push("Priorité du jour bouclée.");
  const missed = s.habits.filter((h) => !h.doneToday);
  if (missed.length > 0) misses.push(`Habitudes non tenues : ${missed.map((h) => h.label).join(", ")}.`);
  if (s.todayFocus && !s.todayFocus.done) misses.push(`Priorité restée ouverte : « ${s.todayFocus.task} ».`);
  if (s.focus.todayMinutes === 0) misses.push("Aucune session de focus aujourd'hui.");
  const tomorrow = [
    ...s.goals.filter((g) => g.nextTask && g.progress < 100).slice(0, 2).map((g) => `Avancer « ${g.title} » : ${g.nextTask}.`),
    ...(s.focus.todayMinutes < 60 ? ["Bloque une session de focus de 50 minutes avant midi."] : []),
  ];
  return {
    headline: s.score.score >= 70 ? "Journée tenue" : "Journée à reprendre demain",
    summary: `LockIn Score ${s.score.score}/100${s.yesterdayScore !== null ? ` (${s.score.score - s.yesterdayScore >= 0 ? "+" : ""}${s.score.score - s.yesterdayScore} par rapport à hier)` : ""}.`,
    disciplineScore: s.score.components.discipline,
    disciplineComment: s.todayFocus?.rating
      ? `Tu as noté ta discipline ${s.todayFocus.rating}/10 aujourd'hui.`
      : "Note ta discipline du jour : c'est elle qui nourrit ton score.",
    wins: wins.length > 0 ? wins : ["Tu as ouvert ton cockpit : la journée peut encore compter."],
    misses,
    tomorrow: tomorrow.length > 0 ? tomorrow : ["Définis trois priorités pour demain dès ce soir."],
  };
}

export type ExtractedMemory = { kind: MemoryKind; content: string };
