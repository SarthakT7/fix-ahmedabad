"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useGeolocation } from "@/hooks/use-geolocation";
import { loadWardGeoJSON, detectWard } from "@/lib/geo/ward-lookup";
import type { Ward } from "@/types";

interface WardSelectorProps {
  value: string;
  onChange: (wardId: string, lat?: number, lng?: number) => void;
}

export default function WardSelector({ value, onChange }: WardSelectorProps) {
  const [wards, setWards] = useState<Ward[]>([]);
  const [detecting, setDetecting] = useState(false);
  const { latitude, longitude, loading: geoLoading, requestLocation } = useGeolocation();

  useEffect(() => {
    supabase
      .from("wards")
      .select("id, ward_number, name, zone_id, centroid_lat, centroid_lng, zones(name)")
      .order("ward_number")
      .then(({ data }) => {
        if (data) setWards(data as unknown as Ward[]);
      });
  }, []);

  useEffect(() => {
    if (latitude && longitude && !value) {
      setDetecting(true);
      loadWardGeoJSON().then((geojson) => {
        const result = detectWard(latitude, longitude, geojson);
        if (result) {
          const ward = wards.find((w) => w.ward_number === result.wardNumber);
          if (ward) {
            onChange(ward.id, latitude, longitude);
          }
        }
        setDetecting(false);
      });
    }
  }, [latitude, longitude, wards, value, onChange]);

  const handleAutoDetect = () => {
    requestLocation();
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Ward <span className="text-red-500">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
      >
        <option value="">Select Ward...</option>
        {wards.map((ward) => (
          <option key={ward.id} value={ward.id}>
            Ward {ward.ward_number} — {ward.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleAutoDetect}
        disabled={geoLoading || detecting}
        className="flex items-center gap-2 text-sm font-medium text-green-600 active:text-green-700"
      >
        {geoLoading || detecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
        {detecting ? "Detecting ward..." : "Use my current location"}
      </button>
    </div>
  );
}
