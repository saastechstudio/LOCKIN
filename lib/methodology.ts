/**
 * La Méthode Lock In. Source de vérité unique pour le cadre d'exécution
 * universel du club. Utilisée par le prompt de l'audit, le prompt du
 * Coach IA et la page d'accueil publique, pour que les 4 étapes soient
 * décrites de façon identique partout. Le cadre ne change jamais, quel
 * que soit le profil ou le projet du membre : seul le contenu de chaque
 * étape (ce qu'elle couvre, sa durée) s'adapte grâce à l'IA.
 */

export type MethodologyStage = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Part de la durée totale de la feuille de route que couvre cette étape. */
  shareOfDuration: string;
};

export const METHODOLOGY_NAME = "La Méthode Lock In";

export const METHODOLOGY_STAGES: MethodologyStage[] = [
  {
    id: "diagnostic",
    name: "Diagnostic",
    tagline: "Comprendre avant d'agir",
    description:
      "L'audit d'entrée : clarifier le \"pourquoi\" (motivations profondes), identifier le Frein Lock In, c'est à dire le frein principal, souvent psychologique, puis définir l'objectif majeur avec un horizon réaliste.",
    shareOfDuration: "Une fois, en semaine 1",
  },
  {
    id: "fondations",
    name: "Fondations",
    tagline: "Installer ce qui rend l'exécution possible",
    description:
      "Mise en place des habitudes incontournables : routine, sommeil, sport, alimentation, rituel de discipline quotidien. Sans fondations solides, l'exécution s'effondre à la première pression.",
    shareOfDuration: "Environ 15 à 25 % de la durée cible",
  },
  {
    id: "execution",
    name: "Exécution",
    tagline: "Le cœur du programme",
    description:
      "Avancer concrètement vers l'objectif avec des objectifs mesurables, un planning hebdomadaire et des bilans quotidiens. C'est la phase la plus longue, celle où le frein identifié en Diagnostic est activement neutralisé.",
    shareOfDuration: "Environ 55 à 70 % de la durée cible",
  },
  {
    id: "ancrage",
    name: "Ancrage",
    tagline: "Consolider, puis relancer un cycle",
    description:
      "Transformer les progrès en habitudes permanentes, faire le bilan du cycle, puis préparer le prochain audit avec un nouvel objectif et un nouveau frein à lever.",
    shareOfDuration: "Environ 10 à 15 % de la durée cible",
  },
];

/** Les 3 étapes qu'une feuille de route générée par l'IA doit couvrir, dans l'ordre. Le Diagnostic correspond à l'audit lui-même, déjà terminé au moment où la feuille de route existe. */
export const ROADMAP_STAGE_NAMES = METHODOLOGY_STAGES.slice(1).map((s) => s.name);

export function formatMethodologyForPrompt(): string {
  return METHODOLOGY_STAGES.map(
    (stage, i) =>
      `${i + 1}. ${stage.name} (${stage.shareOfDuration}). ${stage.description}`,
  ).join("\n");
}
