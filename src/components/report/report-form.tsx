"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, ExternalLink } from "lucide-react";
import PhotoUpload from "./photo-upload";
import WardSelector from "./ward-selector";
import SeverityPicker from "./severity-picker";
import { supabase } from "@/lib/supabase/client";
import { buildTwitterIntent } from "@/lib/social/twitter-intent";

export default function ReportForm() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [wardId, setWardId] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const handleWardChange = useCallback(
    (id: string, lat?: number, lng?: number) => {
      setWardId(id);
      if (lat) setLatitude(lat);
      if (lng) setLongitude(lng);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !wardId || !severity) {
      alert("Please add a photo, select a ward, and severity level.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .insert({
          ward_id: wardId,
          latitude: latitude || 23.0225,
          longitude: longitude || 72.5714,
          address: address || null,
          severity,
          description: description || null,
          image_url: imageUrl,
          status: "open",
        })
        .select("*, wards(name, ward_number)")
        .single();

      if (error) throw error;

      const ward = data.wards as { name: string; ward_number: number };
      const { data: reps } = await supabase
        .from("representatives")
        .select("*")
        .or(`ward_id.eq.${wardId},role.eq.mp,role.eq.mla`);

      const twitterUrl = buildTwitterIntent({
        wardName: ward.name,
        wardNumber: ward.ward_number,
        severity,
        address: address || undefined,
        representatives: reps || [],
      });

      setShareUrl(twitterUrl);
      setSubmitted(true);
    } catch {
      alert("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="px-4 py-16 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
          <Check className="h-6 w-6 text-green-700" strokeWidth={2.5} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Reported</h2>
        <p className="text-[13px] text-gray-500 mb-6 max-w-xs mx-auto">
          Now tag the responsible politicians so they can&apos;t ignore it.
        </p>
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-black transition-colors"
        >
          Post on X
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <div className="mt-4">
          <button
            onClick={() => router.push("/")}
            className="text-[13px] font-medium text-gray-400 hover:text-gray-600"
          >
            Back to map
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-28">
      <PhotoUpload value={imageUrl} onChange={setImageUrl} />
      <WardSelector value={wardId} onChange={handleWardChange} />

      <div className="space-y-2">
        <label className="text-[13px] font-semibold text-gray-700">
          Landmark / Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g., Near SG Highway, opposite D-Mart"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
      </div>

      <SeverityPicker value={severity} onChange={setSeverity} />

      <div className="space-y-2">
        <label className="text-[13px] font-semibold text-gray-700">
          Description <span className="text-gray-300 font-normal">optional</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Any extra details..."
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !imageUrl || !wardId || !severity}
        className="!mt-6 w-full bg-green-600 text-white text-[14px] font-semibold py-2.5 rounded-lg transition-colors disabled:bg-gray-200 disabled:text-gray-400 hover:bg-green-700"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </span>
        ) : (
          "Submit Report"
        )}
      </button>
    </form>
  );
}
