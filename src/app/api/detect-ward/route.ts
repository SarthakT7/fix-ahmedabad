import { NextRequest, NextResponse } from "next/server";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import type { FeatureCollection, Feature, Polygon, MultiPolygon } from "geojson";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

let cachedGeoJSON: FeatureCollection | null = null;

function getGeoJSON(): FeatureCollection {
  if (cachedGeoJSON) return cachedGeoJSON;
  const filePath = join(process.cwd(), "public", "ahmedabad-wards.geojson");
  cachedGeoJSON = JSON.parse(readFileSync(filePath, "utf-8"));
  return cachedGeoJSON!;
}

function parseWardName(raw: string): { number: number; name: string } {
  const match = raw.match(/^(\d+)\s+(.+)$/);
  if (!match) return { number: 0, name: raw };
  return { number: parseInt(match[1], 10), name: match[2] };
}

export async function POST(request: NextRequest) {
  const { latitude, longitude } = await request.json();

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "latitude and longitude are required" },
      { status: 400 }
    );
  }

  const geojson = getGeoJSON();
  const pt = point([longitude, latitude]);

  for (const feature of geojson.features) {
    const f = feature as Feature<Polygon | MultiPolygon>;
    if (booleanPointInPolygon(pt, f)) {
      const parsed = parseWardName(f.properties?.Name || "");

      // Look up ward in database
      const { data: ward } = await supabase
        .from("wards")
        .select("id, ward_number, name, zone_id, zones(name)")
        .eq("ward_number", parsed.number)
        .single();

      if (ward) {
        return NextResponse.json({ ward });
      }

      return NextResponse.json({
        ward: {
          ward_number: parsed.number,
          name: parsed.name,
        },
      });
    }
  }

  return NextResponse.json(
    { error: "Location is not within Ahmedabad municipal boundaries" },
    { status: 404 }
  );
}
