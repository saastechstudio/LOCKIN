import { BedDouble, Brain, Dumbbell, LifeBuoy, Target, Wallet, type LucideIcon } from "lucide-react";

/**
 * Les 6 modules du Coach IA (LOCK IN OS), rendus visibles dans l'espace
 * membre. Source de vérité pour les libellés : lib/ai/coach.ts (BASE_PROMPT).
 */
export type LockInModule = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
};

export const LOCK_IN_MODULES: LockInModule[] = [
  {
    id: "discipline",
    name: "Discipline",
    description: "Objectifs clairs, plans d'action simples, priorités du jour.",
    icon: Target,
  },
  {
    id: "soutien",
    name: "Soutien",
    description: "Motivation sans pression, recadrage avec douceur.",
    icon: LifeBuoy,
  },
  {
    id: "forme_physique",
    name: "Forme physique",
    description: "Sport et alimentation adaptés à ton énergie du jour.",
    icon: Dumbbell,
  },
  {
    id: "sante_mentale",
    name: "Santé mentale",
    description: "Concentration, pauses mentales, gestion des émotions.",
    icon: Brain,
  },
  {
    id: "finance",
    name: "Finance",
    description: "Budget, revenus et projets, expliqués simplement.",
    icon: Wallet,
  },
  {
    id: "repos",
    name: "Repos",
    description: "Pauses intelligentes, sommeil régulier, anti-épuisement.",
    icon: BedDouble,
  },
];
