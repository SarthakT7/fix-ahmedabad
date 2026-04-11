-- ============================================
-- Seed Data: Zones
-- ============================================

INSERT INTO zones (name, slug) VALUES
  ('Central', 'central'),
  ('East', 'east'),
  ('West', 'west'),
  ('North', 'north'),
  ('South', 'south'),
  ('North West', 'north-west'),
  ('South West', 'south-west')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Seed Data: Representatives (MLAs & MPs)
-- ============================================

-- MPs covering Ahmedabad
INSERT INTO representatives (name, role, party, constituency, twitter_handle) VALUES
  ('Hasmukhbhai Patel', 'mp', 'BJP', 'Ahmedabad East', 'hasaboriya'),
  ('Dineshbhai Makwana', 'mp', 'BJP', 'Ahmedabad West', null),
  ('Amit Shah', 'mp', 'BJP', 'Gandhinagar', 'AmitShah')
ON CONFLICT DO NOTHING;

-- MLAs covering Ahmedabad constituencies
INSERT INTO representatives (name, role, party, constituency, twitter_handle) VALUES
  ('Bhupendrabhai Patel', 'mla', 'BJP', 'Ghatlodia', 'Aboriya_Bhupen'),
  ('Kishor Chauhan', 'mla', 'BJP', 'Vejalpur', null),
  ('Pradipbhai Parmar', 'mla', 'BJP', 'Vatva', null),
  ('Amul Bhatt', 'mla', 'BJP', 'Ellis Bridge', null),
  ('Sureshbhai Patel', 'mla', 'BJP', 'Amraiwadi', null),
  ('Kaushikbhai Jain', 'mla', 'BJP', 'Dariapur', null),
  ('Imran Khedawala', 'mla', 'INC', 'Jamalpur-Khadiya', 'imaboriyapura'),
  ('C R Patil', 'mla', 'BJP', 'Maninagar', null),
  ('Jagdish Panchal', 'mla', 'BJP', 'Nikol', null),
  ('Paresh Rawal', 'mla', 'BJP', 'Naroda', null),
  ('Vallabhbhai Kakadiya', 'mla', 'BJP', 'Thakkarbapa Nagar', null),
  ('Naishadh Desai', 'mla', 'BJP', 'Bapunagar', null),
  ('Shaileshbhai Parmar', 'mla', 'BJP', 'Danilimda', null),
  ('Darshana Vaghela', 'mla', 'BJP', 'Asarwa', null),
  ('Jitendrabhai Patel', 'mla', 'BJP', 'Naranpura', null),
  ('Surendra Patel', 'mla', 'BJP', 'Sabarmati', null)
ON CONFLICT DO NOTHING;

-- Note: Ward-to-zone mapping and ward-to-MLA/MP mappings
-- are done via the seed script (scripts/seed-wards.js)
-- which parses the GeoJSON and assigns zones + representatives
