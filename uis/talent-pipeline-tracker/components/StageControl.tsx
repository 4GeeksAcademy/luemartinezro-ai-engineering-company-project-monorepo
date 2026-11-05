"use client";

import { useState } from "react";
import { patchCandidate } from "@/lib/api";
import { ALL_STAGES, getStageLabel, type CandidateStage, type Candidate } from "@/types";

export default function StageControl({
  candidate,
  onUpdated,
}: {
  candidate: Candidate;
  onUpdated: (updated: Candidate) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(newStage: string) {
    if (newStage === candidate.stage) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await patchCandidate(candidate.id, {
        stage: newStage as CandidateStage,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stage");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Stage</label>
      <div className="mt-1 flex items-center gap-2">
        <select
          value={candidate.stage}
          onChange={(e) => handleChange(e.target.value)}
          disabled={updating}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20 disabled:opacity-60"
        >
          {ALL_STAGES.map((s) => (
            <option key={s} value={s}>
              {getStageLabel(s)}
            </option>
          ))}
        </select>
        {updating && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0069ff] border-t-transparent" />
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}