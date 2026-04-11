"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { supabase } from "@/lib/supabase/client";
import { SEVERITY_LEVELS } from "@/lib/constants";

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

      setStats({ total: total || 0, open: open || 0, resolved: resolved || 0, bySeverity, topWards });
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pt-[60px] pb-[68px] md:pb-8">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <h1 className="text-lg font-bold text-gray-900 mb-4">Stats</h1>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Numbers row */}
              <div className="flex gap-6">
                <div>
                  <p className="text-3xl font-extrabold text-gray-900 tabular-nums">{stats.total}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">total reports</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-orange-500 tabular-nums">{stats.open}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">open</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-green-600 tabular-nums">{stats.resolved}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">resolved</p>
                </div>
              </div>

              {/* Severity bars */}
              <div>
                <h2 className="text-[13px] font-semibold text-gray-700 mb-2">By severity</h2>
                <div className="space-y-1.5">
                  {SEVERITY_LEVELS.map((level) => {
                    const count = stats.bySeverity[level.value] || 0;
                    const pct = stats.total ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={level.value} className="flex items-center gap-2">
                        <span className="text-[12px] text-gray-500 w-16 shrink-0">{level.label}</span>
                        <div className="flex-1 h-5 rounded bg-gray-100 overflow-hidden relative">
                          <div
                            className="h-full rounded transition-all"
                            style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: level.markerColor }}
                          />
                        </div>
                        <span className="text-[12px] font-medium text-gray-900 w-6 text-right tabular-nums">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top wards */}
              {stats.topWards.length > 0 && (
                <div>
                  <h2 className="text-[13px] font-semibold text-gray-700 mb-2">Worst wards</h2>
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {stats.topWards.map((ward, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-mono text-gray-400 w-4">{i + 1}</span>
                          <span className="text-[13px] text-gray-900">
                            Ward {ward.ward_number} &middot; {ward.name}
                          </span>
                        </div>
                        <span className="text-[13px] font-semibold text-gray-900 tabular-nums">{ward.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
