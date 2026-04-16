CREATE TABLE IF NOT EXISTS bunzina.vehicles (
  id            UUID         PRIMARY KEY,
  customer_id   UUID         NOT NULL REFERENCES bunzina.customers(id) ON DELETE CASCADE,
  license_plate VARCHAR(8)   NOT NULL UNIQUE,
  model         VARCHAR(100) NOT NULL,
  brand         VARCHAR(100) NOT NULL,
  year          SMALLINT     NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON bunzina.vehicles(customer_id);
