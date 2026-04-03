CREATE TABLE creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT NOT NULL DEFAULT '',
    channel_url TEXT NOT NULL
);
