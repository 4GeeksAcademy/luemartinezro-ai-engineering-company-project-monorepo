"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCandidate } from "@/lib/api";
import type { Candidate } from "@/types";

export function useCandidate(id: string) {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const requestKey = `${id}:${refreshVersion}`;
  const [result, setResult] = useState<{
    key: string;
    candidate: Candidate | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let active = true;

    fetchCandidate(id)
      .then((candidate) => {
        if (active) setResult({ key: requestKey, candidate, error: null });
      })
      .catch((err: unknown) => {
        if (active) {
          setResult({
            key: requestKey,
            candidate: null,
            error: err instanceof Error ? err.message : "An unexpected error occurred",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id, requestKey]);

  const refetch = useCallback(() => {
    setRefreshVersion((version) => version + 1);
  }, []);
  const currentResult = result?.key === requestKey ? result : null;
  const updateCandidate = useCallback((updated: Candidate) => {
    setResult((previous) => previous?.key === requestKey
      ? { ...previous, candidate: updated }
      : previous);
  }, [requestKey]);

  return {
    candidate: currentResult?.candidate ?? null,
    loading: currentResult === null,
    error: currentResult?.error ?? null,
    refetch,
    updateCandidate,
  };
}