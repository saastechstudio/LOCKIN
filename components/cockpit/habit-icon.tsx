import { Apple, BookOpen, Dumbbell, Laptop, Moon, Wind, type LucideIcon } from "lucide-react";

import { HABIT_CATEGORIES } from "@/lib/life-os/habits";
import type { HabitCategory } from "@/lib/db/schema";

const ICONS: Record<string, LucideIcon> = { Moon, Dumbbell, BookOpen, Wind, Laptop, Apple };

const TONES = {
  blue: { text: "text-lk-blue-soft", bg: "bg-lk-blue/25", hex: "#10b981" },
  coral: { text: "text-lk-coral", bg: "bg-lk-coral/15", hex: "#34d399" },
  gold: { text: "text-lk-gold", bg: "bg-lk-gold/15", hex: "#d1fae5" },
} as const;

export function habitTone(category: string) {
  const meta = HABIT_CATEGORIES[category as HabitCategory] ?? HABIT_CATEGORIES.travail;
  return { ...TONES[meta.tone], label: meta.label, Icon: ICONS[meta.icon] };
}
