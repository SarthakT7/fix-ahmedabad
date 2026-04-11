#!/usr/bin/env node

/**
 * Seed script: Parses the Ahmedabad ward GeoJSON and inserts zones + wards into Supabase.
 *
 * Usage: node scripts/seed-wards.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from .env.local
const envFile = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
const env = {};
envFile.split("\n").forEach((line) => {
  const [key, ...val] = line.split("=");
  if (key && val.length) env[key.trim()] = val.join("=").trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Ward-to-zone mapping (manually curated based on AMC structure)
const WARD_ZONE_MAP = {
  // Central Zone
  "SHAHPUR": "Central",
  "DARIYAPUR": "Central",
  "DARIAPUR": "Central",
  "JAMALPUR": "Central",
  "JAMALPUR KHADIYA": "Central",
  "KHADIA": "Central",
  "ASARWA": "Central",
  "SHAHIBAUG": "Central",
  "SHAHPUR DARWAJA": "Central",
  "KALUPUR": "Central",

  // East Zone
  "GOMTIPUR": "East",
  "ODHAV": "East",
  "VASTRAL": "East",
  "AMRAIWADI": "East",
  "RAMOL HATHIJAN": "East",
  "NIKOL": "East",
  "NIKOL NARODA": "East",
  "BHAIPURA HATKESHWAR": "East",
  "CTM RAKHIAL": "East",
  "ODHAV INDUSTRIAL": "East",

  // North Zone
  "BAPUNAGAR": "North",
  "NARODA": "North",
  "SARASPUR": "North",
  "SARDARNAGAR": "North",
  "KUBERNAGAR": "North",
  "THAKKARBAPANAGAR": "North",
  "NARODA INDUSTRIAL": "North",
  "SARDARNAGAR RAKHIAL": "North",
  "MEGHANINAGAR": "North",
  "BAPU NAGAR": "North",

  // North West Zone
  "GOTA": "North West",
  "CHANDLODIA": "North West",
  "CHANDLODIYA": "North West",
  "GHATLODIYA": "North West",
  "GHATLODIA": "North West",
  "THALTEJ": "North West",
  "BODAKDEV": "North West",
  "SABARMATI": "North West",
  "RANIP": "North West",
  "MOTERA": "North West",
  "SOLA": "North West",
  "CHANDKHEDA": "North West",

  // South Zone
  "MANINAGAR": "South",
  "BEHRAMPURA": "South",
  "KHOKHRA": "South",
  "ISANPUR": "South",
  "VATVA": "South",
  "LAMBHA": "South",
  "DANILIMDA": "South",
  "VINZOL": "South",
  "GYASPUR": "South",
  "SHAHWADI": "South",
  "KANKARIA": "South",

  // South West Zone
  "SARKHEJ": "South West",
  "JODHPUR": "South West",
  "VEJALPUR": "South West",
  "MAKTAMPURA": "South West",
  "JUHAPURA": "South West",
  "SATELITE": "South West",
  "SATELLITE": "South West",
  "BOPAL": "South West",
  "AMBLI": "South West",
  "PRAHLAD NAGAR": "South West",
  "AMBLI BOPAL": "South West",

  // West Zone
  "NARANPURA": "West",
  "NAVRANGPURA": "West",
  "PALDI": "West",
  "VASTRAPUR": "West",
  "VASNA": "West",
  "ELLISBRIDGE": "West",
  "ELLIS BRIDGE": "West",
  "USMANPURA": "West",
  "AMBAWADI": "West",
  "ASHRAM ROAD": "West",
  "MEMNAGAR": "West",
  "NAVA VADAJ": "West",
  "VADAJ": "West",
  "ANJALI": "West",
};

function findZone(wardName) {
  const upper = wardName.toUpperCase();
  // Try exact match first
  if (WARD_ZONE_MAP[upper]) return WARD_ZONE_MAP[upper];
  // Try partial match
  for (const [key, zone] of Object.entries(WARD_ZONE_MAP)) {
    if (upper.includes(key) || key.includes(upper)) return zone;
  }
  // Default to Central if no match
  return "Central";
}

function computeCentroid(geometry) {
  let totalLat = 0, totalLng = 0, count = 0;

  function processCoords(coords) {
    if (typeof coords[0] === "number") {
      totalLng += coords[0];
      totalLat += coords[1];
      count++;
    } else {
      coords.forEach(processCoords);
    }
  }

  processCoords(geometry.coordinates);
  return { lat: totalLat / count, lng: totalLng / count };
}

async function main() {
  console.log("Loading GeoJSON...");
  const geojsonPath = join(__dirname, "..", "public", "ahmedabad-wards.geojson");
  const geojson = JSON.parse(readFileSync(geojsonPath, "utf-8"));
  console.log(`Found ${geojson.features.length} wards`);

  // Step 1: Insert zones
  console.log("\nInserting zones...");
  const zones = [
    { name: "Central", slug: "central" },
    { name: "East", slug: "east" },
    { name: "West", slug: "west" },
    { name: "North", slug: "north" },
    { name: "South", slug: "south" },
    { name: "North West", slug: "north-west" },
    { name: "South West", slug: "south-west" },
  ];

  const { data: insertedZones, error: zoneError } = await supabase
    .from("zones")
    .upsert(zones, { onConflict: "slug" })
    .select();

  if (zoneError) {
    console.error("Zone insert error:", zoneError.message);
    console.error("\n⚠️  Tables don't exist yet! Please run supabase/schema.sql in your Supabase SQL Editor first.");
    console.error("   Go to: https://supabase.com/dashboard → SQL Editor → paste schema.sql → Run");
    return;
  }
  console.log(`Inserted/updated ${insertedZones.length} zones`);

  const zoneMap = {};
  insertedZones.forEach((z) => { zoneMap[z.name] = z.id; });

  // Step 2: Insert wards
  console.log("\nInserting wards...");
  const wards = geojson.features.map((feature) => {
    const rawName = feature.properties.Name || "";
    const match = rawName.match(/^(\d+)\s+(.+)$/);
    const wardNumber = match ? parseInt(match[1], 10) : 0;
    const wardName = match ? match[2] : rawName;
    const zoneName = findZone(wardName);
    const centroid = computeCentroid(feature.geometry);

    return {
      ward_number: wardNumber,
      name: wardName,
      zone_id: zoneMap[zoneName],
      boundary: feature.geometry,
      centroid_lat: centroid.lat,
      centroid_lng: centroid.lng,
    };
  });

  const { data: insertedWards, error: wardError } = await supabase
    .from("wards")
    .upsert(wards, { onConflict: "ward_number" })
    .select();

  if (wardError) {
    console.error("Ward insert error:", wardError.message);
    return;
  }
  console.log(`Inserted/updated ${insertedWards.length} wards`);

  // Step 3: Insert representatives (MLAs & MPs)
  console.log("\nInserting representatives...");
  const representatives = [
    // MPs
    { name: "Hasmukhbhai Patel", role: "mp", party: "BJP", constituency: "Ahmedabad East", twitter_handle: "hasaboriya" },
    { name: "Dineshbhai Makwana", role: "mp", party: "BJP", constituency: "Ahmedabad West", twitter_handle: null },
    { name: "Amit Shah", role: "mp", party: "BJP", constituency: "Gandhinagar", twitter_handle: "AmitShah" },
    // MLAs
    { name: "Bhupendrabhai Patel", role: "mla", party: "BJP", constituency: "Ghatlodia", twitter_handle: "Aboriya_Bhupen" },
    { name: "Kishor Chauhan", role: "mla", party: "BJP", constituency: "Vejalpur", twitter_handle: null },
    { name: "Pradipbhai Parmar", role: "mla", party: "BJP", constituency: "Vatva", twitter_handle: null },
    { name: "Amul Bhatt", role: "mla", party: "BJP", constituency: "Ellis Bridge", twitter_handle: null },
    { name: "Sureshbhai Patel", role: "mla", party: "BJP", constituency: "Amraiwadi", twitter_handle: null },
    { name: "Kaushikbhai Jain", role: "mla", party: "BJP", constituency: "Dariapur", twitter_handle: null },
    { name: "Imran Khedawala", role: "mla", party: "INC", constituency: "Jamalpur-Khadiya", twitter_handle: "imaboriyapura" },
    { name: "Jagdish Panchal", role: "mla", party: "BJP", constituency: "Nikol", twitter_handle: null },
    { name: "Paresh Rawal", role: "mla", party: "BJP", constituency: "Naroda", twitter_handle: null },
    { name: "Vallabhbhai Kakadiya", role: "mla", party: "BJP", constituency: "Thakkarbapa Nagar", twitter_handle: null },
    { name: "Naishadh Desai", role: "mla", party: "BJP", constituency: "Bapunagar", twitter_handle: null },
    { name: "Shaileshbhai Parmar", role: "mla", party: "BJP", constituency: "Danilimda", twitter_handle: null },
    { name: "Darshana Vaghela", role: "mla", party: "BJP", constituency: "Asarwa", twitter_handle: null },
    { name: "Jitendrabhai Patel", role: "mla", party: "BJP", constituency: "Naranpura", twitter_handle: null },
    { name: "Surendra Patel", role: "mla", party: "BJP", constituency: "Sabarmati", twitter_handle: null },
    { name: "Arvindkumar Patel", role: "mla", party: "BJP", constituency: "Maninagar", twitter_handle: null },
  ];

  const { data: insertedReps, error: repError } = await supabase
    .from("representatives")
    .upsert(representatives, { onConflict: "id" })
    .select();

  if (repError) {
    console.error("Rep insert error:", repError.message);
  } else {
    console.log(`Inserted/updated ${insertedReps.length} representatives`);
  }

  console.log("\nSeeding complete!");
  console.log("Next steps:");
  console.log("1. Create 'report-images' storage bucket in Supabase Dashboard (public, 5MB limit)");
  console.log("2. Verify data in Supabase Table Editor");
  console.log("3. Run: npm run dev");
}

main().catch(console.error);
