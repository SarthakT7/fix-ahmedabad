"use client";

import { Map, ListOrdered, BarChart3, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", icon: Map, label: "Map" },
  { href: "/feed", icon: ListOrdered, label: "Feed" },
  { href: "/report", icon: Plus, label: "Report", accent: true },
  { href: "/stats", icon: BarChart3, label: "Stats" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-end justify-around px-2 pt-1.5 pb-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          if (tab.accent) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center -mt-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-white shadow-md shadow-green-600/30">
                  <tab.icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-medium text-green-600 mt-0.5">{tab.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center py-1"
            >
              <tab.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-gray-900" : "text-gray-400"
                )}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span
                className={cn(
                  "text-[10px] mt-0.5",
                  isActive ? "font-semibold text-gray-900" : "text-gray-400"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
