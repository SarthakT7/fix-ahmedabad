// Lightweight, cheap image gate for garbage reports.
//
// We run a single CLIP pass on Replicate (andreasjansson/clip-features) and
// compare the photo's embedding against two buckets of text labels: "this is
// garbage" vs "this is not garbage" (screenshot, document, selfie, etc.).
//
// The filter is intentionally MINIMAL and lenient — a blurry, low-quality, or
// badly-framed garbage photo still scores far higher on the garbage labels than
// on "screenshot/document", so it passes. We only reject the obvious junk.
//
// One CLIP pass on cheap hardware costs a fraction of a cent per image.

// Pinned version of andreasjansson/clip-features (clip-vit-large-patch14).
const REPLICATE_VERSION =
  "75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a";

const POSITIVE_LABELS = [
  "a photo of garbage or trash",
  "litter and waste scattered on the street",
  "a pile of rubbish or a garbage dump",
  "an overflowing dustbin or trash bin",
  "a dirty area with scattered waste or debris",
];

const NEGATIVE_LABELS = [
  "a screenshot of a phone or computer screen",
  "a document or a page full of text",
  "a plain solid color image with nothing in it",
  "a selfie or a portrait of a person",
  "a meme or a digital graphic",
];

// Positive labels get a small bonus so borderline / low-quality garbage photos
// are allowed. Higher = more lenient (lets more through).
const LENIENCY_BIAS = 0.02;

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export interface ImageCheck {
  allow: boolean;
  reason: "ok" | "not-garbage" | "ai-disabled" | "ai-error";
}

/**
 * Returns whether an image looks like a genuine garbage report.
 * Fails OPEN: on any error or misconfiguration the image is allowed, so the
 * reporting flow never breaks because of the AI layer.
 */
export async function checkGarbageImage(imageUrl: string): Promise<ImageCheck> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.warn("[image-gate] no REPLICATE_API_TOKEN — allowing image");
    return { allow: true, reason: "ai-disabled" };
  }

  try {
    const labels = [...POSITIVE_LABELS, ...NEGATIVE_LABELS];
    const inputs = [...labels, imageUrl].join("\n");

    const res = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        // Wait synchronously for the result (max 60s). A cold model boot can
        // exceed this, so we fall back to polling below.
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        version: REPLICATE_VERSION,
        input: { inputs },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[image-gate] replicate POST failed: ${res.status} ${text}`);
      return { allow: true, reason: "ai-error" };
    }

    let prediction = await res.json();

    // If the model was still cold-booting when "wait" elapsed, poll until done.
    const pollUrl: string | undefined = prediction?.urls?.get;
    let polls = 0;
    while (
      pollUrl &&
      (prediction?.status === "starting" || prediction?.status === "processing") &&
      polls < 30
    ) {
      await new Promise((r) => setTimeout(r, 2000));
      const pr = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      prediction = await pr.json();
      polls++;
    }

    if (prediction?.status !== "succeeded") {
      console.error(
        `[image-gate] prediction not succeeded: status=${prediction?.status} error=${prediction?.error}`
      );
      return { allow: true, reason: "ai-error" };
    }

    const output: { input: string; embedding: number[] }[] = prediction?.output;
    if (!Array.isArray(output)) {
      console.error("[image-gate] output not an array");
      return { allow: true, reason: "ai-error" };
    }

    const byInput = new Map(output.map((o) => [o.input, o.embedding]));
    const imgEmb = byInput.get(imageUrl);
    if (!imgEmb) {
      console.error("[image-gate] no embedding for image url in output");
      return { allow: true, reason: "ai-error" };
    }

    let maxPos = -Infinity;
    let maxNeg = -Infinity;
    for (const l of POSITIVE_LABELS) {
      const e = byInput.get(l);
      if (e) maxPos = Math.max(maxPos, cosine(imgEmb, e));
    }
    for (const l of NEGATIVE_LABELS) {
      const e = byInput.get(l);
      if (e) maxNeg = Math.max(maxNeg, cosine(imgEmb, e));
    }

    if (maxPos === -Infinity || maxNeg === -Infinity) {
      console.error("[image-gate] missing label embeddings");
      return { allow: true, reason: "ai-error" };
    }

    const allow = maxPos + LENIENCY_BIAS >= maxNeg;
    console.log(
      `[image-gate] maxPos=${maxPos.toFixed(4)} maxNeg=${maxNeg.toFixed(
        4
      )} bias=${LENIENCY_BIAS} -> ${allow ? "ALLOW" : "REJECT"}`
    );
    return { allow, reason: allow ? "ok" : "not-garbage" };
  } catch (err) {
    console.error("[image-gate] exception:", err);
    return { allow: true, reason: "ai-error" };
  }
}
