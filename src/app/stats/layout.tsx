import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Ahmedabad garbage reporting dashboard. See total reports, severity breakdown, and most affected wards.",
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
