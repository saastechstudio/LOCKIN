/**
 * Les 6 modules du Coach IA (LOCK IN OS), rendus visibles dans l'espace
 * membre. Source de vérité pour les libellés : lib/ai/coach.ts (BASE_PROMPT).
 */
export type LockInModule = {
  id: string;
  name: string;
  description: string;
  emoji: string;
};

export const LOCK_IN_MODULES: LockInModule[] = [
  {
    id: "discipline",
    name: "Discipline",
    description: "Objectifs clairs, plans d'action simples, priorités du jour.",
    emoji: "🎯",
  },
  {
    id: "soutien",
    name: "Soutien",
    description: "Motivation sans pression, recadrage avec douceur.",
    emoji: "🤝",
  },
  {
    id: "forme_physique",
    name: "Forme physique",
    description: "Sport et alimentation adaptés à ton énergie du jour.",
    emoji: "💪",
  },
  {
    id: "sante_mentale",
    name: "Santé mentale",
    description: "Concentration, pauses mentales, gestion des émotions.",
    emoji: "🧠",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Budget, revenus et projets, expliqués simplement.",
    emoji: "💶",
  },
  {
    id: "repos",
    name: "Repos",
    description: "Pauses intelligentes, sommeil régulier, anti-épuisement.",
    emoji: "🌙",
  },
];
