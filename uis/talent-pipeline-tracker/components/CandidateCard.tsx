"use client";

import Link from "next/link";
import type { Candidate } from "@/types";
import StatusBadge from "./StatusBadge";
import StageBadge from "./StageBadge";

export default function CandidateCard({
  candidate,
}: {
  candidate: Candidate;
}) {
  return (
    <Link
      href={`/candidates/${candidate.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#0069ff] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0069ff]/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {candidate.full_name}
          </h3>
          <p className="mt-0.5 truncate text-sm text-gray-500">
            {candidate.position}
          </p>
          <p className="truncate text-sm text-gray-400">{candidate.email}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge status={candidate.status} />
          <StageBadge stage={candidate.stage} />
        </div>
      </div>
    </Link>
  );
}