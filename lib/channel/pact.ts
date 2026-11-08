/**
 * Pactes d'accountability : deux membres se suivent mutuellement. Ce module
 * décide, à partir de signaux déjà calculés, ce que le copilote doit dire :
 * une mise à jour attendue, un décrochage, un objectif non tenu.
 * Pur, testé dans pact.test.ts.
 */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export type PartnerSnapshot = {
  name: string;
  /** LockIn Score des 7 derniers jours (du plus ancien au plus récent). */
  scoreWeek: number[];
  /** Jours sans la moindre activité (tâche, habitude, focus, check-in). */
  idleDays: number | null;
  goalsBehind: string[];
  /** Habitudes dont la série vient de se casser (série ≥ 3 hier, 0 aujourd'hui). */
  brokenStreaks: string[];
};

export type PactSignal = {
  id: string;
  tone: "info" | "warning" | "critical" | "positive";
  message: string;
};

export type PactActivity = {
  lastFromMe: Date | null;
  lastFromPartner: Date | null;
};

/** Baisse de discipline : le score a perdu au moins 15 points entre le début et la fin de la semaine. */
export function disciplineDrop(scoreWeek: number[]): number {
  if (scoreWeek.length < 4) return 0;
  const half = Math.floor(scoreWeek.length / 2);
  const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
  return Math.round(avg(scoreWeek.slice(0, half)) - avg(scoreWeek.slice(-half)));
}

export function pactSignals(partner: PartnerSnapshot, activity: PactActivity, now: Date = new Date()): PactSignal[] {
  const out: PactSignal[] = [];
  const first = partner.name.split(" ")[0] || "Ton partenaire";

  // Qui attend qui : le dernier mot est au partenaire depuis plus de 36 h, ou personne n'a écrit depuis 3 jours.
  const { lastFromMe, lastFromPartner } = activity;
  if (lastFromPartner && (!lastFromMe || lastFromPartner > lastFromMe) && now.getTime() - lastFromPartner.getTime() > 36 * HOUR) {
    out.push({
      id: "waiting-me",
      tone: "warning",
      message: `${first} attend une mise à jour de ta part.`,
    });
  } else if (lastFromMe && (!lastFromPartner || lastFromMe > lastFromPartner) && now.getTime() - lastFromMe.getTime() > 3 * DAY) {
    out.push({ id: "waiting-partner", tone: "info", message: `Sans nouvelles de ${first} depuis ${Math.floor((now.getTime() - lastFromMe.getTime()) / DAY)} jours.` });
  }
  if (!lastFromMe && !lastFromPartner) {
    out.push({ id: "start", tone: "info", message: "Premier pas : écris ton objectif de la semaine à ton partenaire." });
  }

  if (partner.idleDays !== null && partner.idleDays >= 3) {
    out.push({
      id: "idle",
      tone: partner.idleDays >= 7 ? "critical" : "warning",
      message: `${first} est à l'arrêt depuis ${partner.idleDays} jours. Un message peut tout relancer.`,
    });
  }
  const drop = disciplineDrop(partner.scoreWeek);
  if (drop >= 15) {
    out.push({ id: "drop", tone: "warning", message: `La discipline de ${first} baisse (−${drop} points cette semaine).` });
  } else if (drop <= -15) {
    out.push({ id: "rise", tone: "positive", message: `${first} est en forte progression (+${-drop} points). Félicite-le ou la.` });
  }
  for (const goal of partner.goalsBehind.slice(0, 2)) {
    out.push({ id: `behind-${goal}`, tone: "warning", message: `Objectif en retard chez ${first} : « ${goal} ».` });
  }
  for (const habit of partner.brokenStreaks.slice(0, 2)) {
    out.push({ id: `streak-${habit}`, tone: "warning", message: `La série « ${habit} » de ${first} vient de se casser.` });
  }
  const order = { critical: 0, warning: 1, info: 2, positive: 3 };
  return out.sort((a, b) => order[a.tone] - order[b.tone]);
}
