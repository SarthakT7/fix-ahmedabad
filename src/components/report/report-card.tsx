"use client";

import { useState } from "react";
import { MapPin, ArrowUp, Share2, Phone, Mail } from "lucide-react";
import { SEVERITY_LEVELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { buildTwitterIntent } from "@/lib/social/twitter-intent";
import type { Report, Representative } from "@/types";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const roleOrder: Record<string, number> = { corporator: 0, mla: 1, mp: 2 };
const roleLabel: Record<string, string> = { corporator: "Corporator", mla: "MLA", mp: "MP" };

export interface ReportCardData extends Report {
  wards?: {
    name: string;
    ward_number: number;
    ward_representatives?: { representatives: Representative }[];
  };
}

interface ReportCardProps {
  report: ReportCardData;
}

function getFingerprint(): string {
  const raw = `${navigator.userAgent}|${navigator.language}|${screen.width}x${screen.height}|${new Date().getTimezoneOffset()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function RepRow({ rep }: { rep: Representative }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-gray-800 leading-snug">{rep.name}</p>
        {rep.party && (
          <p className="text-[10px] text-gray-400 mt-0.5">{rep.party}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 mt-0.5">
        {rep.phone && (
          <a href={`tel:${rep.phone.split(",")[0].trim()}`} title={rep.phone}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700 transition-colors">
            <Phone className="h-3 w-3" />
          </a>
        )}
        {rep.email && (
          <a href={`mailto:${rep.email}`} title={rep.email}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700 transition-colors">
            <Mail className="h-3 w-3" />
          </a>
        )}
        {rep.twitter_handle && (
          <a href={`https://twitter.com/${rep.twitter_handle}`} target="_blank" rel="noopener noreferrer"
            title={`@${rep.twitter_handle}`}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700 transition-colors">
            <XIcon className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function ReportCard({ report }: ReportCardProps) {
  const severity = SEVERITY_LEVELS.find((s) => s.value === report.severity);
  const [upvotes, setUpvotes] = useState(report.upvotes || 0);
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const reps = (report.wards?.ward_representatives || [])
    .map((wr) => wr.representatives)
    .filter(Boolean)
    .sort((a, b) => (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9));

  // Group by role
  const groups = ["corporator", "mla", "mp"] as const;
  const grouped = Object.fromEntries(
    groups.map((role) => [role, reps.filter((r) => r.role === role)])
  ) as Record<string, Representative[]>;

  // For corporators show 2 collapsed, all expanded
  const corps = grouped.corporator ?? [];
  const visibleCorps = expanded ? corps : corps.slice(0, 2);
  const hiddenCount = corps.length - 2;

  const handleUpvote = async () => {
    if (liked) return;
    const fp = getFingerprint();
    const { error } = await supabase.from("report_upvotes").insert({ report_id: report.id, fingerprint: fp });
    if (error) { if (error.code === "23505") setLiked(true); return; }
    await supabase.from("reports").update({ upvotes: upvotes + 1 }).eq("id", report.id);
    setUpvotes((p) => p + 1);
    setLiked(true);
  };

  const handleShare = () => {
    const url = buildTwitterIntent({
      wardName: report.wards?.name || "Unknown",
      wardNumber: report.wards?.ward_number || 0,
      severity: report.severity,
      address: report.address || undefined,
      representatives: reps,
    });
    window.open(url, "_blank");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Image */}
      <div className="relative h-44 shrink-0 bg-gray-100">
        {report.image_url ? (
          <img src={report.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-gray-300">No photo</div>
        )}
        <span
          className="absolute top-2 left-2 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: severity?.markerColor || "#6b7280" }}
        >
          {severity?.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3 gap-1.5">
        {/* Title */}
        <p className="text-[13.5px] font-semibold text-gray-900 leading-snug">
          {report.address || "Untitled report"}
        </p>

        {/* Ward + time */}
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          {report.wards && (
            <>
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">Ward {report.wards.ward_number} · {report.wards.name}</span>
            </>
          )}
          <span className="ml-auto shrink-0">{timeAgo(report.created_at)}</span>
        </div>

        {/* Description — only show if it exists */}
        {report.description && (
          <p className="text-[12px] leading-relaxed text-gray-500 line-clamp-2">
            {report.description}
          </p>
        )}

        {/* Accountable section */}
        {reps.length > 0 && (
          <div className="mt-1 rounded-lg bg-gray-50 px-2.5 py-2 border border-gray-100">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              Accountable
            </p>

            {/* Corporators */}
            {corps.length > 0 && (
              <div>
                <p className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Corporators ({corps.length})
                </p>
                {visibleCorps.map((r) => <RepRow key={r.id} rep={r} />)}
                {!expanded && hiddenCount > 0 && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="mt-1 text-[11px] text-green-700 font-medium hover:underline"
                  >
                    +{hiddenCount} more
                  </button>
                )}
              </div>
            )}

            {/* MLA */}
            {(grouped.mla?.length > 0) && (
              <div className={corps.length > 0 ? "mt-2 pt-2 border-t border-gray-200" : ""}>
                <p className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1">MLA</p>
                {grouped.mla.map((r) => <RepRow key={r.id} rep={r} />)}
              </div>
            )}

            {/* MP */}
            {(grouped.mp?.length > 0) && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-[9.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1">MP</p>
                {grouped.mp.map((r) => <RepRow key={r.id} rep={r} />)}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center gap-1 pt-2 border-t border-gray-100">
          <button
            onClick={handleUpvote}
            className={`flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
              liked
                ? "bg-green-50 text-green-700 hover:bg-green-100"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            {upvotes}
          </button>
          <button
            onClick={handleShare}
            className="flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <Share2 className="h-3 w-3" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
