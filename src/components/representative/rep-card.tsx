"use client";

import { User, ExternalLink } from "lucide-react";
import type { Representative } from "@/types";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface RepCardProps {
  rep: Representative;
}

const roleBadge: Record<string, { label: string; color: string }> = {
  corporator: { label: "Corporator", color: "bg-blue-100 text-blue-700" },
  mla: { label: "MLA", color: "bg-purple-100 text-purple-700" },
  mp: { label: "MP", color: "bg-orange-100 text-orange-700" },
};

export default function RepCard({ rep }: RepCardProps) {
  const badge = roleBadge[rep.role] || { label: rep.role, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100">
        {rep.photo_url ? (
          <img src={rep.photo_url} alt={rep.name} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <User className="h-6 w-6 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{rep.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}>
            {badge.label}
          </span>
          {rep.party && (
            <span className="text-xs text-gray-400">{rep.party}</span>
          )}
        </div>
        {rep.constituency && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{rep.constituency}</p>
        )}
      </div>
      {rep.twitter_handle ? (
        <a
          href={`https://twitter.com/${rep.twitter_handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white"
        >
          <XIcon className="h-4 w-4" />
        </a>
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-300">
          <XIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
