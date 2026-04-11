"use client";

import { useState } from "react";
import { MapPin, ThumbsUp, Share2 } from "lucide-react";
import { SEVERITY_LEVELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { buildTwitterIntent } from "@/lib/social/twitter-intent";
import type { Report } from "@/types";

interface ReportCardProps {
  report: Report & { wards?: { name: string; ward_number: number } };
}

function getFingerprint(): string {
  const nav = navigator;
  const raw = `${nav.userAgent}|${nav.language}|${screen.width}x${screen.height}|${new Date().getTimezoneOffset()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

export default function ReportCard({ report }: ReportCardProps) {
  const severity = SEVERITY_LEVELS.find((s) => s.value === report.severity);
  const [upvotes, setUpvotes] = useState(report.upvotes || 0);
  const [liked, setLiked] = useState(false);

  const handleUpvote = async () => {
    if (liked) return;

    const fingerprint = getFingerprint();

    const { error } = await supabase
      .from("report_upvotes")
      .insert({ report_id: report.id, fingerprint });

    if (error) {
      if (error.code === "23505") {
        // Already upvoted (unique constraint)
        setLiked(true);
      }
      return;
    }

    // Increment the upvote count on the report
    await supabase
      .from("reports")
      .update({ upvotes: upvotes + 1 })
      .eq("id", report.id);

    setUpvotes((prev) => prev + 1);
    setLiked(true);
  };

  const handleShare = () => {
    const wardName = report.wards?.name || "Unknown";
    const wardNumber = report.wards?.ward_number || 0;

    const twitterUrl = buildTwitterIntent({
      wardName,
      wardNumber,
      severity: report.severity,
      address: report.address || undefined,
      representatives: [],
    });

    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      {report.image_url && (
        <img
          src={report.image_url}
          alt="Garbage report"
          className="h-40 w-full object-cover"
        />
      )}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: severity?.markerColor || "#6b7280" }}
          >
            {severity?.label || report.severity}
          </span>
          <span className="text-xs text-gray-400">{timeAgo(report.created_at)}</span>
        </div>

        {report.address && (
          <div className="flex items-start gap-1.5 mb-1">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gray-400" />
            <p className="text-sm text-gray-700 line-clamp-1">{report.address}</p>
          </div>
        )}

        {report.wards && (
          <p className="text-xs text-gray-400">
            Ward {report.wards.ward_number} — {report.wards.name}
          </p>
        )}

        {report.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{report.description}</p>
        )}

        <div className="mt-3 flex items-center gap-4 border-t border-gray-50 pt-2">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1 text-xs transition-colors ${
              liked ? "text-green-600 font-semibold" : "text-gray-400 active:text-green-600"
            }`}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
            {upvotes}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-xs text-gray-400 active:text-black"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
          <span className="ml-auto inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-500">
            {report.status.replace("_", " ")}
          </span>
        </div>
      </div>
    </div>
  );
}
