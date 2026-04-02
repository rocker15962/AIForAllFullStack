CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);
