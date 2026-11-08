import { test } from "node:test";
import assert from "node:assert/strict";

import { disciplineDrop, pactSignals, type PartnerSnapshot } from "./pact";

const now = new Date(2026, 10, 8, 12, 0, 0);
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000);
const partner = (patch: Partial<PartnerSnapshot> = {}): PartnerSnapshot => ({
  name: "Léa Martin", scoreWeek: [60, 60, 60, 60, 60, 60, 60], idleDays: 0, goalsBehind: [], brokenStreaks: [], ...patch,
});

test("baisse de discipline mesurée entre début et fin de semaine", () => {
  assert.equal(disciplineDrop([80, 78, 76, 70, 60, 55, 50]), 23);
  assert.equal(disciplineDrop([50, 50, 60]), 0);
  assert.ok(disciplineDrop([40, 40, 40, 50, 70, 80, 90]) < 0);
});

test("le partenaire attend une mise à jour", () => {
  const signals = pactSignals(partner(), { lastFromMe: hoursAgo(70), lastFromPartner: hoursAgo(40) }, now);
  assert.equal(signals[0].id, "waiting-me");
  assert.match(signals[0].message, /Léa attend/);
});

test("pas de rappel si l'échange est récent", () => {
  assert.equal(pactSignals(partner(), { lastFromMe: hoursAgo(5), lastFromPartner: hoursAgo(10) }, now).length, 0);
});

test("décrochage, retard et série cassée, du plus grave au plus doux", () => {
  const signals = pactSignals(
    partner({ idleDays: 8, scoreWeek: [80, 78, 76, 60, 50, 45, 40], goalsBehind: ["Courir un semi"], brokenStreaks: ["Lire 20 pages"] }),
    { lastFromMe: hoursAgo(5), lastFromPartner: hoursAgo(6) },
    now,
  );
  assert.equal(signals[0].tone, "critical");
  const ids = signals.map((s) => s.id);
  assert.ok(ids.includes("drop"));
  assert.ok(ids.includes("behind-Courir un semi"));
  assert.ok(ids.includes("streak-Lire 20 pages"));
});

test("début de pacte : on invite à écrire le premier objectif", () => {
  assert.equal(pactSignals(partner(), { lastFromMe: null, lastFromPartner: null }, now)[0].id, "start");
});
