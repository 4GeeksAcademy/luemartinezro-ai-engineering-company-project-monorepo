"use client";

import { getStatusLabel, type CandidateStatus } from "@/types";

const statusColors: Record<string, string> = {
  received: "bg-[#92eaff] text-[#0016a2]",
  in_progress: "bg-[#75d4ff] text-[#0031c4]",
  selected: "bg-[#0069ff] text-white",
  discarded: "bg-gray-200 text-gray-700",
};

export default function StatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status] ?? "bg-gray-100 text-gray-800"} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}