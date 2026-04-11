"use client";

import { useState, useEffect } from "react";
import { X, Camera, MapPin, Share2 } from "lucide-react";
import Link from "next/link";

const DISMISSED_KEY = "swachh_intro_dismissed";

export default function IntroBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISSED_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center md:justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={dismiss} />

      {/* Card */}
      <div className="relative w-full md:max-w-sm mx-auto bg-white rounded-t-2xl md:rounded-2xl p-5 pb-6 md:p-6 shadow-xl">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4">
          <h2 className="text-[17px] font-bold text-gray-900 leading-tight">
            Ahmedabad has a garbage problem.
          </h2>
          <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
            We&apos;re mapping every dump across 48 wards so authorities can&apos;t look away.
          </p>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <Camera className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">Snap & report</p>
              <p className="text-[11px] text-gray-400">Photo + location. Takes 30 seconds.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <MapPin className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">We find your ward & neta</p>
              <p className="text-[11px] text-gray-400">Auto-detects your MLA, MP, and corporator.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <Share2 className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">Tag them publicly</p>
              <p className="text-[11px] text-gray-400">One-tap post on X that @-tags your representatives.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/report"
            className="flex-1 bg-green-600 text-white text-[13px] font-semibold py-2.5 rounded-lg text-center hover:bg-green-700 transition-colors"
          >
            Report Garbage
          </Link>
          <button
            onClick={dismiss}
            className="px-4 py-2.5 text-[13px] font-medium text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Explore map
          </button>
        </div>
      </div>
    </div>
  );
}
