CREATE TABLE bunzina.services (
  id                   UUID           PRIMARY KEY,
  name                 VARCHAR(255)   NOT NULL,
  description          TEXT           NOT NULL,
  price                NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  duration_in_minutes  INTEGER        NOT NULL CHECK (duration_in_minutes > 0),
  is_active            BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
