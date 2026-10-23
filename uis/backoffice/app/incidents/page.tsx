"use client";

import { useCallback, useState, useRef, useEffect } from "react";

// ── Types matching the API response ────────────────────────────────────────

interface RuleCounts {
  invalid_or_missing_clinic_id: number;
  country_clinic_mismatch: number;
  invalid_or_missing_category: number;
  empty_description: number;
  missing_patient_id: number;
  closed_case_no_score: number;
  satisfaction_score_out_of_range: number;
}

interface SatisfactionDistribution {
  score_1: number;
  score_2: number;
  score_3: number;
  score_4: number;
  score_5: number;
}

interface AnalysisResult {
  filename: string;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  rule_counts: RuleCounts;
  category_counts: Record<string, number>;
  status_counts: Record<string, number>;
  country_counts: Record<string, number>;
  scored_cases: number;
  average_satisfaction: number;
  satisfaction_distribution: SatisfactionDistribution;
}

type PageState = "idle" | "uploading" | "success" | "error";

// ── Helpers ────────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:8000";

const RULE_LABELS: Record<keyof RuleCounts, string> = {
  invalid_or_missing_clinic_id: "Invalid or missing clinic ID",
  country_clinic_mismatch: "Country/clinic mismatch",
  invalid_or_missing_category: "Invalid or missing category",
  empty_description: "Empty or short description",
  missing_patient_id: "Missing patient ID",
  closed_case_no_score: "Closed case without score",
  satisfaction_score_out_of_range: "Satisfaction score out of range",
};

const RULE_ICONS: Record<keyof RuleCounts, string> = {
  invalid_or_missing_clinic_id: "🏥",
  country_clinic_mismatch: "🌍",
  invalid_or_missing_category: "📂",
  empty_description: "📝",
  missing_patient_id: "🆔",
  closed_case_no_score: "🔒",
  satisfaction_score_out_of_range: "⭐",
};

const CATEGORY_COLORS: Record<string, string> = {
  APPOINTMENT: "bg-[#92eaff] text-[#0031c4]",
  BILLING: "bg-[#75d4ff] text-[#0031c4]",
  CLINICAL_CARE: "bg-[#0069ff] text-white",
  ACCESSIBILITY: "bg-[#92eaff] text-[#0031c4]",
  ADMINISTRATIVE: "bg-[#75d4ff] text-[#0031c4]",
};

const CATEGORY_ICONS: Record<string, string> = {
  APPOINTMENT: "📅",
  BILLING: "💰",
  CLINICAL_CARE: "🩺",
  ACCESSIBILITY: "♿",
  ADMINISTRATIVE: "📋",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-800",
  CLOSED: "bg-green-100 text-green-800",
  DISCARDED: "bg-gray-200 text-gray-600",
};

// ── Component ──────────────────────────────────────────────────────────────

export default function IncidentsPage() {
  const [pageState, setPageState] = useState<PageState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset when file changes
  const handleUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setErrorMsg("Please select a .csv file.");
      setPageState("error");
      return;
    }

    setPageState("uploading");
    setErrorMsg("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/incidents/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(
          errBody?.detail ?? `Server error (${res.status})`
        );
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      setPageState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrorMsg(msg);
      setPageState("error");
    }
  }, []);

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleUpload(f);
    },
    [handleUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleUpload(f);
    },
    [handleUpload]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const handleExport = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/incidents/results/export`);
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.detail ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "incident-analysis-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed";
      setErrorMsg(msg);
    }
  }, []);

  const ruleEntries = result
    ? (Object.entries(result.rule_counts) as [keyof RuleCounts, number][]).filter(
        ([, v]) => v > 0
      )
    : [];

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-[#d6f6ff] via-white to-[#75d4ff] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0069ff]">
          HealthCore Digital &mdash; Incident Analyzer
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#0016a2]">
          Patient Incident Analysis
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload a tab-separated CSV file with patient incident records to
          validate, categorise, and compute quality metrics.
        </p>
      </section>

      {/* ── Upload zone ── */}
      <section
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-colors ${
          dragOver
            ? "border-[#0069ff] bg-blue-50"
            : "border-gray-300 bg-white hover:border-[#75d4ff]"
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        aria-label="Upload incident CSV file"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onFileSelect}
        />

        {pageState === "uploading" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#75d4ff] border-t-[#0069ff]" />
            <p className="text-sm text-gray-500">Analyzing file…</p>
          </div>
        ) : (
          <>
            <span className="text-4xl">📄</span>
            <p className="mt-3 text-sm font-medium text-[#0031c4]">
              Drop your CSV file here, or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Tab-separated .csv with incident data
            </p>
          </>
        )}
      </section>

      {/* ── Error ── */}
      {pageState === "error" && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-3">
            <span className="text-xl">❌</span>
            <div>
              <p className="text-sm font-semibold text-red-800">Upload error</p>
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setPageState("idle");
              setErrorMsg("");
            }}
            className="mt-3 rounded-lg bg-red-100 px-4 py-1.5 text-xs font-medium text-red-800 transition hover:bg-red-200"
          >
            Try again
          </button>
        </section>
      )}

      {/* ── Results ── */}
      {result && (
        <>
          {/* General metrics */}
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total records"
              value={result.total_records}
              color="text-[#0016a2]"
            />
            <MetricCard
              label="Valid records"
              value={result.valid_records}
              color="text-green-700"
              sub={`${(
                (result.valid_records / result.total_records) *
                100
              ).toFixed(1)}%`}
            />
            <MetricCard
              label="Invalid records"
              value={result.invalid_records}
              color={result.invalid_records > 0 ? "text-red-600" : "text-gray-500"}
              sub={
                result.invalid_records > 0
                  ? `${(
                      (result.invalid_records / result.total_records) *
                      100
                    ).toFixed(1)}%`
                  : undefined
              }
            />
            <MetricCard
              label="Avg. satisfaction"
              value={result.average_satisfaction.toFixed(2)}
              color="text-[#0031c4]"
              sub={`from ${result.scored_cases} scored cases`}
            />
          </section>

          {/* Category breakdown */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0016a2]">
              📂 Category breakdown
            </h2>
            <div className="mt-4 space-y-3">
              {Object.entries(result.category_counts).map(([cat, count]) => {
                const pct =
                  result.valid_records > 0
                    ? ((count / result.valid_records) * 100).toFixed(1)
                    : "0.0";
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <span>{CATEGORY_ICONS[cat] ?? "📁"}</span>
                        <span className="font-medium text-gray-700">{cat}</span>
                      </span>
                      <span className="text-gray-500">
                        {count} <span className="text-xs">({pct}%)</span>
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          CATEGORY_COLORS[cat]?.split(" ")[0] ?? "bg-[#0069ff]"
                        }`}
                        style={{
                          width: `${
                            result.valid_records > 0
                              ? (count / result.valid_records) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Status & Country */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Status */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[#0016a2]">
                🔵 Status breakdown
              </h2>
              <div className="mt-4 space-y-2">
                {Object.entries(result.status_counts).map(([st, count]) => {
                  const pct =
                    result.valid_records > 0
                      ? ((count / result.valid_records) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <div
                      key={st}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5"
                    >
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[st] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {st}
                      </span>
                      <span className="text-sm text-gray-600">
                        {count} <span className="text-xs">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Country */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[#0016a2]">
                🌍 Country distribution
              </h2>
              <div className="mt-4 space-y-2">
                {Object.entries(result.country_counts).map(([co, count]) => {
                  const pct =
                    result.valid_records > 0
                      ? ((count / result.valid_records) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <div
                      key={co}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {co === "US" ? "🇺🇸 US" : "🇬🇧 UK"}
                      </span>
                      <span className="text-sm text-gray-600">
                        {count} <span className="text-xs">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Satisfaction distribution */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#0016a2]">
              ⭐ Satisfaction distribution (1–5)
            </h2>
            <div className="mt-4 flex items-end gap-2">
              {(
                [
                  { key: "score_1", label: "1" },
                  { key: "score_2", label: "2" },
                  { key: "score_3", label: "3" },
                  { key: "score_4", label: "4" },
                  { key: "score_5", label: "5" },
                ] as const
              ).map(({ key, label }) => {
                const count =
                  result.satisfaction_distribution[
                    key as keyof SatisfactionDistribution
                  ];
                const maxVal = Math.max(
                  ...Object.values(result.satisfaction_distribution),
                  1
                );
                const heightPct = (count / maxVal) * 100;
                return (
                  <div key={key} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-[#0031c4]">
                      {count}
                    </span>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-[#92eaff] to-[#0069ff] transition-all duration-500"
                      style={{ height: `${Math.max(heightPct, 4)}px` }}
                    />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Invalid records alert */}
          {result.invalid_records > 0 && ruleEntries.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <h2 className="text-sm font-semibold text-amber-900">
                  Invalid records — {result.invalid_records} total
                </h2>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ruleEntries.map(([rule, count]) => (
                  <div
                    key={rule}
                    className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-3 py-2"
                  >
                    <span className="flex items-center gap-1.5 text-xs text-amber-800">
                      <span>{RULE_ICONS[rule]}</span>
                      <span>{RULE_LABELS[rule]}</span>
                    </span>
                    <span className="text-sm font-semibold text-amber-900">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Export button */}
          <div className="flex justify-end">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl bg-[#0069ff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0031c4]"
            >
              ⬇️ Download CSV export
            </button>
          </div>

          {/* File info */}
          <p className="text-center text-xs text-gray-400">
            File: {result.filename}
          </p>
        </>
      )}
    </div>
  );
}

// ── Metric card sub-component ──────────────────────────────────────────────

function MetricCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </article>
  );
}