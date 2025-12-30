-- VERIFY AND FIX: Check what constraint actually exists and fix it
-- Run this in Supabase SQL Editor

-- Step 1: Check EXACTLY what the balance constraint is
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition,
    oid
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND contype = 'c'
  AND conname = 'wines_balance_check';

-- Step 2: Check ALL constraints on wines table
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND contype = 'c'
ORDER BY conname;

-- Step 3: Drop the specific constraint by name (using OID to be sure)
DO $$
DECLARE
    constraint_oid OID;
BEGIN
    -- Get the OID of the constraint
    SELECT oid INTO constraint_oid
    FROM pg_constraint
    WHERE conrelid = 'public.wines'::regclass
      AND contype = 'c'
      AND conname = 'wines_balance_check';
    
    IF constraint_oid IS NOT NULL THEN
        -- Drop by OID to be absolutely sure
        EXECUTE 'ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_balance_check CASCADE';
        RAISE NOTICE 'Dropped wines_balance_check constraint';
    ELSE
        RAISE NOTICE 'Constraint wines_balance_check not found';
    END IF;
END $$;

-- Step 4: Drop other BLIK constraints
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_length_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_intensity_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_complexity_check CASCADE;

-- Step 5: Add new correct constraints
ALTER TABLE public.wines
  ADD CONSTRAINT wines_balance_check CHECK (balance IS NULL OR balance IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_length_check CHECK (length IS NULL OR length IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_intensity_check CHECK (intensity IS NULL OR intensity IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_complexity_check CHECK (complexity IS NULL OR complexity IN (80, 85, 90, 95, 100));

-- Step 6: Verify the new constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND contype = 'c'
  AND conname LIKE '%balance%';

-- Step 7: Test if the constraint works with our data
SELECT 
    id,
    balance,
    CASE 
        WHEN balance IS NULL OR balance IN (80, 85, 90, 95, 100) THEN 'VALID'
        ELSE 'INVALID'
    END AS validation
FROM public.wines
WHERE id = 'e6d37b7d-71bd-4eb5-97a6-40c2191ccdd5';
