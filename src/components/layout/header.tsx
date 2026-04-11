"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
          <MapPin className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold text-gray-900">
          Swachh Amdavad
        </span>
      </Link>
    </header>
  );
}
