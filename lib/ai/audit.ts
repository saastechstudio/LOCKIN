import { z } from "zod";

import {
  METHODOLOGY_NAME,
  ROADMAP_STAGE_NAMES,
  formatMethodologyForPrompt,
} from "@/lib/methodology";

export const auditInputSchema = z.object({
  // Étape 1, profil personnel
  motivations: z.string().min(1).max(2000),
  psychologicalBlockers: z.string().min(1).max(2000),
  currentRoutine: z.string().min(1).max(2000),
  disciplineLevel: z.coerce.number().int().min(1).max(10),
  // Étape 2, profil professionnel
  sector: z.string().min(1).max(200),
  revenueLevel: z.string().min(1).max(200),
  businessGoals: z.string().min(1).max(2000),
  // Étape 3, projet et horizon temporel
  majorGoal: z.string().min(1).max(2000),
  durationMonths: z.coerce.number().int().min(3).max(36),
});

export type AuditInput = z.infer<typeof auditInputSchema>;

export const auditResultSchema = z.object({
  lockInBlocker: z
    .string()
    .describe(
      "Le frein principal, psychologique ou comportemental, qui empêche ce membre d'avancer. Formulé en 2 à 3 phrases directes.",
    ),
  roadmap: z
    .array(
      z.object({
        phase: z
          .string()
          .describe(
            `Nom de l'étape. Doit être EXACTEMENT, dans l'ordre, l'une de : ${ROADMAP_STAGE_NAMES.join(", ")}.`,
          ),
        objective: z
          .string()
          .describe(
            "Objectif concret et mesurable de cette étape, en une phrase : ce que le membre doit avoir accompli à la fin, pas une intention vague.",
          ),
        focus: z
          .string()
          .describe(
            "Pourquoi cette étape compte pour CE membre précisément, en 1 à 2 phrases : le lien avec son frein Lock In et ses motivations profondes. Jamais générique.",
          ),
        keyActions: z
          .array(z.string())
          .min(3)
          .max(4)
          .describe(
            "3 à 4 actions concrètes, personnalisées et réalisables à mener pendant cette étape pour atteindre l'objectif. Jamais vagues ni génériques — chacune doit être une action que le membre peut cocher.",
          ),
        milestone: z
          .string()
          .describe(
            "Le signal concret et vérifiable qui prouve que cette étape est terminée et que le membre peut passer à la suivante (un résultat observable, pas un ressenti).",
          ),
        durationWeeks: z
          .number()
          .int()
          .describe("Durée de cette étape en semaines."),
      }),
    )
    .length(3)
    .describe(
      `Les 3 étapes qui suivent le Diagnostic dans ${METHODOLOGY_NAME} (${ROADMAP_STAGE_NAMES.join(", puis ")}), dans cet ordre, dont la somme des durées couvre la durée cible totale en semaines. Chaque étape doit être un mini plan d'action structuré (objectif, actions, jalon), pas un simple paragraphe d'intention.`,
    ),
  firstWeekActions: z
    .array(z.string())
    .length(3)
    .describe("Exactement 3 actions prioritaires et concrètes pour la première semaine."),
});

export type AuditResult = z.infer<typeof auditResultSchema>;

export const AUDIT_SYSTEM_PROMPT = `Tu es LOCK IN, le Coach IA du club d'entrepreneurs d'excellence Lock In. Tu es un mentor et un meilleur ami, conçu pour accompagner chaque membre dans tous les domaines de sa vie : discipline, soutien, forme physique, santé mentale, finance, repos. Tu es expert à la fois en business et en mode de vie de haute performance : sport, alimentation, sommeil, concentration.

Tu conduis un audit d'entrée pour un nouveau membre, la première étape de ${METHODOLOGY_NAME}, le cadre d'exécution universel du club, appliqué à chaque membre quel que soit son profil ou son projet :

${formatMethodologyForPrompt()}

Ce membre vient de terminer le Diagnostic, c'est à dire l'audit. Ta tâche : identifier son Frein Lock In, le frein principal, souvent psychologique, qui le retient, puis construire les 3 étapes suivantes de la méthode (Fondations, puis Exécution, puis Ancrage) comme sa feuille de route personnalisée, et définir 3 actions prioritaires et concrètes pour sa première semaine.

Règles :
Sois direct, précis, sans complaisance ni discours motivationnel creux.
Les 3 étapes de la feuille de route sont fixes dans leur nom et leur ordre : Fondations, Exécution, Ancrage. Seuls le contenu (ce sur quoi porte l'étape) et la répartition des durées s'adaptent à ce membre précis, dans le respect des proportions indicatives de la méthode. La somme des durées doit correspondre à la durée cible demandée.
Chaque étape est un mini plan d'action structuré, pas un paragraphe d'intention : un objectif mesurable, 3 à 4 actions concrètes que le membre peut cocher une par une, et un jalon vérifiable qui marque la fin de l'étape. Deux membres avec des profils différents ne doivent jamais recevoir les mêmes actions ou le même jalon.
Les actions (de chaque étape et de la première semaine) doivent être concrètes, mesurables, réalisables dans le temps imparti. Jamais vagues, jamais de généralités du type "travailler sa discipline" sans dire comment.
Intègre la dimension santé (sport, sommeil, alimentation, concentration) quand c'est pertinent pour lever le frein identifié, pas comme un ajout générique.
Ancre le Frein Lock In, les objectifs d'étape et les actions dans les motivations profondes exprimées par le membre. Le programme doit répondre à son pourquoi, pas seulement à son quoi.
Réponds en français.`;

export function buildAuditPrompt(input: AuditInput): string {
  return `Voici les réponses de l'audit d'un nouveau membre :

Profil personnel
Motivations profondes : ${input.motivations}
Freins psychologiques exprimés : ${input.psychologicalBlockers}
Routine actuelle : ${input.currentRoutine}
Niveau de discipline auto évalué, de 1 à 10 : ${input.disciplineLevel}

Profil professionnel
Secteur d'activité : ${input.sector}
Niveau de revenus actuel : ${input.revenueLevel}
Objectifs professionnels : ${input.businessGoals}

Projet et horizon temporel
Objectif majeur : ${input.majorGoal}
Durée cible : ${input.durationMonths} mois

Génère le Frein Lock In, la feuille de route (les 3 étapes Fondations, puis Exécution, puis Ancrage, dont la somme des durées en semaines correspond à environ ${input.durationMonths * 4} semaines), et les 3 actions prioritaires de la première semaine.`;
}
