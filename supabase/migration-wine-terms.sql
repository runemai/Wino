-- Migration: Create tables for wine regions and vineyards
-- Run this in Supabase Dashboard -> SQL Editor

-- Enable pg_trgm extension for fuzzy text search (must be first)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Table for wine regions (appellations)
CREATE TABLE IF NOT EXISTS public.wine_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  region text, -- e.g., "Bourgogne", "Alsace"
  type text, -- e.g., "AOC", "DOC", "DAC"
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name, country)
);

-- Table for vineyards
CREATE TABLE IF NOT EXISTS public.vineyards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  region text, -- e.g., "Bourgogne", "Alsace"
  appellation text, -- Optional: link to wine_regions
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name, country)
);

-- Table for wine producers
CREATE TABLE IF NOT EXISTS public.wine_producers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  region text, -- e.g., "Bourgogne", "Alsace"
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name, country)
);

-- Indexes for faster search (using btree for simple text search, pg_trgm for fuzzy search)
CREATE INDEX IF NOT EXISTS idx_wine_regions_name ON public.wine_regions(name);
CREATE INDEX IF NOT EXISTS idx_wine_regions_country ON public.wine_regions(country);
CREATE INDEX IF NOT EXISTS idx_wine_regions_name_trgm ON public.wine_regions USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vineyards_name ON public.vineyards(name);
CREATE INDEX IF NOT EXISTS idx_vineyards_country ON public.vineyards(country);
CREATE INDEX IF NOT EXISTS idx_vineyards_name_trgm ON public.vineyards USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_wine_producers_name ON public.wine_producers(name);
CREATE INDEX IF NOT EXISTS idx_wine_producers_country ON public.wine_producers(country);
CREATE INDEX IF NOT EXISTS idx_wine_producers_name_trgm ON public.wine_producers USING gin(name gin_trgm_ops);

-- RLS policies (read-only for authenticated users)
ALTER TABLE public.wine_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vineyards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_producers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.wine_regions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON public.vineyards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON public.wine_producers
  FOR SELECT USING (auth.role() = 'authenticated');

