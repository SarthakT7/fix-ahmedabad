"use client";

import { useState } from "react";
import { MapPin, ArrowUp, Share2 } from "lucide-react";
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
      if (error.code === "23505") setLiked(true);
      return;
    }
    await supabase
      .from("reports")
      .update({ upvotes: upvotes + 1 })
      .eq("id", report.id);
    setUpvotes((prev) => prev + 1);
    setLiked(true);
  };

  const handleShare = () => {
    const twitterUrl = buildTwitterIntent({
      wardName: report.wards?.name || "Unknown",
      wardNumber: report.wards?.ward_number || 0,
      severity: report.severity,
      address: report.address || undefined,
      representatives: [],
    });
    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {report.image_url && (
        <div className="relative">
          <img
            src={report.image_url}
            alt=""
            className="h-44 w-full object-cover"
          />
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: severity?.markerColor || "#6b7280" }}
          >
            {severity?.label}
          </div>
        </div>
      )}

      <div className="p-3">
        {!report.image_url && (
          <div
            className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide text-white mb-2"
            style={{ backgroundColor: severity?.markerColor || "#6b7280" }}
          >
            {severity?.label}
          </div>
        )}

        {report.address && (
          <p className="text-[13px] text-gray-900 font-medium leading-snug">
            {report.address}
          </p>
        )}

        <div className="flex items-center gap-1.5 mt-1">
          {report.wards && (
            <>
              <MapPin className="h-3 w-3 text-gray-400" />
              <span className="text-[11px] text-gray-400">
                Ward {report.wards.ward_number} &middot; {report.wards.name}
              </span>
            </>
          )}
          <span className="text-[11px] text-gray-300 ml-auto">{timeAgo(report.created_at)}</span>
        </div>

        {report.description && (
          <p className="text-[12px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{report.description}</p>
        )}

        <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-gray-100">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${
              liked
                ? "bg-green-50 text-green-700"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            {upvotes}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[12px] font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-3 w-3" />
            Share
          </button>
          <span className="ml-auto text-[10px] font-medium text-gray-400 uppercase tracking-wide">
            {report.status === "open" ? "open" : report.status.replace("_", " ")}
          </span>
        </div>
      </div>
    </div>
  );
}
