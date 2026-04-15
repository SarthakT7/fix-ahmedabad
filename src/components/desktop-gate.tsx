"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";

export default function DesktopGate({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile === null) return null; // loading

  if (!isMobile) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-600 text-white">
            <Smartphone className="h-10 w-10" />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            Fix Ahmedabad
          </h1>
          <p className="mb-6 text-gray-600">
            This app is designed for mobile devices. Please open it on your phone for the best experience.
          </p>
          <div className="rounded-xl border border-green-200 bg-white p-6">
            <p className="mb-3 text-sm font-medium text-gray-700">
              Scan to open on your phone
            </p>
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
              QR Code
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Or visit <span className="font-medium text-green-700">fixahm.xyz</span> on your phone
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
