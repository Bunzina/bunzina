CREATE TABLE IF NOT EXISTS bunzina.users (
  id            UUID         PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  document      VARCHAR(11)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          bunzina.user_role NOT NULL DEFAULT 'MECHANIC',
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
