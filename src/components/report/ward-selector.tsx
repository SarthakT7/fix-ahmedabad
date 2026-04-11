"use client";

import { useEffect, useState } from "react";
import { Navigation, Loader2 } from "lucide-react";
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
          if (ward) onChange(ward.id, latitude, longitude);
        }
        setDetecting(false);
      });
    }
  }, [latitude, longitude, wards, value, onChange]);

  return (
    <div className="space-y-2">
      <label className="text-[13px] font-semibold text-gray-700">
        Ward <span className="text-red-500">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
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
        onClick={requestLocation}
        disabled={geoLoading || detecting}
        className="flex items-center gap-1.5 text-[12px] font-medium text-green-700 hover:text-green-800"
      >
        {geoLoading || detecting ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Navigation className="h-3 w-3" />
        )}
        {detecting ? "Detecting ward..." : "Use my location"}
      </button>
    </div>
  );
}
