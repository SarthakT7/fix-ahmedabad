"use client";

import { MapPin, Map, ListOrdered, BarChart3, PlusCircle } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 md:px-6 py-3">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
          <MapPin className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold text-gray-900">
          Swachh Amdavad
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/report"
          className="ml-2 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          <PlusCircle className="h-4 w-4" />
          Report Garbage
        </Link>
      </nav>
    </header>
  );
}
