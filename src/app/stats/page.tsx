"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { supabase } from "@/lib/supabase/client";
import { SEVERITY_LEVELS } from "@/lib/constants";
import { FileWarning, MapPin, AlertTriangle, CheckCircle } from "lucide-react";

interface Stats {
  total: number;
  open: number;
  resolved: number;
  bySeverity: Record<string, number>;
  topWards: { ward_number: number; name: string; count: number }[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: total },
        { count: open },
        { count: resolved },
        { data: reports },
      ] = await Promise.all([
        supabase.from("reports").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "resolved"),
        supabase.from("reports").select("severity, ward_id, wards(ward_number, name)"),
      ]);

      const bySeverity: Record<string, number> = {};
      const wardCounts: Record<string, { ward_number: number; name: string; count: number }> = {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (reports || []).forEach((r: any) => {
        bySeverity[r.severity] = (bySeverity[r.severity] || 0) + 1;
        if (r.wards) {
          const key = r.ward_id;
          if (!wardCounts[key]) {
            wardCounts[key] = { ward_number: r.wards.ward_number, name: r.wards.name, count: 0 };
          }
          wardCounts[key].count++;
        }
      });

      const topWards = Object.values(wardCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        total: total || 0,
        open: open || 0,
        resolved: resolved || 0,
        bySeverity,
        topWards,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pt-[60px] pb-[68px] md:pb-8">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Dashboard</h1>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-green-50 p-4">
                  <FileWarning className="h-6 w-6 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">Total Reports</p>
                </div>
                <div className="rounded-xl bg-orange-50 p-4">
                  <AlertTriangle className="h-6 w-6 text-orange-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                  <p className="text-xs text-gray-500">Open</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-4">
                  <CheckCircle className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                  <p className="text-xs text-gray-500">Resolved</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-4">
                  <MapPin className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.topWards.length}</p>
                  <p className="text-xs text-gray-500">Affected Wards</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Severity Breakdown */}
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">By Severity</h2>
                  <div className="space-y-2">
                    {SEVERITY_LEVELS.map((level) => {
                      const count = stats.bySeverity[level.value] || 0;
                      const pct = stats.total ? (count / stats.total) * 100 : 0;
                      return (
                        <div key={level.value} className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: level.markerColor }} />
                          <span className="text-sm text-gray-700 w-20">{level.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: level.markerColor }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Wards */}
                {stats.topWards.length > 0 && (
                  <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3">Most Affected Wards</h2>
                    <div className="space-y-2">
                      {stats.topWards.map((ward, i) => (
                        <div key={i} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                              {i + 1}
                            </span>
                            <span className="text-sm text-gray-700">
                              Ward {ward.ward_number} — {ward.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{ward.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
