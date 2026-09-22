import { z } from "zod";

import {
  METHODOLOGY_NAME,
  ROADMAP_STAGE_NAMES,
  formatMethodologyForPrompt,
} from "@/lib/methodology";

export const auditInputSchema = z.object({
  // Étape 1 — Profil personnel
  motivations: z.string().min(1).max(2000),
  psychologicalBlockers: z.string().min(1).max(2000),
  currentRoutine: z.string().min(1).max(2000),
  disciplineLevel: z.coerce.number().int().min(1).max(10),
  // Étape 2 — Profil professionnel
  sector: z.string().min(1).max(200),
  revenueLevel: z.string().min(1).max(200),
  businessGoals: z.string().min(1).max(2000),
  // Étape 3 — Projet & horizon temporel
  majorGoal: z.string().min(1).max(2000),
  durationMonths: z.coerce.number().int().min(3).max(36),
});

export type AuditInput = z.infer<typeof auditInputSchema>;

export const auditResultSchema = z.object({
  lockInBlocker: z
    .string()
    .describe(
      "Le frein principal (psychologique ou comportemental) qui empêche ce membre d'avancer, formulé en 2-3 phrases directes.",
    ),
  roadmap: z
    .array(
      z.object({
        phase: z
          .string()
          .describe(
            `Nom de l'étape — doit être EXACTEMENT, dans l'ordre, l'une de : ${ROADMAP_STAGE_NAMES.join(", ")}.`,
          ),
        focus: z
          .string()
          .describe(
            "Ce sur quoi cette étape se concentre pour CE membre précisément, en 1-2 phrases — personnalisé à son profil, son frein et ses motivations, jamais générique.",
          ),
        durationWeeks: z
          .number()
          .int()
          .describe("Durée de cette étape en semaines."),
      }),
    )
    .length(3)
    .describe(
      `Les 3 étapes post-Diagnostic de ${METHODOLOGY_NAME} (${ROADMAP_STAGE_NAMES.join(" → ")}), dans cet ordre, dont la somme des durées couvre la durée cible totale (en semaines).`,
    ),
  firstWeekActions: z
    .array(z.string())
    .length(3)
    .describe("Exactement 3 actions prioritaires et concrètes pour la première semaine."),
});

export type AuditResult = z.infer<typeof auditResultSchema>;

export const AUDIT_SYSTEM_PROMPT = `Tu es le Coach IA de Lock In, expert à la fois en business et en lifestyle de haute performance (sport, alimentation, sommeil, focus).

Tu conduis un audit d'onboarding pour un nouveau membre, la première étape de ${METHODOLOGY_NAME} — le cadre d'exécution universel du club, appliqué à CHAQUE membre quel que soit son profil ou son projet :

${formatMethodologyForPrompt()}

Ce membre vient de terminer le Diagnostic (l'audit). Ta tâche : identifier son "Lock In Blocker" (le frein principal, souvent psychologique, qui le retient), puis construire les 3 étapes suivantes de la méthode (Fondations → Exécution → Ancrage) comme sa feuille de route personnalisée, et définir 3 actions prioritaires et concrètes pour sa première semaine.

Règles :
- Sois direct, précis, sans complaisance ni blabla motivationnel creux.
- Les 3 étapes de la feuille de route sont FIXES dans leur nom et leur ordre (Fondations, Exécution, Ancrage) — c'est le contenu (le "focus") et la répartition des durées qui s'adaptent à ce membre précis, dans le respect des proportions indicatives de la méthode. La somme des durées doit correspondre à la durée cible demandée.
- Les actions de la première semaine doivent être concrètes, mesurables, réalisables en 7 jours — jamais vagues.
- Intègre la dimension santé (sport/sommeil/alimentation/focus) quand c'est pertinent pour lever le frein identifié, pas comme un ajout générique.
- Ancre le Lock In Blocker et les actions dans les motivations profondes exprimées par le membre — le programme doit répondre à son "pourquoi", pas seulement à son "quoi".
- Réponds en français.`;

export function buildAuditPrompt(input: AuditInput): string {
  return `Voici les réponses de l'audit d'un nouveau membre :

## Profil personnel
- Motivations profondes : ${input.motivations}
- Freins psychologiques exprimés : ${input.psychologicalBlockers}
- Routine actuelle : ${input.currentRoutine}
- Niveau de discipline auto-évalué (1-10) : ${input.disciplineLevel}

## Profil professionnel
- Secteur d'activité : ${input.sector}
- Niveau de revenus/CA actuel : ${input.revenueLevel}
- Objectifs business : ${input.businessGoals}

## Projet & horizon temporel
- Objectif majeur : ${input.majorGoal}
- Durée cible : ${input.durationMonths} mois

Génère le Lock In Blocker, la feuille de route (les 3 étapes Fondations → Exécution → Ancrage, dont la somme des durées en semaines correspond à ${input.durationMonths * 4} semaines environ), et les 3 actions prioritaires de la première semaine.`;
}
