-- Check current constraints on wines table
-- Run this in Supabase SQL Editor to see current constraints

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND contype = 'c'
  AND conname LIKE '%balance%' OR conname LIKE '%length%' OR conname LIKE '%intensity%' OR conname LIKE '%complexity%'
ORDER BY conname;

-- This will show you the current constraints
-- If you see constraints with ">= 1 AND <= 5", you need to run the fix script
