"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ALL_STATUSES, ALL_STAGES, getStatusLabel, getStageLabel } from "@/types";
import { useCallback, useTransition } from "react";

export default function FilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") ?? "";
  const currentStage = searchParams.get("stage") ?? "";
  const currentSearch = searchParams.get("search") ?? "";

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  function updateFilter(key: string, value: string) {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ [key]: value })}`);
    });
  }

  function handleSearch(value: string) {
    // Debounce would be ideal, but for simplicity we update on change
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ search: value })}`);
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search by name or email…"
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20"
        />
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Status filter */}
      <select
        value={currentStatus}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20"
      >
        <option value="">All statuses</option>
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {getStatusLabel(s)}
          </option>
        ))}
      </select>

      {/* Stage filter */}
      <select
        value={currentStage}
        onChange={(e) => updateFilter("stage", e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20"
      >
        <option value="">All stages</option>
        {ALL_STAGES.map((s) => (
          <option key={s} value={s}>
            {getStageLabel(s)}
          </option>
        ))}
      </select>

      {isPending && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#0069ff] border-t-transparent" />
          Updating…
        </div>
      )}
    </div>
  );
}