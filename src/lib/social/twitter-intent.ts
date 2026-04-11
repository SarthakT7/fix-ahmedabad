import type { Representative } from "@/types";

interface ShareParams {
  wardName: string;
  wardNumber: number;
  severity: string;
  address?: string;
  representatives: Representative[];
  reportUrl?: string;
}

export function buildTwitterIntent(params: ShareParams): string {
  const { wardName, wardNumber, severity, address, representatives, reportUrl } = params;

  const handles = representatives
    .filter((r) => r.twitter_handle)
    .map((r) => `@${r.twitter_handle}`)
    .join(" ");

  const locationText = address || wardName;

  const text = [
    `🚨 Garbage dump reported in Ward ${wardNumber} (${wardName}), Ahmedabad!`,
    `📍 ${locationText}`,
    `⚠️ Severity: ${severity.charAt(0).toUpperCase() + severity.slice(1)}`,
    "",
    handles ? `${handles} please take action!` : "Authorities, please take action!",
    "",
    "#SwachhAmdavad #CleanAhmedabad #AMC",
    reportUrl || "",
  ]
    .filter(Boolean)
    .join("\n");

  const url = new URL("https://twitter.com/intent/tweet");
  url.searchParams.set("text", text);
  return url.toString();
}
