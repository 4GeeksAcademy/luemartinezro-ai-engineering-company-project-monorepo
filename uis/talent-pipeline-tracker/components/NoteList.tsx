"use client";

import { useState } from "react";
import type { Note } from "@/types";
import { deleteNote } from "@/lib/api";
import LoadingSpinner from "./LoadingSpinner";

export default function NoteList({
  notes,
  candidateId,
  loading,
  error,
  onNotesChanged,
}: {
  notes: Note[];
  candidateId: string;
  loading: boolean;
  error: string | null;
  onNotesChanged: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(noteId: string) {
    setDeletingId(noteId);
    try {
      await deleteNote(candidateId, noteId);
      onNotesChanged();
    } catch (err) {
      console.error("Failed to delete note", err);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <LoadingSpinner className="py-6" />;
  }

  if (error) {
    return <p className="text-sm text-red-600">Failed to load notes: {error}</p>;
  }

  if (notes.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        No internal notes yet. Add one above.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li
          key={note.id}
          className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-700">{note.content}</p>
            <p className="mt-1 text-xs text-gray-400">
              {new Date(note.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={() => handleDelete(note.id)}
            disabled={deletingId === note.id}
            className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
            title="Delete note"
          >
            {deletingId === note.id ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}