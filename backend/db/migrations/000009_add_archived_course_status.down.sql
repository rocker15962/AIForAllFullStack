-- Postgres cannot drop an enum value, so rebuild the type without 'archived'.
UPDATE courses SET status = 'draft' WHERE status = 'archived';
ALTER TYPE course_status RENAME TO course_status_old;
CREATE TYPE course_status AS ENUM ('draft', 'published');
ALTER TABLE courses ALTER COLUMN status DROP DEFAULT;
ALTER TABLE courses ALTER COLUMN status TYPE course_status USING status::text::course_status;
ALTER TABLE courses ALTER COLUMN status SET DEFAULT 'draft';
DROP TYPE course_status_old;
