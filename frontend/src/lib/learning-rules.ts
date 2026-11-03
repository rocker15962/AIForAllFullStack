/**
 * Learning rules shared by the course page, quiz and My Learning
 * (see PRODUCT_ROADMAP.md, BR-12/17/19/31/36/37).
 */

import type { CourseStatus } from '@/types'

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

/**
 * Where a saved round stands when the learner comes back (BR-19):
 * - `answering`: questions are left, continue from the first unanswered one
 * - `needs-scoring`: every question is answered but the round has no score yet
 * - `scored`: every question is answered and scored, show the result
 *
 * The progress `status` is deliberately not used: while a passed course is retaken it stays
 * `completed` with only part of the new round answered, which is an answering state (BR-36).
 */
export type SavedRoundState = 'answering' | 'needs-scoring' | 'scored'

export function savedRoundState(
  questionIds: readonly string[],
  answered: ReadonlySet<string>,
  score: number | null | undefined,
): SavedRoundState {
  if (questionIds.length === 0 || !questionIds.every((id) => answered.has(id))) return 'answering'
  return score == null ? 'needs-scoring' : 'scored'
}

/**
 * Why a course the learner has history with can no longer be opened, or null while it can
 * (BR-31 archived, BR-37 unpublished). Such courses stay in My Learning but are not clickable.
 */
export function unavailableCourseLabel(status?: CourseStatus): string | null {
  if (status === 'archived') return '課程已封存'
  if (status === 'draft') return '課程暫停開放'
  return null
}

/**
 * BR-36: a course passed once stays in 已完成 even when a later round scores below 60%; the
 * latest score is shown and the badge is kept. The course page starts a new round right away
 * when it is opened with this query flag (My Learning's 「重做測驗」).
 */
export const RETAKE_PARAM = 'retake'

export function retakeHref(courseId: string): string {
  return `/courses/${courseId}?${RETAKE_PARAM}=1`
}
