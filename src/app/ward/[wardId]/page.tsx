"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ReportCard, { type ReportCardData } from "@/components/report/report-card";
import RepCard from "@/components/representative/rep-card";
import { supabase } from "@/lib/supabase/client";
import { buildTwitterIntent } from "@/lib/social/twitter-intent";
import type { Ward, Representative } from "@/types";

export default function WardDetailPage() {
  const params = useParams();
  const wardId = params.wardId as string;

  const [ward, setWard] = useState<Ward | null>(null);
  const [reports, setReports] = useState<ReportCardData[]>([]);
  const [reps, setReps] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [wardRes, reportsRes, repsRes] = await Promise.all([
        supabase.from("wards").select("*, zones(name)").eq("id", wardId).single(),
        supabase
          .from("reports")
          .select(
            "*, wards(name, ward_number, ward_representatives(representatives(*)))"
          )
          .eq("ward_id", wardId)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("ward_representatives")
          .select("representatives(*)")
          .eq("ward_id", wardId),
      ]);
      if (wardRes.data) setWard(wardRes.data as unknown as Ward);
      if (reportsRes.data) setReports(reportsRes.data as unknown as ReportCardData[]);
      if (repsRes.data) {
        const roleOrder: Record<string, number> = { corporator: 0, mla: 1, mp: 2 };
        const flat = (repsRes.data as unknown as { representatives: Representative }[])
          .map((r) => r.representatives)
          .filter(Boolean)
          .sort((a, b) => (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9));
        setReps(flat);
      }
      setLoading(false);
    };
    fetchData();
  }, [wardId]);

  const shareUrl = ward
    ? buildTwitterIntent({
        wardName: ward.name,
        wardNumber: ward.ward_number,
        severity: "critical",
        representatives: reps,
      })
    : "";

  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pt-[60px] pb-[68px] md:pb-8">
        <div className="mx-auto max-w-3xl px-4 py-4">
          {loading ? (
            <div className="space-y-3">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />
              <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
            </div>
          ) : ward ? (
            <>
              <Link href="/" className="inline-flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600 mb-3">
                <ArrowLeft className="h-3 w-3" />
                Map
              </Link>

              <div className="flex items-start justify-between mb-5">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Ward {ward.ward_number} &middot; {ward.name}
                  </h1>
                  <p className="text-[12px] text-gray-400">{ward.zone_name || ""} Zone</p>
                </div>
                {reps.some((r) => r.twitter_handle) && (
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 bg-gray-900 text-white text-[12px] font-semibold px-3 py-1.5 rounded-md hover:bg-black transition-colors"
                  >
                    Post on X
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-[1fr_280px]">
                <div>
                  <h2 className="text-[13px] font-semibold text-gray-700 mb-2">
                    Reports
                    <span className="text-gray-400 font-normal ml-1">({reports.length})</span>
                  </h2>
                  <div className="space-y-2.5">
                    {reports.length === 0 ? (
                      <p className="py-10 text-center text-[13px] text-gray-400">
                        No reports in this ward yet.
                      </p>
                    ) : (
                      reports.map((report) => (
                        <ReportCard key={report.id} report={report} />
                      ))
                    )}
                  </div>
                </div>

                {reps.length > 0 && (
                  <div>
                    <h2 className="text-[13px] font-semibold text-gray-700 mb-2">Representatives</h2>
                    <div className="border border-gray-200 rounded-lg px-3">
                      {reps.map((rep) => (
                        <RepCard key={rep.id} rep={rep} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-[13px] text-gray-400 py-16">Ward not found.</div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
