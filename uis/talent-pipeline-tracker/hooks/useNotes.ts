"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchNotes } from "@/lib/api";
import type { Note } from "@/types";

export function useNotes(candidateId: string) {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const requestKey = `${candidateId}:${refreshVersion}`;
  const [result, setResult] = useState<{
    key: string;
    notes: Note[];
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let active = true;

    fetchNotes(candidateId)
      .then((notes) => {
        if (active) setResult({ key: requestKey, notes, error: null });
      })
      .catch((err: unknown) => {
        if (active) {
          setResult({
            key: requestKey,
            notes: [],
            error: err instanceof Error ? err.message : "An unexpected error occurred",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [candidateId, requestKey]);

  const refetch = useCallback(() => {
    setRefreshVersion((version) => version + 1);
  }, []);
  const currentResult = result?.key === requestKey ? result : null;

  return {
    notes: currentResult?.notes ?? [],
    loading: currentResult === null,
    error: currentResult?.error ?? null,
    refetch,
  };
}