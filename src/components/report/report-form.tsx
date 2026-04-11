"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Share2 } from "lucide-react";
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

      // Build share URL
      const ward = data.wards as { name: string; ward_number: number };

      // Fetch representatives for this ward
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
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
        <p className="text-gray-500 mb-6">
          Thank you for reporting. Now pressure the authorities to take action.
        </p>
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 font-semibold text-white active:bg-gray-800"
        >
          <Share2 className="h-5 w-5" />
          Tag Your Neta on X
        </a>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-sm font-medium text-green-600"
        >
          Back to Map
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-4 pb-32">
      <PhotoUpload value={imageUrl} onChange={setImageUrl} />
      <WardSelector value={wardId} onChange={handleWardChange} />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Landmark / Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g., Near SG Highway, opposite D-Mart"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
        />
      </div>

      <SeverityPicker value={severity} onChange={setSeverity} />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Any additional details about the garbage dump..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !imageUrl || !wardId || !severity}
        className="!mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 font-semibold text-white transition-colors disabled:bg-gray-300 active:bg-green-700"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Report"
        )}
      </button>
    </form>
  );
}
