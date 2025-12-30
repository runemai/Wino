# 🔍 Check and Fix Constraint

## Problem:

Selvom værdierne er gyldige (100, 95, etc.), fejler constraint'en stadig. Dette betyder constraint'en ikke er blevet opdateret korrekt.

## Løsning:

### Step 1: Tjek hvad constraint'en faktisk er

Kør dette først i Supabase SQL Editor:

```sql
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND conname = 'wines_balance_check';
```

**Send mig output fra denne query!** Den viser præcist hvad constraint'en er nu.

### Step 2: Fix constraint'en

Kør dette komplette script:

```sql
-- Drop by name with CASCADE
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_balance_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_length_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_intensity_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_complexity_check CASCADE;

-- Check if they're gone
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND (conname LIKE '%balance%' OR conname LIKE '%length%' OR conname LIKE '%intensity%' OR conname LIKE '%complexity%');

-- Add new constraints
ALTER TABLE public.wines
  ADD CONSTRAINT wines_balance_check CHECK (balance IS NULL OR balance IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_length_check CHECK (length IS NULL OR length IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_intensity_check CHECK (intensity IS NULL OR intensity IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_complexity_check CHECK (complexity IS NULL OR complexity IN (80, 85, 90, 95, 100));

-- Verify
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.wines'::regclass
  AND conname = 'wines_balance_check';
```

### Efter scriptet:

Du skulle se output der viser: `CHECK ((balance IS NULL) OR (balance = ANY (ARRAY[80, 85, 90, 95, 100])))`

---

**Kør Step 1 først og send mig output, så kan jeg se præcist hvad problemet er!** 🔍
