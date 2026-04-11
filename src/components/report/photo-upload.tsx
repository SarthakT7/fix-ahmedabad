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
      canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", 0.8);
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
      const path = `reports/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage
        .from("report-images")
        .upload(path, compressed, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("report-images").getPublicUrl(path);
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
        <label className="text-[13px] font-semibold text-gray-700">Photo</label>
        <div className="relative rounded-lg overflow-hidden">
          <img src={value} alt="Report photo" className="h-36 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-[13px] font-semibold text-gray-700">
        Photo <span className="text-red-500">*</span>
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white p-4 text-left transition-colors hover:border-gray-400 active:bg-gray-50"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <Camera className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <div>
          <p className="text-[13px] font-medium text-gray-900">
            {uploading ? "Uploading..." : "Add a photo"}
          </p>
          <p className="text-[11px] text-gray-400">Makes your report 10x more credible</p>
        </div>
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
