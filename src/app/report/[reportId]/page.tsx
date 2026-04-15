"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Phone, Mail, Share2, ArrowUp } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { SEVERITY_LEVELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { buildTwitterIntent } from "@/lib/social/twitter-intent";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import type { Representative } from "@/types";
import type { ReportCardData } from "@/components/report/report-card";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const roleOrder: Record<string, number> = { corporator: 0, mla: 1, mp: 2 };
const roleLabel: Record<string, string> = { corporator: "Corporator", mla: "MLA", mp: "MP" };

const partyColor: Record<string, string> = {
  BJP:   "bg-orange-50 text-orange-700 border-orange-200",
  INC:   "bg-blue-50 text-blue-700 border-blue-200",
  AIMIM: "bg-green-50 text-green-700 border-green-200",
  IND:   "bg-gray-50 text-gray-500 border-gray-200",
  AAP:   "bg-sky-50 text-sky-700 border-sky-200",
};

function getFingerprint(): string {
  const raw = `${navigator.userAgent}|${navigator.language}|${screen.width}x${screen.height}|${new Date().getTimezoneOffset()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) { hash = (hash << 5) - hash + raw.charCodeAt(i); hash |= 0; }
  return hash.toString(36);
}

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<ReportCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upvotes, setUpvotes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    supabase
      .from("reports")
      .select("*, wards(name, ward_number, ward_representatives(representatives(*)))")
      .eq("id", reportId)
      .single()
      .then(({ data }) => {
        if (data) { setReport(data as unknown as ReportCardData); setUpvotes((data as any).upvotes || 0); }
        setLoading(false);
      });
  }, [reportId]);

  if (loading) return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 pt-[60px] pb-[68px] md:pb-8">
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
          <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-6 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>
      </main>
    </div>
  );

  if (!report) return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 pt-[60px] flex items-center justify-center">
        <p className="text-[13px] text-gray-400">Report not found.</p>
      </main>
    </div>
  );

  const severity = SEVERITY_LEVELS.find((s) => s.value === report.severity);
  const reps = (report.wards?.ward_representatives || [])
    .map((wr) => wr.representatives).filter(Boolean)
    .sort((a, b) => (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9));

  const grouped = ["corporator", "mla", "mp"].map((role) => ({
    role,
    label: roleLabel[role],
    members: reps.filter((r) => r.role === role),
  })).filter((g) => g.members.length > 0);

  const twitterUrl = buildTwitterIntent({
    wardName: report.wards?.name || "",
    wardNumber: report.wards?.ward_number || 0,
    severity: report.severity,
    address: report.address || undefined,
    representatives: reps,
  });

  const handleUpvote = async () => {
    if (liked) return;
    const fp = getFingerprint();
    const { error } = await supabase.from("report_upvotes").insert({ report_id: report.id, fingerprint: fp });
    if (error) { if (error.code === "23505") setLiked(true); return; }
    await supabase.from("reports").update({ upvotes: upvotes + 1 }).eq("id", report.id);
    setUpvotes((p) => p + 1);
    setLiked(true);
  };

  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pt-[60px] pb-[68px] md:pb-8">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          {/* Image */}
          {report.image_url && (
            <div className="overflow-hidden rounded-xl mb-4">
              <img src={report.image_url} alt="" className="w-full object-cover max-h-80" />
            </div>
          )}

          {/* Severity + status */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: severity?.markerColor || "#6b7280" }}
            >
              {severity?.label}
            </span>
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              {report.status?.replace("_", " ")}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[18px] font-bold text-gray-900 leading-snug mb-1">
            {report.address || "Untitled report"}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-gray-400 mb-3">
            {report.wards && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Ward {report.wards.ward_number} · {report.wards.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(report.created_at)}
            </span>
          </div>

          {/* Description */}
          {report.description && (
            <p className="text-[14px] text-gray-600 leading-relaxed mb-4 border-l-2 border-gray-200 pl-3">
              {report.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mb-6">
            <button onClick={handleUpvote}
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer ${
                liked
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}>
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
              {upvotes} upvotes
            </button>
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              <XIcon className="h-3.5 w-3.5" />
              Post on X
            </a>
            <button onClick={() => { window.open(twitterUrl, "_blank"); }}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>

          {/* Representatives */}
          {grouped.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold text-gray-900 mb-3">Accountable representatives</h2>
              <div className="space-y-4">
                {grouped.map(({ role, label, members }) => (
                  <div key={role}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{label}s</p>
                    <div className="space-y-2">
                      {members.map((rep) => (
                        <div key={rep.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[13px] font-semibold text-gray-900">{rep.name}</p>
                              {rep.party && (
                                <span className={`rounded border px-1.5 py-0 text-[10px] font-bold ${partyColor[rep.party] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
                                  {rep.party}
                                </span>
                              )}
                            </div>
                            {rep.constituency && (
                              <p className="text-[11px] text-gray-400 mt-0.5">{rep.constituency}</p>
                            )}
                          </div>
                          {/* Contact icons */}
                          <div className="flex shrink-0 items-center gap-1.5 mt-0.5">
                            {rep.phone && (
                              <a href={`tel:${rep.phone.split(",")[0].trim()}`} title={rep.phone}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors">
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                            )}
                            {rep.email && (
                              <a href={`mailto:${rep.email}`} title={rep.email}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors">
                                <Mail className="h-3.5 w-3.5" />
                              </a>
                            )}
                            {rep.twitter_handle && (
                              <a href={`https://twitter.com/${rep.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                                title={`@${rep.twitter_handle}`}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors">
                                <XIcon className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
