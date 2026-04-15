"use client";

import { User, Phone, Mail } from "lucide-react";
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

const roleLabel: Record<string, string> = {
  corporator: "Corporator",
  mla: "MLA",
  mp: "MP",
};

export default function RepCard({ rep }: RepCardProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
        {rep.photo_url ? (
          <img src={rep.photo_url} alt={rep.name} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <User className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 truncate">{rep.name}</p>
        <p className="text-[11px] text-gray-400">
          {roleLabel[rep.role] || rep.role}
          {rep.party && ` · ${rep.party}`}
          {rep.constituency && ` · ${rep.constituency}`}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500">
          {rep.twitter_handle && (
            <a
              href={`https://twitter.com/${rep.twitter_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-gray-900"
            >
              <XIcon className="h-3 w-3" />@{rep.twitter_handle}
            </a>
          )}
          {rep.phone && (
            <a
              href={`tel:${rep.phone}`}
              className="inline-flex items-center gap-1 hover:text-gray-900"
            >
              <Phone className="h-3 w-3" />
              {rep.phone}
            </a>
          )}
          {rep.email && (
            <a
              href={`mailto:${rep.email}`}
              className="inline-flex items-center gap-1 hover:text-gray-900"
            >
              <Mail className="h-3 w-3" />
              {rep.email}
            </a>
          )}
          {!rep.twitter_handle && !rep.phone && !rep.email && (
            <span className="text-gray-300">No public contact on file.</span>
          )}
        </div>
      </div>
    </div>
  );
}
