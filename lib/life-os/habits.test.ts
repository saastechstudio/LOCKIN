import { test } from "node:test";
import assert from "node:assert/strict";

import { currentStreak, lastDays, successRate, averageBetween } from "./habits";

const DAY = 86_400_000;
const today = new Date(2026, 10, 10);
const d = (offset: number) => new Date(today.getTime() - offset * DAY);

test("série : une journée en cours non tenue ne casse pas la série", () => {
  const logs = [d(1), d(2), d(3)].map((date) => ({ date, value: 8 }));
  assert.equal(currentStreak(logs, 7.5, today), 3);
  assert.equal(currentStreak([...logs, { date: today, value: 8 }], 7.5, today), 4);
});

test("série : un jour manqué la coupe", () => {
  const logs = [d(0), d(2)].map((date) => ({ date, value: 30 }));
  assert.equal(currentStreak(logs, 30, today), 1);
});

test("taux de réussite et derniers jours", () => {
  const logs = [{ date: d(0), value: 10 }, { date: d(1), value: 2 }, { date: d(3), value: 12 }];
  assert.equal(successRate(logs, 10, today, 4), 50);
  assert.deepEqual(lastDays(logs, today, 4), [12, null, 2, 10]);
});

test("moyenne bornée", () => {
  const logs = [{ date: d(0), value: 6 }, { date: d(1), value: 8 }, { date: d(10), value: 2 }];
  assert.equal(averageBetween(logs, d(6), today), 7);
  assert.equal(averageBetween(logs, d(20), d(15)), null);
});
