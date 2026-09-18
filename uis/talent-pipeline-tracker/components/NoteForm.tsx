"use client";

import { useState } from "react";
import { createNote } from "@/lib/api";
import LoadingSpinner from "./LoadingSpinner";

export default function NoteForm({
  candidateId,
  onNoteAdded,
}: {
  candidateId: string;
  onNoteAdded: () => void;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await createNote(candidateId, { content: content.trim() });
      setContent("");
      onNoteAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Add internal note
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Write your notes after a call or interview…"
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20"
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="rounded-lg bg-[#0069ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#0031c4] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0069ff]/30"
      >
        {submitting ? "Adding…" : "Add note"}
      </button>
    </form>
  );
}