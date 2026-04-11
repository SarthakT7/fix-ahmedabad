"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap } from "react-leaflet";
import { Crosshair } from "lucide-react";
import { AHMEDABAD_CENTER, DEFAULT_ZOOM, SEVERITY_LEVELS } from "@/lib/constants";
import { loadWardGeoJSON, parseWardName } from "@/lib/geo/ward-lookup";
import { useGeolocation } from "@/hooks/use-geolocation";
import { supabase } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils";
import type { Report } from "@/types";
import type { FeatureCollection } from "geojson";
import type { Layer, LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

function LocateButton() {
  const map = useMap();
  const { latitude, longitude, loading, requestLocation } = useGeolocation();

  useEffect(() => {
    if (latitude && longitude) {
      map.flyTo([latitude, longitude], 15);
    }
  }, [latitude, longitude, map]);

  return (
    <button
      onClick={requestLocation}
      disabled={loading}
      className="absolute bottom-24 right-3 z-[1000] flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 active:bg-gray-50"
    >
      <Crosshair className={`h-5 w-5 ${loading ? "animate-pulse" : ""}`} />
    </button>
  );
}

function getSeverityColor(severity: string): string {
  return SEVERITY_LEVELS.find((s) => s.value === severity)?.markerColor || "#6b7280";
}

export default function GarbageMap() {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    loadWardGeoJSON().then(setGeojson);
  }, []);

  useEffect(() => {
    supabase
      .from("reports")
      .select("*, wards(name, ward_number)")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (data) setReports(data as unknown as Report[]);
      });
  }, []);

  const onEachWard = (feature: GeoJSON.Feature, layer: Layer) => {
    const parsed = parseWardName(feature.properties?.Name || "");
    layer.bindTooltip(`Ward ${parsed.number}: ${parsed.name}`, {
      sticky: true,
      className: "!text-xs !font-medium !rounded-lg !px-2 !py-1",
    });
    (layer as L.Path).on({
      mouseover: (e: LeafletMouseEvent) => {
        (e.target as L.Path).setStyle({ fillOpacity: 0.3, weight: 2 });
      },
      mouseout: () => {
        geoJsonRef.current?.resetStyle();
      },
    });
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[AHMEDABAD_CENTER.lat, AHMEDABAD_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {geojson && (
          <GeoJSON
            ref={(ref) => { geoJsonRef.current = ref; }}
            data={geojson}
            style={{
              color: "#16a34a",
              weight: 1.5,
              fillColor: "#16a34a",
              fillOpacity: 0.05,
            }}
            onEachFeature={onEachWard}
          />
        )}

        {reports.map((report) => (
          <CircleMarker
            key={report.id}
            center={[report.latitude, report.longitude]}
            radius={8}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: getSeverityColor(report.severity),
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold capitalize">{report.severity}</p>
                {report.address && <p className="text-gray-600">{report.address}</p>}
                <p className="text-xs text-gray-400 mt-1">{timeAgo(report.created_at)}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        <LocateButton />
      </MapContainer>
    </div>
  );
}
