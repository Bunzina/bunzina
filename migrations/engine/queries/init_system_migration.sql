CREATE TABLE IF NOT EXISTS public.migrations (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255)  NOT NULL,
  runned_at         TIMESTAMPTZ   NOT NULL DEFAULT now()
);