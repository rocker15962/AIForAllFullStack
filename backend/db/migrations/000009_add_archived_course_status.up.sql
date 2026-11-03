-- BR-31: courses are archived instead of deleted, so learners keep their progress and badges.
-- Kept in its own migration: a new enum value cannot be used in the transaction that adds it.
ALTER TYPE course_status ADD VALUE IF NOT EXISTS 'archived';
