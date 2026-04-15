"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ReportCard, { type ReportCardData } from "@/components/report/report-card";
import { supabase } from "@/lib/supabase/client";
import { SEVERITY_LEVELS } from "@/lib/constants";

export default function FeedPage() {
  const [reports, setReports] = useState<ReportCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  useEffect(() => {
    const fetchReports = async () => {
      let query = supabase
        .from("reports")
        .select(
          "*, wards(name, ward_number, ward_representatives(representatives(*)))"
        )
        .order("created_at", { ascending: false })
        .limit(50);
      if (severityFilter !== "all") {
        query = query.eq("severity", severityFilter);
      }
      const { data } = await query;
      if (data) setReports(data as unknown as typeof reports);
      setLoading(false);
    };
    fetchReports();
  }, [severityFilter]);

  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pt-[60px] pb-[68px] md:pb-8">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900">Feed</h1>
            <span className="text-[12px] text-gray-400">{reports.length} reports</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3">
            {[{ value: "all", label: "All" }, ...SEVERITY_LEVELS].map((s) => {
              const active = severityFilter === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => setSeverityFilter(s.value)}
                  className={`shrink-0 cursor-pointer px-3 py-1 text-[12px] font-medium rounded-md border transition-colors ${
                    active
                      ? "border-gray-900 bg-gray-900 text-white hover:bg-black"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-4">
          <div className="grid auto-rows-fr items-stretch gap-3 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-lg bg-gray-100" />
              ))
            ) : reports.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <p className="text-[13px] text-gray-400">No reports yet.</p>
              </div>
            ) : (
              reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))
            )}
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
