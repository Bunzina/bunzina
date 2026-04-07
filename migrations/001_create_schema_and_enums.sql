CREATE SCHEMA IF NOT EXISTS bunzina;

CREATE TYPE bunzina.document_kind AS ENUM ('CPF', 'CNPJ');

CREATE TYPE bunzina.user_role AS ENUM ('ADMIN', 'MECHANIC', 'CUSTOMER');

CREATE TYPE bunzina.stock_movement_type AS ENUM ('IN', 'OUT');

CREATE TYPE bunzina.service_order_status AS ENUM (
  'RECEIVED',
  'IN_DIAGNOSTIC',
  'AWAITING_APPROVAL',
  'IN_EXECUTION',
  'COMPLETED',
  'DELIVERED',
  'CANCELED'
);
