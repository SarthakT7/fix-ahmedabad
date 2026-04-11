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
  equalHeight?: boolean;
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

export default function ReportCard({ report, equalHeight = false }: ReportCardProps) {
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
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      {(report.image_url || equalHeight) && (
        <div className="relative h-44 shrink-0 bg-gray-50">
          {report.image_url && (
            <img
              src={report.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: severity?.markerColor || "#6b7280" }}
          >
            {severity?.label}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-3">
        {!report.image_url && !equalHeight && (
          <div
            className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide text-white mb-2"
            style={{ backgroundColor: severity?.markerColor || "#6b7280" }}
          >
            {severity?.label}
          </div>
        )}

        {report.address ? (
          <p
            className={`text-[13px] text-gray-900 font-medium leading-snug ${
              equalHeight ? "min-h-[2.25rem] line-clamp-2" : ""
            }`}
          >
            {report.address}
          </p>
        ) : equalHeight ? (
          <div className="min-h-[2.25rem]" aria-hidden="true" />
        ) : null}

        <div
          className={`mt-1 flex items-center gap-1.5 ${
            equalHeight ? "min-h-[1rem]" : ""
          }`}
        >
          {report.wards ? (
            <>
              <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
              <span className="truncate text-[11px] text-gray-400">
                Ward {report.wards.ward_number} &middot; {report.wards.name}
              </span>
            </>
          ) : null}
          <span className="ml-auto shrink-0 text-[11px] text-gray-300">{timeAgo(report.created_at)}</span>
        </div>

        {report.description ? (
          <p
            className={`mt-1.5 text-[12px] leading-relaxed text-gray-500 line-clamp-2 ${
              equalHeight ? "min-h-[2.625rem]" : ""
            }`}
          >
            {report.description}
          </p>
        ) : equalHeight ? (
          <div className="mt-1.5 min-h-[2.625rem]" aria-hidden="true" />
        ) : null}

        <div className="mt-auto flex items-center gap-1 border-t border-gray-100 pt-2">
          <button
            onClick={handleUpvote}
            className={`flex cursor-pointer items-center gap-1 rounded px-2.5 py-1 text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 ${
              liked
                ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
            }`}
          >
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            {upvotes}
          </button>
          <button
            onClick={handleShare}
            className="flex cursor-pointer items-center gap-1 rounded px-2.5 py-1 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
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
