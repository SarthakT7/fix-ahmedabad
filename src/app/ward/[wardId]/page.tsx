"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ReportCard from "@/components/report/report-card";
import RepCard from "@/components/representative/rep-card";
import { supabase } from "@/lib/supabase/client";
import { buildTwitterIntent } from "@/lib/social/twitter-intent";
import type { Ward, Report, Representative } from "@/types";

export default function WardDetailPage() {
  const params = useParams();
  const wardId = params.wardId as string;

  const [ward, setWard] = useState<Ward | null>(null);
  const [reports, setReports] = useState<(Report & { wards: { name: string; ward_number: number } })[]>([]);
  const [reps, setReps] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [wardRes, reportsRes, repsRes] = await Promise.all([
        supabase.from("wards").select("*, zones(name)").eq("id", wardId).single(),
        supabase
          .from("reports")
          .select("*, wards(name, ward_number)")
          .eq("ward_id", wardId)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("representatives")
          .select("*")
          .or(`ward_id.eq.${wardId},role.eq.mla,role.eq.mp`),
      ]);

      if (wardRes.data) setWard(wardRes.data as unknown as Ward);
      if (reportsRes.data) setReports(reportsRes.data as unknown as typeof reports);
      if (repsRes.data) setReps(repsRes.data as Representative[]);
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
              <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
              <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
              <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
            </div>
          ) : ward ? (
            <>
              <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 mb-3 hover:text-gray-700">
                <ArrowLeft className="h-4 w-4" />
                Back to Map
              </Link>

              <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900">
                  Ward {ward.ward_number} — {ward.name}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {ward.zone_name || ""} Zone
                </p>
              </div>

              {/* Tag Politicians */}
              {reps.some((r) => r.twitter_handle) && (
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-black py-3 font-semibold text-white hover:bg-gray-800 active:bg-gray-800 md:w-fit md:px-8"
                >
                  <Share2 className="h-5 w-5" />
                  Tag Your Neta on X
                </a>
              )}

              <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                {/* Reports */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">
                    Reports ({reports.length})
                  </h2>
                  <div className="space-y-3">
                    {reports.length === 0 ? (
                      <p className="py-6 text-center text-sm text-gray-400">
                        No reports in this ward yet.
                      </p>
                    ) : (
                      reports.map((report) => (
                        <ReportCard key={report.id} report={report} />
                      ))
                    )}
                  </div>
                </div>

                {/* Representatives - sidebar on desktop */}
                {reps.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 mb-2">
                      Responsible Representatives
                    </h2>
                    <div className="space-y-2">
                      {reps.map((rep) => (
                        <RepCard key={rep.id} rep={rep} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400">Ward not found.</div>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
