-- Migration: consolidate rep↔ward mappings
-- Run this in Supabase SQL Editor AFTER schema.sql has been applied.
--
-- What this does:
--   1. Drops the two separate mapping tables (ward_mla_mapping, ward_mp_mapping)
--      — they duplicated each other and required role-specific queries.
--   2. Creates a single unified `ward_representatives` junction table that
--      stores ward↔representative links for every role (corporator / MLA / MP).
--   3. Drops the redundant ward_id and zone_id columns on `representatives`.
--      All ward associations now live in the junction table. Zone can be
--      derived from ward.
--
-- Safe to run more than once (uses IF EXISTS / IF NOT EXISTS).

BEGIN;

DROP TABLE IF EXISTS ward_mla_mapping;
DROP TABLE IF EXISTS ward_mp_mapping;

CREATE TABLE IF NOT EXISTS ward_representatives (
  ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  representative_id UUID REFERENCES representatives(id) ON DELETE CASCADE,
  PRIMARY KEY (ward_id, representative_id)
);

CREATE INDEX IF NOT EXISTS idx_ward_reps_ward ON ward_representatives(ward_id);
CREATE INDEX IF NOT EXISTS idx_ward_reps_rep ON ward_representatives(representative_id);

ALTER TABLE ward_representatives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read ward_representatives" ON ward_representatives;
CREATE POLICY "Public read ward_representatives" ON ward_representatives
  FOR SELECT USING (true);

-- Temporary insert policy so the seed script can populate rows using the anon key.
-- Remove after seeding:
--   DROP POLICY "Temp seed ward_representatives" ON ward_representatives;
DROP POLICY IF EXISTS "Temp seed ward_representatives" ON ward_representatives;
CREATE POLICY "Temp seed ward_representatives" ON ward_representatives
  FOR INSERT WITH CHECK (true);

-- Temporary insert/update policy on representatives so the seed script can
-- re-populate party / phone / email / twitter / constituency.
-- Remove after seeding:
--   DROP POLICY "Temp seed representatives" ON representatives;
--   DROP POLICY "Temp update representatives" ON representatives;
DROP POLICY IF EXISTS "Temp seed representatives" ON representatives;
CREATE POLICY "Temp seed representatives" ON representatives
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Temp update representatives" ON representatives;
CREATE POLICY "Temp update representatives" ON representatives
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Temp delete representatives" ON representatives;
CREATE POLICY "Temp delete representatives" ON representatives
  FOR DELETE USING (true);

DROP POLICY IF EXISTS "Temp delete ward_representatives" ON ward_representatives;
CREATE POLICY "Temp delete ward_representatives" ON ward_representatives
  FOR DELETE USING (true);

-- Drop redundant FK columns. All ward links now go through ward_representatives.
ALTER TABLE representatives DROP COLUMN IF EXISTS ward_id;
ALTER TABLE representatives DROP COLUMN IF EXISTS zone_id;

COMMIT;
