"use client";

import { Map, ListOrdered, BarChart3, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Map, label: "Map" },
  { href: "/feed", icon: ListOrdered, label: "Feed" },
  { href: "/stats", icon: BarChart3, label: "Stats" },
  { href: "/report", icon: PlusCircle, label: "Report" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isReport = item.href === "/report";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isReport
                  ? "text-green-600 font-semibold"
                  : isActive
                    ? "text-green-600"
                    : "text-gray-400"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6",
                  isReport && "h-7 w-7"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
