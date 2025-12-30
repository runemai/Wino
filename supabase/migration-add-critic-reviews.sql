-- Migration: Add wine_critic_reviews table
-- This table stores wine critic reviews from various sources (Suckling, Parker, Decanter, etc.)

CREATE TABLE IF NOT EXISTS wine_critic_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  critic_name TEXT NOT NULL, -- e.g., "James Suckling", "Robert Parker", "Decanter"
  critic_publication TEXT, -- e.g., "Wine Advocate", "Decanter Magazine"
  score INTEGER NOT NULL CHECK (score >= 80 AND score <= 100), -- Score på 80-100 skala
  review_text TEXT NOT NULL, -- Den fulde review tekst
  review_date DATE, -- Dato for review
  source_url TEXT, -- URL til originalen hvis tilgængelig
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wine_critic_reviews_wine_id ON wine_critic_reviews(wine_id);
CREATE INDEX IF NOT EXISTS idx_wine_critic_reviews_critic_name ON wine_critic_reviews(critic_name);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_wine_critic_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wine_critic_reviews_updated_at
  BEFORE UPDATE ON wine_critic_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_wine_critic_reviews_updated_at();

-- Enable Row Level Security
ALTER TABLE wine_critic_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable read access for authenticated users" ON wine_critic_reviews
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON wine_critic_reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON wine_critic_reviews
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON wine_critic_reviews
  FOR DELETE USING (auth.role() = 'authenticated');

