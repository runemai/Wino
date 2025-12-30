-- Fix constraint - drop old and add new
-- Run this in Supabase SQL Editor

-- Step 1: Drop the old constraint (we know it exists)
ALTER TABLE public.wines DROP CONSTRAINT wines_balance_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_length_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_intensity_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_complexity_check CASCADE;

-- Step 2: Verify they're gone
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND (conname LIKE '%balance%' OR conname LIKE '%length%' OR conname LIKE '%intensity%' OR conname LIKE '%complexity%');
-- Should return no rows (or only rows for other constraints)

-- Step 3: Add new correct constraints
ALTER TABLE public.wines
  ADD CONSTRAINT wines_balance_check CHECK (balance IS NULL OR balance IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_length_check CHECK (length IS NULL OR length IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_intensity_check CHECK (intensity IS NULL OR intensity IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_complexity_check CHECK (complexity IS NULL OR complexity IN (80, 85, 90, 95, 100));

-- Step 4: Verify the new constraint
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND conname = 'wines_balance_check';
-- Should show: CHECK ((balance IS NULL) OR (balance = ANY (ARRAY[80, 85, 90, 95, 100])))
