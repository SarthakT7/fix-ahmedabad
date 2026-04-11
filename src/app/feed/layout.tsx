import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports Feed",
  description: "Browse all garbage reports across Ahmedabad's 48 wards. Filter by severity and see what needs attention.",
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
