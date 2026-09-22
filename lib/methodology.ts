/**
 * La Méthode Lock In — single source of truth for the club's universal
 * execution framework. Referenced by the audit AI prompt, the Coach IA
 * system prompt, and the marketing landing page, so the same 4 stages are
 * described identically everywhere. Profile- and project-agnostic by
 * design: the stages never change, only their content (focus, duration
 * split) adapts to each member via the AI.
 */

export type MethodologyStage = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Share of the roadmap's total duration this stage typically covers. */
  shareOfDuration: string;
};

export const METHODOLOGY_NAME = "La Méthode Lock In";

export const METHODOLOGY_STAGES: MethodologyStage[] = [
  {
    id: "diagnostic",
    name: "Diagnostic",
    tagline: "Comprendre avant d'agir",
    description:
      "L'audit d'entrée : clarifier le \"pourquoi\" (motivations profondes), identifier le Lock In Blocker — le frein principal, souvent psychologique — et définir l'objectif majeur avec un horizon réaliste.",
    shareOfDuration: "Semaine 1, une fois",
  },
  {
    id: "fondations",
    name: "Fondations",
    tagline: "Installer ce qui rend l'exécution possible",
    description:
      "Mise en place des systèmes non-négociables : routine, sommeil, sport, alimentation, rituel de discipline quotidien. Sans fondations solides, l'exécution s'effondre à la première pression.",
    shareOfDuration: "≈ 15–25 % de la durée cible",
  },
  {
    id: "execution",
    name: "Exécution",
    tagline: "Le cœur du programme",
    description:
      "Avancer concrètement vers l'objectif via des OKRs mesurables, un planning hebdomadaire et des check-ins quotidiens. C'est la phase la plus longue — celle où le frein identifié en Diagnostic est activement neutralisé.",
    shareOfDuration: "≈ 55–70 % de la durée cible",
  },
  {
    id: "ancrage",
    name: "Ancrage",
    tagline: "Consolider, puis relancer un cycle",
    description:
      "Transformer les progrès en habitudes permanentes, faire le bilan du cycle, et préparer le prochain audit — un nouvel objectif, un nouveau Lock In Blocker à lever.",
    shareOfDuration: "≈ 10–15 % de la durée cible",
  },
];

/** The 3 stages an AI-generated roadmap must cover, in order — Diagnostic is the audit itself, already completed by the time the roadmap exists. */
export const ROADMAP_STAGE_NAMES = METHODOLOGY_STAGES.slice(1).map((s) => s.name);

export function formatMethodologyForPrompt(): string {
  return METHODOLOGY_STAGES.map(
    (stage, i) =>
      `${i + 1}. ${stage.name} (${stage.shareOfDuration}) — ${stage.description}`,
  ).join("\n");
}
