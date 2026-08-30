ALTER TABLE bunzina.users
  ADD COLUMN IF NOT EXISTS document VARCHAR(11);

-- Existing databases may already have users created before document became
-- required. Generate unique placeholders so the migration is reversible at the
-- data-quality level by updating real CPFs later, without breaking deployment.
WITH users_without_document AS (
  SELECT
    id,
    LPAD(ROW_NUMBER() OVER (ORDER BY id)::TEXT, 11, '0') AS generated_document
  FROM bunzina.users
  WHERE document IS NULL
)
UPDATE bunzina.users
SET document = users_without_document.generated_document
FROM users_without_document
WHERE bunzina.users.id = users_without_document.id;

ALTER TABLE bunzina.users
  ALTER COLUMN document SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_document_unique
  ON bunzina.users(document);
