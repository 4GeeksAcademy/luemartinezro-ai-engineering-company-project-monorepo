"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchNotes } from "@/lib/api";
import type { Note } from "@/types";

export function useNotes(candidateId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotes(candidateId);
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = load;

  return { notes, loading, error, refetch };
}