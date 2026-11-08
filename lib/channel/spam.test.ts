import { test } from "node:test";
import assert from "node:assert/strict";

import { checkSpam, countLinks } from "./spam";

const now = new Date(2026, 10, 8, 12, 0, 0);
const ago = (ms: number) => new Date(now.getTime() - ms);

test("un message normal passe", () => {
  assert.equal(checkSpam("On se retrouve demain pour la séance ?", [], now).blocked, false);
});

test("trop de liens", () => {
  const body = "http://a.fr http://b.fr https://c.fr www.d.fr";
  assert.equal(countLinks(body), 4);
  assert.equal(checkSpam(body, [], now).blocked, true);
  assert.equal(checkSpam("https://a.fr et https://b.fr", [], now).blocked, false);
});

test("répétitions : le troisième envoi identique est bloqué, pas un message court", () => {
  const sent = [{ body: "Rejoins mon groupe maintenant", createdAt: ago(60_000) }, { body: "rejoins  mon groupe maintenant", createdAt: ago(120_000) }];
  assert.equal(checkSpam("Rejoins mon groupe maintenant", sent, now).blocked, true);
  const short = [{ body: "ok", createdAt: ago(1000) }, { body: "ok", createdAt: ago(2000) }];
  assert.equal(checkSpam("ok", short, now).blocked, false);
});

test("les anciens doublons ne comptent plus", () => {
  const old = [{ body: "Rejoins mon groupe maintenant", createdAt: ago(3_600_000) }, { body: "Rejoins mon groupe maintenant", createdAt: ago(3_700_000) }];
  assert.equal(checkSpam("Rejoins mon groupe maintenant", old, now).blocked, false);
});

test("rafale et bruit", () => {
  const burst = Array.from({ length: 5 }, (_, i) => ({ body: `m${i}`, createdAt: ago(i * 1000) }));
  assert.equal(checkSpam("encore un", burst, now).blocked, true);
  assert.equal(checkSpam("a".repeat(40), [], now).blocked, true);
  assert.equal(checkSpam("bla bla bla bla bla bla bla bla bla", [], now).blocked, true);
});
