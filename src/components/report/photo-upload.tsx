"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface PhotoUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    img.onload = () => {
      const maxWidth = 1200;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(blob || file),
        "image/jpeg",
        0.8
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

export default function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const ext = "jpg";
      const path = `reports/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("report-images")
        .upload(path, compressed, { contentType: "image/jpeg" });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("report-images")
        .getPublicUrl(path);

      onChange(urlData.publicUrl);
    } catch {
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Photo
        </label>
        <div className="relative">
          <img
            src={value}
            alt="Report photo"
            className="h-40 w-full rounded-xl object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Photo <span className="text-red-500">*</span>
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-gray-500 transition-colors active:bg-gray-100"
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        ) : (
          <Camera className="h-8 w-8" />
        )}
        <span className="font-medium">
          {uploading ? "Uploading..." : "Take a Photo"}
        </span>
        <span className="text-xs text-gray-400">
          A photo makes your report 10x more credible
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
