"use client";

import { useState } from "react";
import Link from "next/link";
import type { Candidate, Note } from "@/types";
import { getStatusLabel, getStageLabel } from "@/types";
import StatusBadge from "./StatusBadge";
import StageBadge from "./StageBadge";
import StatusControl from "./StatusControl";
import StageControl from "./StageControl";
import NoteList from "./NoteList";
import NoteForm from "./NoteForm";
import LoadingSpinner from "./LoadingSpinner";
import CandidateForm from "./CandidateForm";

export default function CandidateDetail({
  candidate,
  notes,
  loading,
  notesLoading,
  error,
  notesError,
  onRetry,
  onCandidateUpdated,
  onNotesChanged,
}: {
  candidate: Candidate | null;
  notes: Note[];
  loading: boolean;
  notesLoading: boolean;
  error: string | null;
  notesError: string | null;
  onRetry?: () => void;
  onCandidateUpdated: (updated: Candidate) => void;
  onNotesChanged: () => void;
}) {
  const [showEditForm, setShowEditForm] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16">
        <LoadingSpinner />
        <p className="mt-2 text-sm text-gray-500">Loading candidate details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-800">
            Unable to load candidate
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

  if (!candidate) {
    return null;
  }

  const fields: { label: string; value: string | number | null; isUrl?: boolean }[] = [
    { label: "Full name", value: candidate.full_name },
    { label: "Email", value: candidate.email },
    { label: "Phone", value: candidate.phone },
    { label: "Position", value: candidate.position },
    {
      label: "LinkedIn",
      value: candidate.linkedin_url,
      isUrl: true,
    },
    {
      label: "CV",
      value: candidate.cv_url,
      isUrl: true,
    },
    { label: "Years of experience", value: candidate.experience_years },
    {
      label: "Applied at",
      value: new Date(candidate.applied_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {candidate.full_name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{candidate.position}</p>
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={candidate.status} />
          <StageBadge stage={candidate.stage} />
        </div>
        <button
          onClick={() => setShowEditForm(true)}
          className="mt-3 inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0069ff]/30"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit data
        </button>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Candidate Data
              </h2>
              <button
                onClick={() => setShowEditForm(false)}
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
              candidate={candidate}
              onSuccess={(updated) => {
                onCandidateUpdated(updated);
                setShowEditForm(false);
              }}
              onCancel={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}

      {/* Info grid */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="divide-y divide-gray-200">
          {fields.map((field) => (
            <div
              key={field.label}
              className="grid grid-cols-3 gap-4 px-4 py-3 sm:px-6"
            >
              <dt className="text-sm font-medium text-gray-500">
                {field.label}
              </dt>
              <dd className="col-span-2 text-sm text-gray-900">
                {field.value !== null && field.value !== "" ? (
                  field.isUrl ? (
                    <a
                      href={field.value as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0069ff] hover:underline break-all"
                    >
                      {field.value as string}
                    </a>
                  ) : (
                    field.value
                  )
                ) : (
                  <span className="text-gray-400">&mdash;</span>
                )}
              </dd>
            </div>
          ))}
        </div>
      </div>

      {/* Status and Stage Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <StatusControl
            candidate={candidate}
            onUpdated={onCandidateUpdated}
          />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <StageControl
            candidate={candidate}
            onUpdated={onCandidateUpdated}
          />
        </div>
      </div>

      {/* Notes Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Internal Notes
        </h2>
        <div className="space-y-6">
          <NoteForm candidateId={candidate.id} onNoteAdded={onNotesChanged} />
          <NoteList
            notes={notes}
            candidateId={candidate.id}
            loading={notesLoading}
            error={notesError}
            onNotesChanged={onNotesChanged}
          />
        </div>
      </div>
    </div>
  );
}