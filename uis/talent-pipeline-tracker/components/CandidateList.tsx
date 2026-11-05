"use client";

import type { Candidate } from "@/types";
import CandidateCard from "./CandidateCard";
import LoadingSpinner from "./LoadingSpinner";

export default function CandidateList({
  candidates,
  loading,
  error,
  onRetry,
}: {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center py-16">
        <LoadingSpinner />
        <p className="mt-2 text-sm text-gray-500">Loading candidates…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-800">
            Unable to load candidates
          </p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center py-16">
        <svg
          className="h-12 w-12 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="mt-4 text-sm font-medium text-gray-500">
          No candidates match your filters
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {candidates.map((candidate) => (
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </div>
  );
}