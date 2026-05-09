ALTER TABLE bunzina.services
  ADD COLUMN IF NOT EXISTS completed_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_execution_time_ms BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_execution_time_ms BIGINT;