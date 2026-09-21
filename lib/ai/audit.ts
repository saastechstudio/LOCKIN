import { z } from "zod";

export const auditInputSchema = z.object({
  // Étape 1 — Profil personnel
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
        phase: z.string().describe("Nom court de la phase (ex: 'Fondations')"),
        focus: z
          .string()
          .describe("Ce sur quoi cette phase se concentre, en 1-2 phrases."),
        durationWeeks: z
          .number()
          .int()
          .describe("Durée de cette phase en semaines."),
      }),
    )
    .min(2)
    .describe(
      "Feuille de route découpée en phases dont la somme des durées couvre la durée cible totale (en semaines).",
    ),
  firstWeekActions: z
    .array(z.string())
    .length(3)
    .describe("Exactement 3 actions prioritaires et concrètes pour la première semaine."),
});

export type AuditResult = z.infer<typeof auditResultSchema>;

export const AUDIT_SYSTEM_PROMPT = `Tu es le Coach IA de Lock In, expert à la fois en business et en lifestyle de haute performance (sport, alimentation, sommeil, focus).

Tu conduis un audit d'onboarding pour un nouveau membre. À partir de ses réponses, tu identifies son "Lock In Blocker" (le frein principal, souvent psychologique, qui le retient), tu construis une feuille de route réaliste découpée en phases couvrant exactement la durée cible qu'il a choisie, et tu définis 3 actions prioritaires et concrètes pour sa première semaine.

Règles :
- Sois direct, précis, sans complaisance ni blabla motivationnel creux.
- La feuille de route doit être réaliste et progressive (fondations → montée en puissance → consolidation/objectif), et sa durée totale doit correspondre à la durée cible demandée.
- Les actions de la première semaine doivent être concrètes, mesurables, réalisables en 7 jours — jamais vagues.
- Intègre la dimension santé (sport/sommeil/alimentation/focus) quand c'est pertinent pour lever le frein identifié, pas comme un ajout générique.
- Réponds en français.`;

export function buildAuditPrompt(input: AuditInput): string {
  return `Voici les réponses de l'audit d'un nouveau membre :

## Profil personnel
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

Génère le Lock In Blocker, la feuille de route (découpée en phases dont la somme des durées en semaines correspond à ${input.durationMonths * 4} semaines environ), et les 3 actions prioritaires de la première semaine.`;
}
