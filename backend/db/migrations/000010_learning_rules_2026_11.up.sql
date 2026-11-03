-- Business-rule decisions of 2026-11-03 (see PRODUCT_ROADMAP.md, BR-05/09/12/16/29/33).

-- BR-29 / BR-09: model answer for short-answer questions; AI grading compares against it.
ALTER TABLE questions ADD COLUMN sample_answer TEXT NOT NULL DEFAULT '';
-- Existing short-answer questions keep their canonical answer in the explanation.
UPDATE questions SET sample_answer = explanation
WHERE type = 'short_answer' AND sample_answer = '';

-- BR-29: questions are saved and reordered together with the course in one transaction,
-- so the (course_id, order) uniqueness is checked at commit time.
ALTER TABLE questions DROP CONSTRAINT uq_questions_course_order;
ALTER TABLE questions ADD CONSTRAINT uq_questions_course_order
    UNIQUE (course_id, "order") DEFERRABLE INITIALLY DEFERRED;

-- BR-05: shareable preview link for unpublished courses; cleared when the course is published.
ALTER TABLE courses ADD COLUMN preview_token TEXT;
CREATE UNIQUE INDEX idx_courses_preview_token ON courses(preview_token)
    WHERE preview_token IS NOT NULL;

-- BR-33: categories are archived instead of deleted; courses keep their category.
ALTER TABLE tools ADD COLUMN archived_at TIMESTAMPTZ;
ALTER TABLE skills ADD COLUMN archived_at TIMESTAMPTZ;

-- BR-12 / BR-16: a badge, once earned, is kept even if a later attempt scores below 60%.
ALTER TABLE progress ADD COLUMN badge_earned_at TIMESTAMPTZ;
-- Completions recorded before the 60% pass line are not re-evaluated.
UPDATE progress SET badge_earned_at = COALESCE(completed_at, last_accessed_at)
WHERE status = 'completed';
