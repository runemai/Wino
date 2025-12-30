-- Fix BLIK rating constraints to match actual values (80, 85, 90, 95, 100)
-- Instead of (1-5)

-- Drop existing constraints
ALTER TABLE public.wines
  DROP CONSTRAINT IF EXISTS wines_balance_check,
  DROP CONSTRAINT IF EXISTS wines_length_check,
  DROP CONSTRAINT IF EXISTS wines_intensity_check,
  DROP CONSTRAINT IF EXISTS wines_complexity_check;

-- Add new constraints that match actual BLIK rating values
ALTER TABLE public.wines
  ADD CONSTRAINT wines_balance_check CHECK (balance IS NULL OR balance IN (80, 85, 90, 95, 100)),
  ADD CONSTRAINT wines_length_check CHECK (length IS NULL OR length IN (80, 85, 90, 95, 100)),
  ADD CONSTRAINT wines_intensity_check CHECK (intensity IS NULL OR intensity IN (80, 85, 90, 95, 100)),
  ADD CONSTRAINT wines_complexity_check CHECK (complexity IS NULL OR complexity IN (80, 85, 90, 95, 100));
