import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Simple in-memory rate limit
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 3600000 }); // 1 hour window
    return false;
  }

  if (entry.count >= 10) return true; // max 10 reports per hour
  entry.count++;
  return false;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wardId = searchParams.get("ward_id");
  const severity = searchParams.get("severity");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  let query = supabase
    .from("reports")
    .select("*, wards(name, ward_number)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (wardId) query = query.eq("ward_id", wardId);
  if (severity) query = query.eq("severity", severity);
  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many reports. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { ward_id, latitude, longitude, address, severity, description, image_url } = body;

  if (!ward_id || !severity || !latitude || !longitude) {
    return NextResponse.json(
      { error: "Missing required fields: ward_id, severity, latitude, longitude" },
      { status: 400 }
    );
  }

  const validSeverities = ["minor", "moderate", "severe", "critical"];
  if (!validSeverities.includes(severity)) {
    return NextResponse.json(
      { error: "Invalid severity level" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      ward_id,
      latitude,
      longitude,
      address: address || null,
      severity,
      description: description || null,
      image_url: image_url || null,
      status: "open",
    })
    .select("*, wards(name, ward_number)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
