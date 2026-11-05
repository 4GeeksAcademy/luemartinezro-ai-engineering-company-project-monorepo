"use client";

import { use, useCallback } from "react";
import Link from "next/link";
import { useCandidate } from "@/hooks/useCandidate";
import { useNotes } from "@/hooks/useNotes";
import CandidateDetail from "@/components/CandidateDetail";
import type { Candidate } from "@/types";

export default function CandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { candidate, loading, error, refetch: refetchCandidate, updateCandidate } = useCandidate(id);
  const { notes, loading: notesLoading, error: notesError, refetch: refetchNotes } = useNotes(id);

  const handleCandidateUpdated = useCallback(
    (updated: Candidate) => {
      updateCandidate(updated);
    },
    [updateCandidate]
  );

  const handleNotesChanged = useCallback(() => {
    refetchNotes();
    refetchCandidate();
  }, [refetchNotes, refetchCandidate]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-[#0069ff] hover:text-[#0031c4]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to candidate list
      </Link>

      <CandidateDetail
        candidate={candidate}
        notes={notes}
        loading={loading}
        notesLoading={notesLoading}
        error={error}
        notesError={notesError}
        onRetry={() => {
          refetchCandidate();
          refetchNotes();
        }}
        onCandidateUpdated={handleCandidateUpdated}
        onNotesChanged={handleNotesChanged}
      />
    </div>
  );
}