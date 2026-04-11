"use client";

import { SEVERITY_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SeverityPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SeverityPicker({ value, onChange }: SeverityPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-[13px] font-semibold text-gray-700">
        How bad is it? <span className="text-red-500">*</span>
      </label>
      <div className="space-y-1.5">
        {SEVERITY_LEVELS.map((level) => {
          const selected = value === level.value;
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => onChange(level.value)}
              className={cn(
                "w-full rounded-lg border p-2.5 text-left transition-all",
                selected
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: level.markerColor }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-gray-900">{level.label}</span>
                  <span className="text-[11px] text-gray-400 ml-2">{level.description}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
