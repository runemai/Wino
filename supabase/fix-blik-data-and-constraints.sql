-- COMPLETE FIX: Update existing data AND fix constraints
-- Run this in Supabase SQL Editor

-- Step 1: Check current data
SELECT 
    id,
    balance,
    length,
    intensity,
    complexity
FROM public.wines
WHERE balance IS NOT NULL 
   OR length IS NOT NULL 
   OR intensity IS NOT NULL 
   OR complexity IS NOT NULL
LIMIT 10;

-- Step 2: Update existing data
-- Convert old values (1-5) to new scale (80-100) or set to NULL if invalid
-- Mapping: 1->80, 2->85, 3->90, 4->95, 5->100
UPDATE public.wines
SET 
    balance = CASE 
        WHEN balance = 1 THEN 80
        WHEN balance = 2 THEN 85
        WHEN balance = 3 THEN 90
        WHEN balance = 4 THEN 95
        WHEN balance = 5 THEN 100
        WHEN balance IN (80, 85, 90, 95, 100) THEN balance
        ELSE NULL
    END,
    length = CASE 
        WHEN length = 1 THEN 80
        WHEN length = 2 THEN 85
        WHEN length = 3 THEN 90
        WHEN length = 4 THEN 95
        WHEN length = 5 THEN 100
        WHEN length IN (80, 85, 90, 95, 100) THEN length
        ELSE NULL
    END,
    intensity = CASE 
        WHEN intensity = 1 THEN 80
        WHEN intensity = 2 THEN 85
        WHEN intensity = 3 THEN 90
        WHEN intensity = 4 THEN 95
        WHEN intensity = 5 THEN 100
        WHEN intensity IN (80, 85, 90, 95, 100) THEN intensity
        ELSE NULL
    END,
    complexity = CASE 
        WHEN complexity = 1 THEN 80
        WHEN complexity = 2 THEN 85
        WHEN complexity = 3 THEN 90
        WHEN complexity = 4 THEN 95
        WHEN complexity = 5 THEN 100
        WHEN complexity IN (80, 85, 90, 95, 100) THEN complexity
        ELSE NULL
    END;

-- Step 3: Drop ALL old constraints
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.wines'::regclass 
          AND contype = 'c'
          AND (conname LIKE '%balance%' 
            OR conname LIKE '%length%' 
            OR conname LIKE '%intensity%' 
            OR conname LIKE '%complexity%')
    LOOP
        EXECUTE 'ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        RAISE NOTICE 'Dropped constraint: %', r.conname;
    END LOOP;
END $$;

-- Step 4: Add new correct constraints
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
  AND (conname LIKE '%balance%' OR conname LIKE '%length%' OR conname LIKE '%intensity%' OR conname LIKE '%complexity%')
ORDER BY conname;

-- Step 6: Verify data was updated correctly
SELECT 
    id,
    balance,
    length,
    intensity,
    complexity
FROM public.wines
WHERE balance IS NOT NULL 
   OR length IS NOT NULL 
   OR intensity IS NOT NULL 
   OR complexity IS NOT NULL
LIMIT 10;
