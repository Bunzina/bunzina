ALTER TABLE bunzina.auto_parts
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_auto_parts_is_active ON bunzina.auto_parts(is_active);