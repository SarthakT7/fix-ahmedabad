"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ReportCard from "@/components/report/report-card";
import { supabase } from "@/lib/supabase/client";
import { SEVERITY_LEVELS } from "@/lib/constants";
import type { Report } from "@/types";

export default function FeedPage() {
  const [reports, setReports] = useState<(Report & { wards: { name: string; ward_number: number } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  useEffect(() => {
    const fetchReports = async () => {
      let query = supabase
        .from("reports")
        .select("*, wards(name, ward_number)")
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
          <h1 className="text-xl font-bold text-gray-900 mb-3">Reports</h1>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setSeverityFilter("all")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                severityFilter === "all"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              All
            </button>
            {SEVERITY_LEVELS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSeverityFilter(s.value)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  severityFilter === s.value
                    ? "text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
                style={
                  severityFilter === s.value
                    ? { backgroundColor: s.markerColor }
                    : undefined
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100" />
              ))
            ) : reports.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <p className="text-gray-400">No reports yet. Be the first to report!</p>
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
