-- Migration: Add classification and subclassification columns to vineyards table
-- Run this in Supabase Dashboard -> SQL Editor

ALTER TABLE public.vineyards
  ADD COLUMN IF NOT EXISTS classification text,
  ADD COLUMN IF NOT EXISTS subclassification text;

