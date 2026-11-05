"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCandidate } from "@/lib/api";
import type { Candidate } from "@/types";

export function useCandidate(id: string) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCandidate(id);
      setCandidate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateCandidate = useCallback((updated: Candidate) => {
    setCandidate(updated);
  }, []);

  return { candidate, loading, error, refetch: load, updateCandidate };
}