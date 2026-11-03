-- Round-3 rule decisions (2026-11-03): BR-36, BR-39.

-- BR-36: a course that was passed stays completed even if a later round scores below 60%.
-- latest_round_passed: result of the most recently scored round (NULL = never scored).
-- round_finished: whether the current round (answers) has been scored; a retake resets it.
ALTER TABLE progress ADD COLUMN latest_round_passed BOOLEAN;
ALTER TABLE progress ADD COLUMN round_finished BOOLEAN NOT NULL DEFAULT false;
UPDATE progress SET
    round_finished = (score IS NOT NULL),
    latest_round_passed = CASE
        WHEN status = 'completed' THEN true
        WHEN score IS NOT NULL THEN false
    END;

-- BR-39: one row per user per day they were active, for "average daily active users".
CREATE TABLE user_activity_days (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day DATE NOT NULL,
    PRIMARY KEY (user_id, day)
);
CREATE INDEX idx_user_activity_days_day ON user_activity_days(day);

-- Best-effort history from the timestamps we already have.
INSERT INTO user_activity_days (user_id, day)
SELECT user_id, day FROM (
    SELECT id AS user_id, created_at::date AS day FROM users
    UNION SELECT id, last_active_at::date FROM users
    UNION SELECT user_id, started_at::date FROM progress
    UNION SELECT user_id, last_accessed_at::date FROM progress
    UNION SELECT user_id, completed_at::date FROM progress WHERE completed_at IS NOT NULL
) d
ON CONFLICT DO NOTHING;
