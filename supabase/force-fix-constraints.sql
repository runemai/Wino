-- FORCE FIX: Drop ALL constraints and recreate them correctly
-- Run this in Supabase SQL Editor

-- Step 1: Show ALL current constraints on wines table
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND contype = 'c'
ORDER BY conname;

-- Step 2: Drop ALL check constraints (not just BLIK ones, to be safe)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.wines'::regclass 
          AND contype = 'c'
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE public.wines DROP CONSTRAINT ' || quote_ident(r.conname) || ' CASCADE';
            RAISE NOTICE 'Dropped constraint: %', r.conname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop constraint %: %', r.conname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 3: Re-add type constraint (if it was dropped)
ALTER TABLE public.wines
  ADD CONSTRAINT wines_type_check CHECK (type IN ('rød', 'hvid', 'rosé', 'mousserende'));

-- Step 4: Add new correct BLIK constraints
ALTER TABLE public.wines
  ADD CONSTRAINT wines_balance_check CHECK (balance IS NULL OR balance IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_length_check CHECK (length IS NULL OR length IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_intensity_check CHECK (intensity IS NULL OR intensity IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_complexity_check CHECK (complexity IS NULL OR complexity IN (80, 85, 90, 95, 100));

-- Step 5: Verify the fix
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND contype = 'c'
ORDER BY conname;

-- Step 6: Test that data passes constraints
SELECT 
    id,
    balance,
    length,
    intensity,
    complexity,
    CASE 
        WHEN balance IS NULL OR balance IN (80, 85, 90, 95, 100) THEN 'OK'
        ELSE 'INVALID'
    END AS balance_check,
    CASE 
        WHEN length IS NULL OR length IN (80, 85, 90, 95, 100) THEN 'OK'
        ELSE 'INVALID'
    END AS length_check
FROM public.wines
WHERE balance IS NOT NULL OR length IS NOT NULL
LIMIT 5;
