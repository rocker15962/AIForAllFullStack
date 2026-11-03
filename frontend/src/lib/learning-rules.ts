/** Learning rules shared by the course page and quiz (see PRODUCT_ROADMAP.md, BR-12/17/19). */

/** A course is completed (and its badge earned) at this score or higher (BR-12). */
export const PASSING_SCORE = 60

/** A learner counts as started once the video has played this share of its length (BR-17). */
export const START_THRESHOLD = 0.1

/** Integer comparison so 3/5 (exactly 60%) passes despite float rounding. */
export function isPassing(correct: number, total: number): boolean {
  return total > 0 && correct * 100 >= PASSING_SCORE * total
}

export function hasReachedStartThreshold(
  positionSeconds: number,
  durationSeconds: number,
): boolean {
  return durationSeconds > 0 && positionSeconds >= durationSeconds * START_THRESHOLD
}

/**
 * Index of the first question not yet answered, searching from `from` and wrapping around
 * (BR-19: resume where the learner left off). Returns -1 when every question is answered.
 */
export function firstUnansweredIndex(
  questionIds: string[],
  answered: ReadonlySet<string>,
  from = 0,
): number {
  const n = questionIds.length
  for (let step = 0; step < n; step++) {
    const i = (from + step) % n
    if (!answered.has(questionIds[i])) return i
  }
  return -1
}
