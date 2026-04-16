CREATE SCHEMA IF NOT EXISTS bunzina;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_kind') THEN
    CREATE TYPE bunzina.document_kind AS ENUM ('CPF', 'CNPJ');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE bunzina.user_role AS ENUM ('ADMIN', 'MECHANIC', 'CUSTOMER');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_movement_type') THEN
    CREATE TYPE bunzina.stock_movement_type AS ENUM ('IN', 'OUT');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_order_status') THEN
    CREATE TYPE bunzina.service_order_status AS ENUM (
      'RECEIVED',
      'IN_DIAGNOSTIC',
      'AWAITING_APPROVAL',
      'IN_EXECUTION',
      'COMPLETED',
      'DELIVERED',
      'CANCELED'
    );
  END IF;
END $$;
