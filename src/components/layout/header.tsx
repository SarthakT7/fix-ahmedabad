"use client";

import { MapPin, Map, ListOrdered, BarChart3, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Map, label: "Map" },
  { href: "/feed", icon: ListOrdered, label: "Feed" },
  { href: "/stats", icon: BarChart3, label: "Stats" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 md:px-6">
      <div className="flex items-center justify-between h-12 md:h-14">
        <Link href="/" className="flex items-center gap-1.5">
          <MapPin className="h-5 w-5 text-green-600" strokeWidth={2.5} />
          <span className="text-base font-extrabold tracking-tight text-gray-900">
            fix<span className="text-green-600">ahmedabad</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/report"
            className="ml-3 flex items-center gap-1.5 bg-green-600 text-white text-[13px] font-semibold px-3.5 py-1.5 rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Report
          </Link>
        </nav>
      </div>
    </header>
  );
}
