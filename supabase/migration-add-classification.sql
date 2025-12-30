-- Migration: Add classification column to vineyards table
-- Run this in Supabase Dashboard -> SQL Editor

ALTER TABLE public.vineyards
  ADD COLUMN IF NOT EXISTS classification text;

