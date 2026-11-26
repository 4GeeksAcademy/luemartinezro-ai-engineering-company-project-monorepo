"use client";

import { useCallback, useState } from "react";
import { getApiBase } from "@/lib/api";

// ── Types matching the backend enums ───────────────────────────────────────

interface FormData {
  title: string;
  description: string;
  category: string;
  origin: string;
  branch: string;
}

interface FieldError {
  field: string;
  message: string;
}

type FormMode = "idle" | "submitting" | "success" | "error";

// ── Constants from BRIEFING ────────────────────────────────────────────────

const CATEGORIES: { value: string; label: string }[] = [
  { value: "clinical_equipment", label: "Clinical Equipment" },
  { value: "it_system", label: "IT System" },
  { value: "billing_error", label: "Billing Error" },
  { value: "compliance_breach", label: "Compliance Breach" },
  { value: "patient_experience", label: "Patient Experience" },
  { value: "staff_issue", label: "Staff Issue" },
  { value: "facility_issue", label: "Facility Issue" },
  { value: "referral_issue", label: "Referral Issue" },
  { value: "other", label: "Other" },
];

const ORIGINS: { value: string; label: string; description: string }[] = [
  { value: "customer", label: "Customer", description: "Reported by a patient or representative" },
  { value: "branch", label: "Branch", description: "Reported by clinic staff at a specific location" },
  { value: "internal", label: "Internal", description: "Detected by technology, compliance, or leadership" },
];

const BRANCHES: { value: string; label: string }[] = [
  { value: "central", label: "Central — Austin Main Clinic" },
  { value: "austin_north", label: "Austin — North" },
  { value: "dallas_uptown", label: "Dallas Uptown" },
  { value: "houston_med_center", label: "Houston Medical Center" },
  { value: "san_antonio_west", label: "San Antonio West" },
  { value: "miami_brickell", label: "Miami Brickell" },
  { value: "miami_doral", label: "Miami Doral" },
  { value: "orlando_east", label: "Orlando East" },
  { value: "tampa_bay", label: "Tampa Bay" },
  { value: "atlanta_midtown", label: "Atlanta Midtown" },
  { value: "savannah", label: "Savannah" },
  { value: "london_city", label: "London City" },
  { value: "london_west", label: "London West End" },
  { value: "manchester_central", label: "Manchester Central" },
];

const INITIAL_FORM: FormData = {
  title: "",
  description: "",
  category: "",
  origin: "",
  branch: "",
};

// ── Component ──────────────────────────────────────────────────────────────

export default function NewIncidentPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [formMode, setFormMode] = useState<FormMode>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  // ── Field update ─────────────────────────────────────────────────────────

  const updateField = useCallback(
    (field: keyof FormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // Clear field error when user edits
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [fieldErrors]
  );

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormMode("submitting");
      setGeneralError("");
      setFieldErrors({});

      try {
        const base = getApiBase();
        const res = await fetch(`${base}/api/incidents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            origin: form.origin,
            branch: form.branch,
          }),
        });

        if (res.status === 201) {
          // Success
          setForm(INITIAL_FORM);
          setFormMode("success");
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        // Error response
        const body = await res.json().catch(() => null);

        // Handle both 400 (custom validation) and 422 (Pydantic validation)
        if (body?.detail && Array.isArray(body.detail) && body.detail.length > 0) {
          const errors: Record<string, string> = {};

          for (const err of body.detail) {
            if (err.field && err.message) {
              // Custom validation error format (400)
              errors[err.field] = err.message;
            } else if (err.loc && err.msg) {
              // Pydantic validation error format (422)
              const field = err.loc[err.loc.length - 1]; // last segment = field name
              if (field && typeof field === "string") {
                errors[field] = err.msg;
              }
            }
          }

          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setFormMode("error");
            return;
          }
        }

        // Generic error
        setGeneralError(
          body?.detail?.[0]?.message ||
            body?.detail ||
            `Server error (${res.status}). Please try again.`
        );
        setFormMode("error");
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Unable to connect to the server. Please check your connection.";
        setGeneralError(msg);
        setFormMode("error");
      }
    },
    [form]
  );

  // ── Form field class helper ──────────────────────────────────────────────

  const fieldClass = (fieldName: string, base = "") => {
    const hasError = fieldErrors[fieldName];
    return `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${
      hasError
        ? "border-red-400 bg-red-50 text-red-900"
        : "border-gray-300 bg-white text-gray-900 focus:border-[#0069ff] focus:ring-1 focus:ring-[#0069ff]"
    } ${base}`;
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-[#d6f6ff] via-white to-[#75d4ff] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0069ff]">
          HealthCore Digital &mdash; Incident Manager
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#0016a2]">
          Register a New Incident
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Log an incident reported from any branch, customer, or internal
          source. All fields are required.
        </p>
      </section>

      {/* ── Success message ── */}
      {formMode === "success" && (
        <section className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm font-semibold text-green-800">
                Incident registered successfully
              </p>
              <p className="text-sm text-green-700">
                The incident has been saved and is now visible in the
                incident list.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── General error ── */}
      {generalError && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-3">
            <span className="text-xl">❌</span>
            <div>
              <p className="text-sm font-semibold text-red-800">
                Could not register the incident
              </p>
              <p className="text-sm text-red-700">{generalError}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Privacy warning ── */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <span className="text-lg">🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Patient privacy notice
            </p>
            <p className="text-sm text-amber-800">
              Do <strong>not</strong> enter patient-identifying information
              (name, date of birth, medical record number, contact details).
              If this incident involves a patient, reference them only by
              an opaque internal identifier.
            </p>
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Brief, descriptive title of the incident"
            className={fieldClass("title", "mt-1")}
            disabled={formMode === "submitting"}
            maxLength={200}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Detailed description — no patient-identifying data"
            className={fieldClass("description", "mt-1 resize-y")}
            disabled={formMode === "submitting"}
            maxLength={5000}
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.description}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className={fieldClass("category", "mt-1")}
            disabled={formMode === "submitting"}
          >
            <option value="">Select a category…</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {fieldErrors.category && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.category}
            </p>
          )}
        </div>

        {/* Origin */}
        <div>
          <label
            htmlFor="origin"
            className="block text-sm font-medium text-gray-700"
          >
            Origin <span className="text-red-500">*</span>
          </label>
          <select
            id="origin"
            value={form.origin}
            onChange={(e) => updateField("origin", e.target.value)}
            className={fieldClass("origin", "mt-1")}
            disabled={formMode === "submitting"}
          >
            <option value="">Select origin…</option>
            {ORIGINS.map((org) => (
              <option key={org.value} value={org.value}>
                {org.label}
              </option>
            ))}
          </select>
          {fieldErrors.origin && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.origin}</p>
          )}
        </div>

        {/* Branch */}
        <div
          className={
            form.origin === "branch"
              ? "rounded-2xl border-2 border-[#0069ff] bg-blue-50 p-4"
              : ""
          }
        >
          {form.origin === "branch" && (
            <p className="mb-2 text-xs font-semibold text-[#0069ff]">
              📍 You are reporting from a specific branch location
            </p>
          )}
          <label
            htmlFor="branch"
            className="block text-sm font-medium text-gray-700"
          >
            Branch <span className="text-red-500">*</span>
          </label>
          <select
            id="branch"
            value={form.branch}
            onChange={(e) => updateField("branch", e.target.value)}
            className={`${fieldClass("branch", "mt-1")} ${
              form.origin === "branch" ? "border-[#0069ff] bg-white" : ""
            }`}
            disabled={formMode === "submitting"}
          >
            <option value="">Select a branch…</option>
            {BRANCHES.map((br) => (
              <option key={br.value} value={br.value}>
                {br.label}
              </option>
            ))}
          </select>
          {fieldErrors.branch && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.branch}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            Use &quot;Central — Austin Main Clinic&quot; when the incident
            has no specific clinic location.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={formMode === "submitting"}
            className="flex items-center gap-2 rounded-xl bg-[#0069ff] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0031c4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {formMode === "submitting" ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Registering…
              </>
            ) : (
              "Register incident"
            )}
          </button>

          {formMode === "submitting" && (
            <span className="text-sm text-gray-400">
              Please wait while the incident is being saved…
            </span>
          )}
        </div>
      </form>
    </div>
  );
}