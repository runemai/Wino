-- Migration: Add BLIK rating columns and smagsnote
-- Run this in Supabase Dashboard -> SQL Editor

ALTER TABLE public.wines
  ADD COLUMN IF NOT EXISTS balance integer CHECK (balance >= 1 AND balance <= 5),
  ADD COLUMN IF NOT EXISTS length integer CHECK (length >= 1 AND length <= 5),
  ADD COLUMN IF NOT EXISTS intensity integer CHECK (intensity >= 1 AND intensity <= 5),
  ADD COLUMN IF NOT EXISTS complexity integer CHECK (complexity >= 1 AND complexity <= 5),
  ADD COLUMN IF NOT EXISTS smagsnote text;

