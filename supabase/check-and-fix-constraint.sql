-- Check what the constraint actually is and fix it
-- Run this in Supabase SQL Editor

-- Step 1: Check what the constraint IS
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition,
    oid
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND conname = 'wines_balance_check';

-- Step 2: If you see ">= 1 AND <= 5", then drop it by OID to be absolutely sure
-- First, let's try dropping by name with CASCADE
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_balance_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_length_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_intensity_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_complexity_check CASCADE;

-- Step 3: Check if it's actually gone
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND (conname LIKE '%balance%' OR conname LIKE '%length%' OR conname LIKE '%intensity%' OR conname LIKE '%complexity%');

-- Step 4: Add new constraints
ALTER TABLE public.wines
  ADD CONSTRAINT wines_balance_check CHECK (balance IS NULL OR balance IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_length_check CHECK (length IS NULL OR length IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_intensity_check CHECK (intensity IS NULL OR intensity IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_complexity_check CHECK (complexity IS NULL OR complexity IN (80, 85, 90, 95, 100));

-- Step 5: Verify the new constraint
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND conname = 'wines_balance_check';
