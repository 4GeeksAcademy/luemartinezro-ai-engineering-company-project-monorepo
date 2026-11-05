"use client";

import { useState } from "react";
import { createCandidate, updateCandidate } from "@/lib/api";
import { ALL_STATUSES, ALL_STAGES, getStatusLabel, getStageLabel, type Candidate, type CandidateCreatePayload } from "@/types";

interface CandidateFormProps {
  candidate?: Candidate; // if provided, we're in edit mode
  onSuccess: (candidate: Candidate) => void;
  onCancel?: () => void;
}

export default function CandidateForm({
  candidate,
  onSuccess,
  onCancel,
}: CandidateFormProps) {
  const isEdit = !!candidate;

  const [formData, setFormData] = useState<CandidateCreatePayload>({
    full_name: candidate?.full_name ?? "",
    email: candidate?.email ?? "",
    phone: candidate?.phone ?? "",
    position: candidate?.position ?? "",
    linkedin_url: candidate?.linkedin_url ?? "",
    cv_url: candidate?.cv_url ?? "",
    experience_years: candidate?.experience_years ?? 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!formData.full_name.trim()) errors.full_name = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email format";
    if (!formData.phone.trim()) errors.phone = "Phone is required";
    if (!formData.position.trim()) errors.position = "Position is required";
    if (
      formData.experience_years === null ||
      formData.experience_years === undefined ||
      formData.experience_years < 0
    )
      errors.experience_years = "Years of experience must be 0 or more";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload: CandidateCreatePayload = {
        ...formData,
        linkedin_url: formData.linkedin_url?.trim() || null,
        cv_url: formData.cv_url?.trim() || null,
      };
      const result = isEdit
        ? await updateCandidate(candidate!.id, payload)
        : await createCandidate(payload);
      onSuccess(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to ${isEdit ? "update" : "register"} candidate`
      );
    } finally {
      setSubmitting(false);
    }
  }

  function updateField(field: keyof CandidateCreatePayload, value: string | number | null) {
    setFormData((prev) => ({ ...prev, [field]: value ?? "" }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* full_name */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20 ${
              fieldErrors.full_name ? "border-red-300" : "border-gray-300"
            }`}
            required
          />
          {fieldErrors.full_name && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.full_name}</p>
          )}
        </div>

        {/* email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20 ${
              fieldErrors.email ? "border-red-300" : "border-gray-300"
            }`}
            required
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        {/* phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20 ${
              fieldErrors.phone ? "border-red-300" : "border-gray-300"
            }`}
            required
          />
          {fieldErrors.phone && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
          )}
        </div>

        {/* position */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Position <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => updateField("position", e.target.value)}
            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20 ${
              fieldErrors.position ? "border-red-300" : "border-gray-300"
            }`}
            required
          />
          {fieldErrors.position && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.position}</p>
          )}
        </div>

        {/* years of experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Years of experience <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={formData.experience_years}
            onChange={(e) => updateField("experience_years", parseFloat(e.target.value) || 0)}
            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20 ${
              fieldErrors.experience_years ? "border-red-300" : "border-gray-300"
            }`}
            required
          />
          {fieldErrors.experience_years && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.experience_years}
            </p>
          )}
        </div>

        {/* linkedin */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            LinkedIn URL <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            value={formData.linkedin_url ?? ""}
            onChange={(e) =>
              updateField("linkedin_url", e.target.value || null)
            }
            placeholder="https://linkedin.com/in/..."
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20"
          />
        </div>

        {/* cv_url */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            CV URL <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            value={formData.cv_url ?? ""}
            onChange={(e) => updateField("cv_url", e.target.value || null)}
            placeholder="https://storage.example.com/cv/..."
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300/30"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#0069ff] px-6 py-2 text-sm font-medium text-white hover:bg-[#0031c4] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#0069ff]/30"
        >
          {submitting
            ? isEdit
              ? "Updating…"
              : "Registering…"
            : isEdit
              ? "Update candidate"
              : "Register candidate"}
        </button>
      </div>
    </form>
  );
}