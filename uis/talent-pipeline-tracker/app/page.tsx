"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useCandidates } from "@/hooks/useCandidates";
import FilterBar from "@/components/FilterBar";
import CandidateList from "@/components/CandidateList";
import CandidateForm from "@/components/CandidateForm";
import type { Candidate } from "@/types";

function CandidatesPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? undefined;
  const stage = searchParams.get("stage") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const { candidates, total, loading, error, refetch } = useCandidates({
    status,
    stage,
    search,
  });

  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateSuccess = useCallback(
    (_candidate: Candidate) => {
      setShowCreateForm(false);
      refetch();
    },
    [refetch]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Candidate Pipeline
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} candidate{total !== 1 ? "s" : ""} — Executive Assistant,
            Austin headquarters
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0069ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#0031c4] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/30"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Register candidate
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6">
        <FilterBar />
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Register New Candidate
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <CandidateForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Candidate list */}
      <div className="mt-6">
        <CandidateList
          candidates={candidates}
          loading={loading}
          error={error}
          onRetry={refetch}
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0069ff] border-t-transparent" /></div>}>
      <CandidatesPage />
    </Suspense>
  );
}
