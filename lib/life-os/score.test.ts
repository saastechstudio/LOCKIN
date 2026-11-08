import { test } from "node:test";
import assert from "node:assert/strict";

import {
  computeDailyScores,
  focusScore,
  scoreTier,
  weakestComponent,
  weightedScore,
  type DayActivity,
} from "./score";

const DAY = 86_400_000;
const base = new Date(2026, 10, 1);

function day(i: number, patch: Partial<DayActivity> = {}): DayActivity {
  return {
    date: new Date(base.getTime() + i * DAY),
    disciplineRating: null,
    habitsDone: 0,
    habitsTotal: 0,
    focusMinutes: 0,
    goalTasksCompleted: 0,
    milestonesCompleted: 0,
    priorityDone: false,
    otherActivity: false,
    ...patch,
  };
}

test("une semaine vide donne 0", () => {
  const scores = computeDailyScores(Array.from({ length: 7 }, (_, i) => day(i)));
  assert.equal(scores.at(-1)?.score, 0);
  assert.equal(scores.at(-1)?.components.balance, null);
});

test("une semaine parfaite donne 100", () => {
  const perfect = Array.from({ length: 7 }, (_, i) =>
    day(i, {
      disciplineRating: 10,
      habitsDone: 4,
      habitsTotal: 4,
      focusMinutes: 200,
      goalTasksCompleted: 2,
      milestonesCompleted: 1,
      priorityDone: true,
    }),
  );
  const [last] = computeDailyScores(perfect, 6, 100);
  assert.equal(last.score, 100);
});

test("la régularité compte les jours actifs sur 7 jours glissants", () => {
  const days = Array.from({ length: 7 }, (_, i) => day(i, { otherActivity: i % 2 === 0 }));
  const [last] = computeDailyScores(days, 6);
  assert.equal(last.components.regularity, Math.round((4 / 7) * 100));
});

test("la discipline moyenne les notes disponibles", () => {
  const days = [day(0, { disciplineRating: 6 }), day(1), day(2, { disciplineRating: 8 })];
  const [last] = computeDailyScores(days, 2);
  assert.equal(last.components.discipline, 70);
});

test("sans équilibre mesurable, son poids est réparti", () => {
  const unbalanced = weightedScore({ discipline: 80, regularity: 80, coherence: 80, progress: 80, balance: 0 });
  const unknown = weightedScore({ discipline: 80, regularity: 80, coherence: 80, progress: 80, balance: null });
  assert.equal(unknown, 80);
  assert.ok(unbalanced < unknown);
});

test("cohérence : habitudes et productivité, ou productivité seule", () => {
  const [withHabits] = computeDailyScores([day(0, { habitsDone: 1, habitsTotal: 2, focusMinutes: 180 })]);
  assert.equal(withHabits.components.coherence, Math.round((50 + 70) / 2));
  const [noHabits] = computeDailyScores([day(0, { focusMinutes: 180 })]);
  assert.equal(noHabits.components.coherence, 70);
});

test("focus score plafonné à 100", () => {
  assert.equal(focusScore(90), 50);
  assert.equal(focusScore(400), 100);
  assert.equal(focusScore(0), 0);
});

test("paliers et composante la plus faible", () => {
  assert.equal(scoreTier(90).label, "Locked In");
  assert.equal(scoreTier(10).label, "À relancer");
  assert.equal(
    weakestComponent({ discipline: 50, regularity: 20, coherence: 40, progress: 90, balance: null }),
    "regularity",
  );
});
