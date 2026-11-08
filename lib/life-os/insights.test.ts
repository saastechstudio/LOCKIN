import { test } from "node:test";
import assert from "node:assert/strict";

import { focusInsight, goalInsights, habitInsights, rankInsights, scoreInsight } from "./insights";

const DAY = 86_400_000;
const today = new Date(2026, 10, 20);
const d = (offset: number) => new Date(today.getTime() - offset * DAY);

test("habitude en baisse sous la cible = avertissement", () => {
  const logs = [
    ...[8, 9, 10, 11, 12, 13].map((o) => ({ date: d(o), value: 8 })),
    ...[0, 1, 2, 3].map((o) => ({ date: d(o), value: 6 })),
  ];
  const insights = habitInsights([{ id: 1, label: "Sommeil", target: 7.5, unit: "h", logs }], today);
  const down = insights.find((i) => i.id === "habit-down-1");
  assert.equal(down?.tone, "warning");
});

test("objectif à l'arrêt, en retard et sans prochaine action", () => {
  const insights = goalInsights(
    [{ id: 3, title: "Lancer le site", progress: 10, createdAt: d(60), horizonDays: 90, lastActivityAt: d(12), openTasks: 0 }],
    today,
  );
  const ids = insights.map((i) => i.id);
  assert.ok(ids.includes("goal-idle-3"));
  assert.ok(ids.includes("goal-behind-3"));
  assert.ok(ids.includes("goal-nonext-3"));
  assert.equal(rankInsights(insights)[0].tone, "critical");
});

test("objectif terminé : aucun insight", () => {
  const insights = goalInsights(
    [{ id: 4, title: "Fini", progress: 100, createdAt: d(60), horizonDays: 30, lastActivityAt: null, openTasks: 0 }],
    today,
  );
  assert.equal(insights.length, 0);
});

test("focus et score", () => {
  assert.equal(focusInsight(0, 0), null);
  assert.equal(focusInsight(100, 300)?.tone, "warning");
  assert.equal(focusInsight(400, 200)?.tone, "positive");
  assert.equal(scoreInsight(70, 60, "coherence").tone, "positive");
  assert.equal(scoreInsight(50, 60, "balance").tone, "warning");
});
