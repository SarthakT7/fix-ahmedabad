"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, ArrowUp, Share2 } from "lucide-react";
import { SEVERITY_LEVELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { buildTwitterIntent } from "@/lib/social/twitter-intent";
import type { Report, Representative } from "@/types";

export interface ReportCardData extends Report {
  wards?: {
    name: string;
    ward_number: number;
    ward_representatives?: { representatives: Representative }[];
  };
}

function getFingerprint(): string {
  const raw = `${navigator.userAgent}|${navigator.language}|${screen.width}x${screen.height}|${new Date().getTimezoneOffset()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) { hash = (hash << 5) - hash + raw.charCodeAt(i); hash |= 0; }
  return hash.toString(36);
}

export default function ReportCard({ report }: { report: ReportCardData }) {
  const severity = SEVERITY_LEVELS.find((s) => s.value === report.severity);
  const [upvotes, setUpvotes] = useState(report.upvotes || 0);
  const [liked, setLiked] = useState(false);

  const reps = (report.wards?.ward_representatives || [])
    .map((wr) => wr.representatives).filter(Boolean);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (liked) return;
    const fp = getFingerprint();
    const { error } = await supabase.from("report_upvotes").insert({ report_id: report.id, fingerprint: fp });
    if (error) { if (error.code === "23505") setLiked(true); return; }
    await supabase.from("reports").update({ upvotes: upvotes + 1 }).eq("id", report.id);
    setUpvotes((p) => p + 1);
    setLiked(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(buildTwitterIntent({
      wardName: report.wards?.name || "",
      wardNumber: report.wards?.ward_number || 0,
      severity: report.severity,
      address: report.address || undefined,
      representatives: reps,
    }), "_blank");
  };

  return (
    <Link
      href={`/report/${report.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative h-40 shrink-0 bg-gray-100">
        {report.image_url
          ? <img src={report.image_url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          : <div className="flex h-full items-center justify-center text-[11px] text-gray-300">No photo</div>
        }
        <span
          className="absolute top-2 left-2 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: severity?.markerColor || "#6b7280" }}
        >
          {severity?.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-3 gap-2">
        <div>
          <p className="text-[13px] font-semibold text-gray-900 line-clamp-1 leading-snug">
            {report.address || "Untitled report"}
          </p>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400">
            {report.wards && (
              <>
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">Ward {report.wards.ward_number} · {report.wards.name}</span>
              </>
            )}
            <span className="ml-auto shrink-0">{timeAgo(report.created_at)}</span>
          </div>
        </div>

        {/* Footer: actions + rep count hint */}
        <div className="flex items-center gap-1 border-t border-gray-100 pt-2">
          <button onClick={handleUpvote}
            className={`flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium transition-colors ${
              liked ? "bg-green-50 text-green-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}>
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            {upvotes}
          </button>
          <button onClick={handleShare}
            className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <Share2 className="h-3 w-3" />
            Share
          </button>
          {reps.length > 0 && (
            <span className="ml-auto text-[11px] text-gray-400">
              {reps.length} accountable →
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
