# 🔧 Fix Database Constraints

## Problem:

Database constraints for BLIK ratings (balance, length, intensity, complexity) er sat til 1-5, men applikationen bruger 80-100. Der er eksisterende data med gamle værdier som skal opdateres først.

## Løsning:

Kør dette KOMPLETE SQL script i Supabase SQL Editor (rækkefølgen er kritisk):

```sql
-- Step 1: Update existing data FIRST (convert 1-5 to 80-100)
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

-- Step 2: Drop existing constraints
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_balance_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_length_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_intensity_check CASCADE;
ALTER TABLE public.wines DROP CONSTRAINT IF EXISTS wines_complexity_check CASCADE;

-- Step 3: Add new correct constraints
ALTER TABLE public.wines
  ADD CONSTRAINT wines_balance_check CHECK (balance IS NULL OR balance IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_length_check CHECK (length IS NULL OR length IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_intensity_check CHECK (intensity IS NULL OR intensity IN (80, 85, 90, 95, 100));

ALTER TABLE public.wines
  ADD CONSTRAINT wines_complexity_check CHECK (complexity IS NULL OR complexity IN (80, 85, 90, 95, 100));
```

## Vigtigt:

**Kør hele scriptet i én gang!** Rækkefølgen er kritisk:
1. Først opdater data (1→80, 2→85, osv.)
2. Derefter drop constraints
3. Til sidst tilføj nye constraints

---

**Efter dette skulle alt virke korrekt!** ✅
