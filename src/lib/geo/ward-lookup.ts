import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";

export interface WardInfo {
  wardNumber: number;
  wardName: string;
  featureIndex: number;
}

let cachedGeoJSON: FeatureCollection | null = null;

export async function loadWardGeoJSON(): Promise<FeatureCollection> {
  if (cachedGeoJSON) return cachedGeoJSON;
  const res = await fetch("/ahmedabad-wards.geojson");
  cachedGeoJSON = await res.json();
  return cachedGeoJSON!;
}

export function parseWardName(rawName: string): { number: number; name: string } {
  const match = rawName.match(/^(\d+)\s+(.+)$/);
  if (!match) return { number: 0, name: rawName };
  return { number: parseInt(match[1], 10), name: match[2] };
}

export function detectWard(
  lat: number,
  lng: number,
  geojson: FeatureCollection
): WardInfo | null {
  const pt = point([lng, lat]);

  for (let i = 0; i < geojson.features.length; i++) {
    const feature = geojson.features[i] as Feature<Polygon | MultiPolygon>;
    if (booleanPointInPolygon(pt, feature)) {
      const parsed = parseWardName(feature.properties?.Name || "");
      return {
        wardNumber: parsed.number,
        wardName: parsed.name,
        featureIndex: i,
      };
    }
  }
  return null;
}
