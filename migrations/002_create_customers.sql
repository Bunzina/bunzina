CREATE TABLE bunzina.customers (
  id                   UUID        PRIMARY KEY,
  name                 VARCHAR(255) NOT NULL,
  document             VARCHAR(14)  NOT NULL UNIQUE,
  document_kind        bunzina.document_kind NOT NULL,
  email                VARCHAR(255) NOT NULL UNIQUE,
  phone                VARCHAR(20)  NOT NULL,
  address_street       VARCHAR(255) NOT NULL,
  address_number       VARCHAR(20)  NOT NULL,
  address_neighborhood VARCHAR(100) NOT NULL,
  address_city         VARCHAR(100) NOT NULL,
  address_state        CHAR(2)      NOT NULL,
  address_zip_code     VARCHAR(10)  NOT NULL,
  address_complement   VARCHAR(255),
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
