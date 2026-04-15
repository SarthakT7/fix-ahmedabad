-- Swachh Amdavad Database Schema
-- Run this in Supabase SQL Editor to set up all tables

-- 1. Zones
CREATE TABLE IF NOT EXISTS zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Wards
CREATE TABLE IF NOT EXISTS wards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ward_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  zone_id UUID REFERENCES zones(id) NOT NULL,
  boundary JSONB NOT NULL,
  centroid_lat DOUBLE PRECISION,
  centroid_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wards_zone ON wards(zone_id);

-- 3. Representatives
-- A single elected official (corporator / MLA / MP). The ward association
-- lives in the ward_representatives junction table below, because a single
-- MLA or MP covers many wards.
CREATE TABLE IF NOT EXISTS representatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('corporator', 'mla', 'mp')),
  party TEXT,
  constituency TEXT,
  photo_url TEXT,
  twitter_handle TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reps_role ON representatives(role);

-- 4. Ward ↔ Representative junction (many-to-many).
-- Corporators → 1 ward. MLAs → ~3 wards. MPs → ~18 wards.
CREATE TABLE IF NOT EXISTS ward_representatives (
  ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  representative_id UUID REFERENCES representatives(id) ON DELETE CASCADE,
  PRIMARY KEY (ward_id, representative_id)
);
CREATE INDEX IF NOT EXISTS idx_ward_reps_ward ON ward_representatives(ward_id);
CREATE INDEX IF NOT EXISTS idx_ward_reps_rep ON ward_representatives(representative_id);

-- 6. Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ward_id UUID REFERENCES wards(id) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe', 'critical')),
  description TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved')),
  reporter_name TEXT,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_ward ON reports(ward_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON reports(severity);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);

-- 7. Report upvotes (fingerprint-based dedup)
CREATE TABLE IF NOT EXISTS report_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES reports(id) NOT NULL,
  fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(report_id, fingerprint)
);

-- ============================================
-- Row Level Security Policies
-- ============================================

ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE ward_representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_upvotes ENABLE ROW LEVEL SECURITY;

-- Public read for all reference tables
CREATE POLICY "Public read zones" ON zones FOR SELECT USING (true);
CREATE POLICY "Public read wards" ON wards FOR SELECT USING (true);
CREATE POLICY "Public read representatives" ON representatives FOR SELECT USING (true);
CREATE POLICY "Public read ward_representatives" ON ward_representatives FOR SELECT USING (true);

-- Reports: anyone can read and create
CREATE POLICY "Public read reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Public insert reports" ON reports FOR INSERT WITH CHECK (true);

-- Upvotes: anyone can read and create
CREATE POLICY "Public read upvotes" ON report_upvotes FOR SELECT USING (true);
CREATE POLICY "Public insert upvotes" ON report_upvotes FOR INSERT WITH CHECK (true);

-- ============================================
-- Storage bucket for report images
-- ============================================
-- Run this separately in Supabase dashboard > Storage > Create bucket:
-- Name: report-images
-- Public: Yes
-- File size limit: 5MB
-- Allowed MIME types: image/*
