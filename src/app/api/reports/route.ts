import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkGarbageImage } from "@/lib/ai/classify-image";

// Prefer the service-role key so inserts succeed even if the reports table is
// locked down to server-only writes. Falls back to the anon key in dev.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const REPORT_IMAGES_BUCKET = "report-images";

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

// Pull the storage object path out of a public image URL so we can delete
// rejected uploads (".../object/public/report-images/reports/abc.jpg").
function storagePathFromUrl(url: string): string | null {
  const marker = `/${REPORT_IMAGES_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return url.slice(i + marker.length);
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

  if (!ward_id || !severity || latitude == null || longitude == null) {
    return NextResponse.json(
      { error: "Missing required fields: ward_id, severity, latitude, longitude" },
      { status: 400 }
    );
  }

  const validSeverities = ["minor", "moderate", "severe", "critical"];
  if (!validSeverities.includes(severity)) {
    return NextResponse.json({ error: "Invalid severity level" }, { status: 400 });
  }

  if (!image_url) {
    return NextResponse.json({ error: "A photo is required" }, { status: 400 });
  }

  // Minimal AI gate: reject obvious non-garbage images (screenshots, memes,
  // solid colors). Fails open — a network/AI error lets the report through.
  const check = await checkGarbageImage(image_url);
  if (!check.allow) {
    const path = storagePathFromUrl(image_url);
    if (path) await supabase.storage.from(REPORT_IMAGES_BUCKET).remove([path]);
    return NextResponse.json(
      {
        error:
          "That photo doesn't look like a garbage report. Please upload a clear photo of the actual garbage or dumping spot.",
        code: "image_rejected",
      },
      { status: 422 }
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
      image_url,
      status: "open",
    })
    .select("*, wards(name, ward_number)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
