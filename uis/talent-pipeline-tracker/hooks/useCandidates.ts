"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCandidates, type FetchCandidatesParams } from "@/lib/api";
import type { Candidate } from "@/types";

export function useCandidates(params: FetchCandidatesParams) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCandidates(params);
      setCandidates(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    load();
  }, [load]);

  return { candidates, total, loading, error, refetch: load };
}