import type { HabitCategory } from "@/lib/db/schema";

/**
 * Habitudes Life OS : six domaines, une cible quotidienne chiffrée par
 * habitude. Une journée est « tenue » quand la valeur notée atteint la cible.
 * Module pur, testé dans habits.test.ts.
 */

export type HabitCategoryMeta = {
  label: string;
  /** Nom d'icône lucide, résolu côté interface. */
  icon: "Moon" | "Dumbbell" | "BookOpen" | "Wind" | "Laptop" | "Apple";
  /** Couleur d'accent de la palette Lockin. */
  tone: "blue" | "coral" | "gold";
};

export const HABIT_CATEGORIES: Record<HabitCategory, HabitCategoryMeta> = {
  sommeil: { label: "Sommeil", icon: "Moon", tone: "blue" },
  sport: { label: "Sport", icon: "Dumbbell", tone: "coral" },
  lecture: { label: "Lecture", icon: "BookOpen", tone: "gold" },
  meditation: { label: "Méditation", icon: "Wind", tone: "blue" },
  travail: { label: "Travail profond", icon: "Laptop", tone: "gold" },
  nutrition: { label: "Nutrition", icon: "Apple", tone: "coral" },
};

export type HabitPreset = {
  category: HabitCategory;
  label: string;
  target: number;
  unit: string;
  /** Pas d'incrément des boutons rapides. */
  step: number;
};

/** Habitudes prêtes à l'emploi : un geste pour commencer, rien à remplir. */
export const HABIT_PRESETS: HabitPreset[] = [
  { category: "sommeil", label: "Dormir 7 h 30", target: 7.5, unit: "h", step: 0.5 },
  { category: "sport", label: "Bouger 30 minutes", target: 30, unit: "min", step: 10 },
  { category: "lecture", label: "Lire 20 pages", target: 20, unit: "pages", step: 5 },
  { category: "meditation", label: "Méditer 10 minutes", target: 10, unit: "min", step: 5 },
  { category: "travail", label: "3 h de travail profond", target: 3, unit: "h", step: 0.5 },
  { category: "nutrition", label: "5 portions de fruits et légumes", target: 5, unit: "portions", step: 1 },
];

export function stepFor(unit: string, target: number): number {
  const preset = HABIT_PRESETS.find((p) => p.unit === unit);
  if (preset) return preset.step;
  return target >= 20 ? 5 : 1;
}

export type DatedValue = { date: Date; value: number };

const DAY_MS = 86_400_000;

function dayKey(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function isMet(value: number, target: number): boolean {
  return value >= target;
}

/**
 * Série en cours : jours consécutifs tenus jusqu'à aujourd'hui. Une journée
 * en cours pas encore tenue ne casse pas la série (on compte alors depuis hier).
 */
export function currentStreak(logs: DatedValue[], target: number, today: Date): number {
  const met = new Set(logs.filter((l) => isMet(l.value, target)).map((l) => dayKey(l.date)));
  let cursor = dayKey(today);
  if (!met.has(cursor)) cursor -= DAY_MS;
  let streak = 0;
  while (met.has(cursor)) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

/** Moyenne des valeurs notées sur [from, to] (jours non notés exclus), null si aucune. */
export function averageBetween(logs: DatedValue[], from: Date, to: Date): number | null {
  const start = dayKey(from);
  const end = dayKey(to);
  const values = logs
    .filter((l) => dayKey(l.date) >= start && dayKey(l.date) <= end)
    .map((l) => l.value);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Taux de réussite (0–100) sur les `days` derniers jours, jours non notés comptés comme manqués. */
export function successRate(logs: DatedValue[], target: number, today: Date, days: number): number {
  const end = dayKey(today);
  const start = end - (days - 1) * DAY_MS;
  const met = logs.filter(
    (l) => dayKey(l.date) >= start && dayKey(l.date) <= end && isMet(l.value, target),
  ).length;
  return Math.round((met / days) * 100);
}

/** Valeurs des `days` derniers jours, du plus ancien au plus récent (null = non noté). */
export function lastDays(logs: DatedValue[], today: Date, days: number): (number | null)[] {
  const byDay = new Map(logs.map((l) => [dayKey(l.date), l.value]));
  const end = dayKey(today);
  return Array.from({ length: days }, (_, i) => byDay.get(end - (days - 1 - i) * DAY_MS) ?? null);
}

export function formatValue(value: number, unit: string): string {
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
  return `${rounded} ${unit}`;
}
