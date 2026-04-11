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
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        How bad is it? <span className="text-red-500">*</span>
      </label>
      <div className="space-y-2">
        {SEVERITY_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            className={cn(
              "w-full rounded-xl border-2 p-3 text-left transition-all",
              value === level.value
                ? "border-current shadow-sm"
                : "border-gray-100 bg-white"
            )}
            style={
              value === level.value
                ? { borderColor: level.color, backgroundColor: `${level.color}08` }
                : undefined
            }
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: level.color }}
              />
              <div>
                <p className="font-semibold text-gray-900">{level.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{level.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
