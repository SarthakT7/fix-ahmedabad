export const SEVERITY_LEVELS = [
  {
    value: "minor",
    label: "Minor",
    description: "A few bags or scattered litter — fits in a small area (under 1m²)",
    color: "#facc15",
    markerColor: "#eab308",
  },
  {
    value: "moderate",
    label: "Moderate",
    description: "Noticeable heap — roughly the size of an auto-rickshaw (1–5m²)",
    color: "#fb923c",
    markerColor: "#f97316",
  },
  {
    value: "severe",
    label: "Severe",
    description: "Covers a significant area — sidewalk blocked or road edge piled up (5–20m²)",
    color: "#f87171",
    markerColor: "#ef4444",
  },
  {
    value: "critical",
    label: "Critical",
    description: "Massive dump — entire stretch of road or open plot covered (over 20m²)",
    color: "#dc2626",
    markerColor: "#b91c1c",
  },
] as const;

export type Severity = (typeof SEVERITY_LEVELS)[number]["value"];

export const AHMEDABAD_CENTER = { lat: 23.0225, lng: 72.5714 };
export const DEFAULT_ZOOM = 12;

export const ZONES = [
  "Central",
  "East",
  "West",
  "North",
  "South",
  "North West",
  "South West",
] as const;

export const APP_NAME = "Fix Ahmedabad";
export const APP_TAGLINE = "Report garbage. Tag your neta. Fix Ahmedabad.";
