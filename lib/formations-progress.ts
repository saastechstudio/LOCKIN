/**
 * Logique de progression et d'analyse du module Formation — fonctions pures
 * (aucun accès base), donc testables telles quelles.
 */

export type TreeModule = { id: number; chapters: { id: number }[] };

/** Les chapitres dans l'ordre du cours, tous modules confondus. */
export function chapterIdsInOrder(modules: TreeModule[]): number[] {
  return modules.flatMap((m) => m.chapters.map((c) => c.id));
}

export function progressPercent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.min(done, total) / total) * 100);
}

/** Premier chapitre non terminé ; null si tout est fait (ou si le cours est vide). */
export function nextChapterId(modules: TreeModule[], doneIds: ReadonlySet<number>): number | null {
  return chapterIdsInOrder(modules).find((id) => !doneIds.has(id)) ?? null;
}

export type LearnerProgress = { doneChapterIds: number[] };

export const PROGRESS_BRACKETS = ["0 %", "1–25 %", "26–50 %", "51–75 %", "76–99 %", "100 %"] as const;

function bracketIndex(percent: number): number {
  if (percent <= 0) return 0;
  if (percent >= 100) return 5;
  if (percent <= 25) return 1;
  if (percent <= 50) return 2;
  if (percent <= 75) return 3;
  return 4;
}

/**
 * Chiffres de l'écran Analytics. Seuls comptent les chapitres qui existent
 * encore : un chapitre supprimé après coup ne fausse pas les pourcentages.
 */
export function formationAnalytics(chapterIds: number[], learners: LearnerProgress[]) {
  const valid = new Set(chapterIds);
  const total = chapterIds.length;
  const perLearner = learners.map((l) => new Set(l.doneChapterIds.filter((id) => valid.has(id))).size);

  const percents = perLearner.map((done) => progressPercent(done, total));
  const completed = total > 0 ? perLearner.filter((done) => done >= total).length : 0;

  const perChapter = chapterIds.map((id) => ({
    chapterId: id,
    done: learners.filter((l) => l.doneChapterIds.includes(id)).length,
  }));

  const distribution = PROGRESS_BRACKETS.map((label, i) => ({
    label,
    learners: percents.filter((p) => bracketIndex(p) === i).length,
  }));

  return {
    learnerCount: learners.length,
    completedCount: completed,
    completionRate: learners.length === 0 ? 0 : Math.round((completed / learners.length) * 100),
    averageProgress:
      learners.length === 0 ? 0 : Math.round(percents.reduce((sum, p) => sum + p, 0) / learners.length),
    perChapter: perChapter.map((c) => ({
      ...c,
      percent: learners.length === 0 ? 0 : Math.round((c.done / learners.length) * 100),
    })),
    distribution,
  };
}

/** Nouvel ordre valide ? Mêmes identifiants, sans doublon ni ajout. */
export function isSamePermutation(current: number[], proposed: number[]): boolean {
  if (current.length !== proposed.length) return false;
  const set = new Set(current);
  return new Set(proposed).size === proposed.length && proposed.every((id) => set.has(id));
}
