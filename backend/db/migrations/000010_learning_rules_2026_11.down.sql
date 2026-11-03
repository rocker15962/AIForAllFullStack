ALTER TABLE progress DROP COLUMN badge_earned_at;
ALTER TABLE skills DROP COLUMN archived_at;
ALTER TABLE tools DROP COLUMN archived_at;
DROP INDEX IF EXISTS idx_courses_preview_token;
ALTER TABLE courses DROP COLUMN preview_token;
ALTER TABLE questions DROP CONSTRAINT uq_questions_course_order;
ALTER TABLE questions ADD CONSTRAINT uq_questions_course_order UNIQUE (course_id, "order");
ALTER TABLE questions DROP COLUMN sample_answer;
