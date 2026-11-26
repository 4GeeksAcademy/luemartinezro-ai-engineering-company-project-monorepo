"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { getApiBase } from "@/lib/api";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

interface Incident {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  origin: string;
  branch: string;
  created_at: string;
  updated_at: string;
}

interface SummaryData {
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  by_origin: Record<string, number>;
  by_branch: Record<string, number>;
}

type ListState = "loading" | "ready" | "error";
type SummaryState = "loading" | "ready" | "error";

// ── Constants from BRIEFING ────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  open: { label: "Open", badge: "bg-amber-100 text-amber-800" },
  in_progress: { label: "In Progress", badge: "bg-blue-100 text-blue-800" },
  resolved: { label: "Resolved", badge: "bg-green-100 text-green-800" },
  discarded: { label: "Discarded", badge: "bg-gray-200 text-gray-600" },
};

const CATEGORY_LABELS: Record<string, string> = {
  clinical_equipment: "Clinical Equipment",
  it_system: "IT System",
  billing_error: "Billing Error",
  compliance_breach: "Compliance Breach",
  patient_experience: "Patient Experience",
  staff_issue: "Staff Issue",
  facility_issue: "Facility Issue",
  referral_issue: "Referral Issue",
  other: "Other",
};

const ORIGIN_LABELS: Record<string, string> = {
  customer: "Customer",
  branch: "Branch",
  internal: "Internal",
};

const BRANCH_DISPLAY: Record<string, string> = {
  central: "Central — Austin Main Clinic",
  austin_north: "Austin — North",
  dallas_uptown: "Dallas Uptown",
  houston_med_center: "Houston Medical Center",
  san_antonio_west: "San Antonio West",
  miami_brickell: "Miami Brickell",
  miami_doral: "Miami Doral",
  orlando_east: "Orlando East",
  tampa_bay: "Tampa Bay",
  atlanta_midtown: "Atlanta Midtown",
  savannah: "Savannah",
  london_city: "London City",
  london_west: "London West End",
  manchester_central: "Manchester Central",
};

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "discarded"];
const ORIGIN_OPTIONS = ["customer", "branch", "internal"];
const BRANCH_OPTIONS = Object.entries(BRANCH_DISPLAY).map(([value, label]) => ({
  value,
  label,
}));

const VALID_TRANSITIONS: Record<string, string[]> = {
  open: ["in_progress", "discarded"],
  in_progress: ["resolved", "discarded"],
};

// ── Component ──────────────────────────────────────────────────────────────

export default function IncidentsPage() {
  const [pageState, setPageState] = useState<PageState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset when file changes
  const handleUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setErrorMsg("Please select a .csv file.");
      setPageState("error");
      return;
    }
  }, [filterStatus, filterOrigin, filterBranch, filterCategory]);

  // ── Fetch summary ────────────────────────────────────────────────────────

  const fetchSummary = useCallback(async () => {
    setSummaryState("loading");
    setSummaryError("");

    try {
      const res = await fetch(`${getApiBase()}/api/incidents/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setErrorMsg("We couldn’t analyze that file. Check that it is a valid incident CSV and try again.");
        setPageState("error");
        return;
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      setPageState("success");
    } catch {
      setErrorMsg("We couldn’t connect to the analysis service. Check your connection and try again.");
      setPageState("error");
    }
  }, []);

  // ── Initial load ──

  useEffect(() => {
    fetchIncidents();
    fetchSummary();
  }, [fetchIncidents, fetchSummary]);

  // ── Retry ──

  const handleRetryList = useCallback(() => fetchIncidents(), [fetchIncidents]);
  const handleRetrySummary = useCallback(() => fetchSummary(), [fetchSummary]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setExportError(false);
    try {
      const res = await fetch(`${getApiBase()}/api/incidents/results/export`);
      if (!res.ok) {
        throw new Error("export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "incident-analysis-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError(true);
    } finally {
      setExporting(false);
    }
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-[#d6f6ff] via-white to-[#75d4ff] p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0069ff]">
              HealthCore Digital &mdash; Incident Manager
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#0016a2]">
              Incidents
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Track and manage all reported incidents across the HealthCore network.
            </p>
          </div>
          <Link
            href="/incidents/new"
            className="flex items-center gap-2 rounded-xl bg-[#0069ff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0031c4]"
          >
            + New Incident
          </Link>
        </div>
      </section>

      {/* ── Summary Panel ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0016a2]">
          📊 Summary
        </h2>

        {summaryState === "loading" && (
          <div className="mt-4 flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#75d4ff] border-t-[#0069ff]" />
            <span className="text-sm text-gray-400">Loading summary…</span>
          </div>
        )}

        {summaryState === "error" && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-red-600">{summaryError || "Failed to load summary"}</span>
            <button
              onClick={handleRetrySummary}
              className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Retry
            </button>
          </div>
        )}

        {summaryState === "ready" && summary && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* By Status */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                By Status
              </p>
              <div className="mt-2 space-y-1">
                {Object.entries(summary.by_status).map(([key, count]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_CONFIG[key]?.badge ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STATUS_CONFIG[key]?.label ?? key}
                    </span>
                    <span className="font-semibold text-gray-800">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Category */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                By Category
              </p>
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {Object.entries(summary.by_category).map(([key, count]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">
                      {CATEGORY_LABELS[key] ?? key}
                    </span>
                    <span className="font-semibold text-gray-800">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Origin */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                By Origin
              </p>
              <div className="mt-2 space-y-1">
                {Object.entries(summary.by_origin).map(([key, count]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">
                      {ORIGIN_LABELS[key] ?? key}
                    </span>
                    <span className="font-semibold text-gray-800">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Branch (top 5) */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                By Branch (top)
              </p>
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {Object.entries(summary.by_branch)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([key, count]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700">
                        {BRANCH_DISPLAY[key] ?? key}
                      </span>
                      <span className="font-semibold text-gray-800">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Filters ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {/* Status filter */}
          <div className="min-w-[160px]">
            <label
              htmlFor="filter-status"
              className="block text-xs font-medium text-gray-500"
            >
              Status
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0069ff]"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s]?.label ?? s}
                </option>
              ))}
            </select>
          </div>

          {/* Origin filter */}
          <div className="min-w-[160px]">
            <label
              htmlFor="filter-origin"
              className="block text-xs font-medium text-gray-500"
            >
              Origin
            </label>
            <select
              id="filter-origin"
              value={filterOrigin}
              onChange={(e) => setFilterOrigin(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0069ff]"
            >
              <option value="">All origins</option>
              {ORIGIN_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {ORIGIN_LABELS[o] ?? o}
                </option>
              ))}
            </select>
          </div>

          {/* Branch filter */}
          <div className="min-w-[200px]">
            <label
              htmlFor="filter-branch"
              className="block text-xs font-medium text-gray-500"
            >
              Branch
            </label>
            <select
              id="filter-branch"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0069ff]"
            >
              <option value="">All branches</option>
              {BRANCH_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Apply filters button */}
          <button
            onClick={fetchIncidents}
            className="rounded-lg bg-[#0069ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0031c4]"
          >
            Apply Filters
          </button>
        </div>
      </section>

      {/* ── Incident List ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0016a2]">
          📋 Incident List
        </h2>

        {/* Loading */}
        {listState === "loading" && (
          <div className="mt-6 flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#75d4ff] border-t-[#0069ff]" />
              <p className="text-sm text-gray-400">Loading incidents…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {listState === "error" && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-center gap-3">
              <span className="text-xl">❌</span>
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Failed to load incidents
                </p>
                <p className="text-sm text-red-700">{listError}</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 rounded-xl bg-[#0069ff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0031c4]"
            >
              {exporting ? "Preparing export…" : "⬇️ Download CSV export"}
            </button>
          </div>
          {exportError && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <span>We couldn&apos;t prepare the export. Please try again.</span>
              <button onClick={handleExport} className="rounded-lg bg-red-100 px-3 py-1.5 font-medium hover:bg-red-200">
                Retry export
              </button>
            </div>
          )}

        {/* Table */}
        {listState === "ready" && incidents.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-3 pr-4">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Origin</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="pl-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-400">
                      {inc.id}
                    </td>
                    <td className="max-w-[200px] px-4 py-3">
                      <p className="truncate font-medium text-gray-900">
                        {inc.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        {CATEGORY_LABELS[inc.category] ?? inc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {ORIGIN_LABELS[inc.origin] ?? inc.origin}
                    </td>
                    <td className="max-w-[160px] px-4 py-3">
                      <p className="truncate text-xs text-gray-600" title={BRANCH_DISPLAY[inc.branch] ?? inc.branch}>
                        {BRANCH_DISPLAY[inc.branch] ?? inc.branch}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_CONFIG[inc.status]?.badge ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {STATUS_CONFIG[inc.status]?.label ?? inc.status}
                      </span>
                    </td>
                    <td className="pl-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={inc.status}
                          onChange={(e) =>
                            handleStatusUpdate(inc.id, e.target.value)
                          }
                          disabled={
                            statusUpdating[inc.id] ||
                            inc.status === "resolved" ||
                            inc.status === "discarded"
                          }
                          className="rounded-lg border border-gray-300 px-2 py-1 text-xs outline-none focus:border-[#0069ff] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((s) => {
                            const allowed =
                              s === inc.status ||
                              (VALID_TRANSITIONS[inc.status]?.includes(s) ?? false);
                            return (
                              <option
                                key={s}
                                value={s}
                                disabled={!allowed}
                              >
                                {STATUS_CONFIG[s]?.label ?? s}
                              </option>
                            );
                          })}
                        </select>
                        {statusUpdating[inc.id] && (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#75d4ff] border-t-[#0069ff]" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
