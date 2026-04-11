"use client";

import dynamic from "next/dynamic";

const GarbageMap = dynamic(() => import("./garbage-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

export default GarbageMap;
