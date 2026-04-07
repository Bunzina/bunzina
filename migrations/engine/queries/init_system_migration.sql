CREATE TABLE IF NOT EXISTS public.migrations (
  name              VARCHAR(255)  PRIMARY KEY,
  runned_at         TIMESTAMPTZ   NOT NULL DEFAULT now()
);