import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
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
      if (!wardCounts[r.ward_id]) {
        wardCounts[r.ward_id] = { ward_number: r.wards.ward_number, name: r.wards.name, count: 0 };
      }
      wardCounts[r.ward_id].count++;
    }
  });

  const topWards = Object.values(wardCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return NextResponse.json({
    total: total || 0,
    open: open || 0,
    resolved: resolved || 0,
    bySeverity,
    topWards,
  });
}
