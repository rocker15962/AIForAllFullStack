CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    youtube_id VARCHAR(20) NOT NULL,
    thumbnail_url TEXT NOT NULL,
    tool_id UUID NOT NULL REFERENCES tools(id),
    skill_id UUID NOT NULL REFERENCES skills(id),
    creator_id UUID NOT NULL REFERENCES creators(id),
    difficulty difficulty_level NOT NULL,
    duration INTEGER NOT NULL DEFAULT 0,
    status course_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_tool_id ON courses(tool_id);
CREATE INDEX idx_courses_skill_id ON courses(skill_id);
CREATE INDEX idx_courses_creator_id ON courses(creator_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
