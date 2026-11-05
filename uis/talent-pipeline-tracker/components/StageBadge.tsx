"use client";

import { getStageLabel, type CandidateStage } from "@/types";

const stageColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  review: "bg-[#92eaff] text-[#0016a2]",
  personal_interview: "bg-[#75d4ff] text-[#0031c4]",
  technical_interview: "bg-[#0069ff] text-white",
  offer_presented: "bg-green-100 text-green-800",
};

export default function StageBadge({
  stage,
  className = "",
}: {
  stage: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stageColors[stage] ?? "bg-gray-100 text-gray-800"} ${className}`}
    >
      {getStageLabel(stage)}
    </span>
  );
}