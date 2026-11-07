"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCandidates, type FetchCandidatesParams } from "@/lib/api";
import type { Candidate } from "@/types";

export function useCandidates(params: FetchCandidatesParams) {
  const { status, stage, search, page, limit } = params;
  const [refreshVersion, setRefreshVersion] = useState(0);
  const requestKey = JSON.stringify([
    status,
    stage,
    search,
    page,
    limit,
    refreshVersion,
  ]);
  const [result, setResult] = useState<{
    key: string;
    candidates: Candidate[];
    total: number;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let active = true;

    fetchCandidates({ status, stage, search, page, limit })
      .then((response) => {
        if (active) {
          setResult({
            key: requestKey,
            candidates: response.data,
            total: response.total,
            error: null,
          });
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setResult({
            key: requestKey,
            candidates: [],
            total: 0,
            error: err instanceof Error ? err.message : "An unexpected error occurred",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [status, stage, search, page, limit, requestKey]);

  const refetch = useCallback(() => {
    setRefreshVersion((version) => version + 1);
  }, []);

  const currentResult = result?.key === requestKey ? result : null;

  return {
    candidates: currentResult?.candidates ?? [],
    total: currentResult?.total ?? 0,
    loading: currentResult === null,
    error: currentResult?.error ?? null,
    refetch,
  };
}