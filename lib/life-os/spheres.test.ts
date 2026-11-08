import { test } from "node:test";
import assert from "node:assert/strict";

import { balanceOf, energyOf, sphereSignals, sphereStats, type SphereInput } from "./spheres";

const DAY = 86_400_000;
const today = new Date(2026, 10, 20);
const ago = (n: number) => new Date(today.getTime() - n * DAY);

const sphere = (id: number, patch: Partial<SphereInput> = {}): SphereInput => ({
  id,
  name: `S${id}`,
  goalProgress: [],
  habitSuccess: [],
  lastActivityAt: null,
  effortMinutes: 0,
  ...patch,
});

test("énergie : décroît de 6 par jour d'inactivité, plancher 8", () => {
  assert.deepEqual(energyOf(today, today), { energy: 100, idleDays: 0 });
  assert.equal(energyOf(ago(5), today).energy, 70);
  assert.equal(energyOf(ago(40), today).energy, 8);
  assert.equal(energyOf(null, today).idleDays, null);
});

test("stats : progression, niveau, part d'effort", () => {
  const [a, b] = sphereStats(
    [
      sphere(1, { goalProgress: [80, 60], lastActivityAt: today, effortMinutes: 300 }),
      sphere(2, { habitSuccess: [20], lastActivityAt: ago(10), effortMinutes: 100 }),
    ],
    today,
  );
  assert.equal(a.progress, 70);
  assert.equal(a.effortShare, 75);
  assert.equal(b.progress, 20);
  assert.ok(a.level > b.level);
});

test("équilibre : homogène = 100, une seule sphère = null", () => {
  const even = sphereStats([sphere(1, { lastActivityAt: today }), sphere(2, { lastActivityAt: today })], today);
  assert.equal(balanceOf(even), 100);
  assert.equal(balanceOf(even.slice(0, 1)), null);
  const uneven = sphereStats([sphere(1, { lastActivityAt: today }), sphere(2, { lastActivityAt: ago(30) })], today);
  assert.ok((balanceOf(uneven) ?? 100) < 55);
});

test("équilibre : les sphères jamais utilisées ne comptent pas", () => {
  const fresh = sphereStats([sphere(1), sphere(2), sphere(3)], today);
  assert.equal(balanceOf(fresh), null);
  const partly = sphereStats(
    [sphere(1, { lastActivityAt: today }), sphere(2, { lastActivityAt: ago(5) }), sphere(3), sphere(4)],
    today,
  );
  assert.ok((balanceOf(partly) ?? 0) > 70);
});

test("signaux : déséquilibre, effort dominant, sphère qui s'éteint", () => {
  const spheres = [sphere(1, { lastActivityAt: today, effortMinutes: 700 }), sphere(2, { lastActivityAt: ago(12), effortMinutes: 300 })];
  const stats = sphereStats(spheres, today);
  const signals = sphereSignals(
    [{ id: 1, name: "Business" }, { id: 2, name: "Santé" }],
    stats,
  );
  const messages = signals.map((s) => s.message);
  assert.ok(messages.includes("Tu investis 70 % de ton énergie dans Business."));
  assert.ok(messages.includes("La sphère Santé perd en intensité depuis 12 jours."));
});
