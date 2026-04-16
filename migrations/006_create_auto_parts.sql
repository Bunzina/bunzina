CREATE TABLE IF NOT EXISTS bunzina.auto_parts (
  id          UUID           PRIMARY KEY,
  name        VARCHAR(255)   NOT NULL,
  description TEXT           NOT NULL,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock       INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
