import { test } from "node:test";
import assert from "node:assert/strict";

import { expectedProgress, paceOf, progressFromWork, daysLeft, deadlineOf } from "./goals";

const DAY = 86_400_000;

test("progression : jalon = 3 tâches, repli sur la saisie manuelle", () => {
  assert.equal(progressFromWork({ tasksTotal: 0, tasksDone: 0, milestonesTotal: 0, milestonesDone: 0 }, 40), 40);
  assert.equal(progressFromWork({ tasksTotal: 3, tasksDone: 3, milestonesTotal: 1, milestonesDone: 0 }, 0), 50);
  assert.equal(progressFromWork({ tasksTotal: 2, tasksDone: 2, milestonesTotal: 1, milestonesDone: 1 }, 0), 100);
});

test("rythme attendu et retard", () => {
  const created = new Date(2026, 9, 1);
  const today = new Date(created.getTime() + 45 * DAY);
  assert.equal(expectedProgress(created, 90, today), 50);
  assert.equal(paceOf(20, 50), "behind");
  assert.equal(paceOf(50, 50), "on_track");
  assert.equal(paceOf(70, 50), "ahead");
  assert.equal(paceOf(70, null), "no_deadline");
  assert.equal(daysLeft(deadlineOf(created, 90), today), 45);
});
