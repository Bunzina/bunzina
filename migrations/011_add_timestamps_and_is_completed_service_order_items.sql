ALTER TABLE IF EXISTS bunzina.service_order_service_items
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS finished_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS execution_time_ms BIGINT NULL;

CREATE INDEX IF NOT EXISTS idx_so_service_items_order_id_is_completed ON bunzina.service_order_service_items(service_order_id, is_completed);