"use client";

import { useCallback, useState, useEffect } from "react";
import { getApiBase } from "@/lib/api";

// ── Types ──

interface Supplier {
  id: number;
  name: string;
  country: string;
  categories: string[];
  rate: number;
  status: string;
  updated_at: string;
}

type PageState = "loading" | "ready" | "error";
type FormMode = "idle" | "open" | "submitting" | "error";

// ── Constants ──

const VALID_CATEGORIES = [
  "MEDICAL_SUPPLIES",
  "PHARMACEUTICALS",
  "MEDICAL_EQUIPMENT",
  "IT_SERVICES",
  "ADMINISTRATIVE",
];

const CATEGORY_LABELS: Record<string, string> = {
  MEDICAL_SUPPLIES: "Medical Supplies",
  PHARMACEUTICALS: "Pharmaceuticals",
  MEDICAL_EQUIPMENT: "Medical Equipment",
  IT_SERVICES: "IT Services",
  ADMINISTRATIVE: "Administrative",
};

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: string }> = {
  active: { label: "Active", badge: "bg-green-100 text-green-800", icon: "✅" },
  suspended: { label: "Suspended", badge: "bg-red-100 text-red-700", icon: "⛔" },
};

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  UK: "🇬🇧",
};

// ── Component ──

export default function SuppliersPage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [formMode, setFormMode] = useState<FormMode>("idle");
  const [formError, setFormError] = useState("");
  const [rateUpdating, setRateUpdating] = useState<Record<number, boolean>>({});
  const [statusUpdating, setStatusUpdating] = useState<Record<number, boolean>>({});

  // ── Fetch suppliers ──

  const fetchSuppliers = useCallback(async () => {
    setPageState("loading");
    try {
      const base = getApiBase();
      const params = new URLSearchParams();
      if (filterCountry) params.set("country", filterCountry);
      if (filterCategory) params.set("category", filterCategory);

      const url = `${base}/suppliers${params.toString() ? "?" + params.toString() : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Supplier[] = await res.json();
      setSuppliers(data);
      setPageState("ready");
    } catch {
      setPageState("error");
    }
  }, [filterCountry, filterCategory]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // ── Filter handlers ──

  const resetForm = useCallback(() => {
    setFormMode("idle");
    setFormError("");
  }, []);

  const handleCreate = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormMode("submitting");
    setFormError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const country = formData.get("country") as string;
    const rateStr = formData.get("rate") as string;
    const categoriesEl = form.querySelectorAll<HTMLInputElement>(
      'input[name="categories"]:checked'
    );
    const categories = Array.from(categoriesEl).map((el) => el.value);
    const status = formData.get("status") as string;

    if (!name || name.length < 2) {
      setFormError("Name must be at least 2 characters.");
      setFormMode("error");
      return;
    }
    if (!country) {
      setFormError("Please select a country.");
      setFormMode("error");
      return;
    }
    if (categories.length === 0) {
      setFormError("Please select at least one category.");
      setFormMode("error");
      return;
    }
    const rate = parseFloat(rateStr);
    if (isNaN(rate) || rate <= 0) {
      setFormError("Rate must be a positive number.");
      setFormMode("error");
      return;
    }

    const body = {
      name,
      country,
      categories,
      rate,
      status,
    };

    try {
      const base = getApiBase();
      const res = await fetch(`${base}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        const detail =
          err.detail?.[0]?.msg || err.detail || "Validation error.";
        setFormError(detail);
        setFormMode("error");
        return;
      }

      resetForm();
      fetchSuppliers();
    } catch {
      setFormError("Network error. Please check the API is running.");
      setFormMode("error");
    }
  }, [resetForm, fetchSuppliers]);

  // ── Update rate ──

  const [editingRate, setEditingRate] = useState<number | null>(null);
  const [rateInputValue, setRateInputValue] = useState("");

  const startRateEdit = useCallback((supplier: Supplier) => {
    setEditingRate(supplier.id);
    setRateInputValue(String(supplier.rate));
  }, []);

  const cancelRateEdit = useCallback(() => {
    setEditingRate(null);
    setRateInputValue("");
  }, []);

  const confirmRateEdit = useCallback(
    async (supplierId: number) => {
      const newRate = parseFloat(rateInputValue);
      if (isNaN(newRate) || newRate <= 0) {
        alert("Rate must be a positive number.");
        return;
      }

      setRateUpdating((prev) => ({ ...prev, [supplierId]: true }));

      try {
        const base = getApiBase();
        const res = await fetch(`${base}/suppliers/${supplierId}/rate`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rate: newRate }),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.detail?.[0]?.msg || err.detail || "Failed to update rate.");
        } else {
          fetchSuppliers();
        }
      } catch {
        alert("Network error. Could not update rate.");
      } finally {
        setRateUpdating((prev) => ({ ...prev, [supplierId]: false }));
        setEditingRate(null);
        setRateInputValue("");
      }
    },
    [fetchSuppliers, rateInputValue]
  );

  // ── Toggle status ──

  const toggleStatus = useCallback(
    async (supplier: Supplier) => {
      setStatusUpdating((prev) => ({ ...prev, [supplier.id]: true }));

      const newStatus = supplier.status === "active" ? "suspended" : "active";

      try {
        const base = getApiBase();
        const res = await fetch(`${base}/suppliers/${supplier.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.detail?.[0]?.msg || err.detail || "Failed to update status.");
        } else {
          fetchSuppliers();
        }
      } catch {
        alert("Network error. Could not update status.");
      } finally {
        setStatusUpdating((prev) => ({ ...prev, [supplier.id]: false }));
      }
    },
    [fetchSuppliers]
  );

  // ── Delete supplier ──

  const deleteSupplier = useCallback(
    async (supplierId: number, name: string) => {
      if (!confirm(`Remove "${name}" from the directory?`)) return;

      try {
        const base = getApiBase();
        const res = await fetch(`${base}/suppliers/${supplierId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          alert("Failed to delete supplier.");
        } else {
          fetchSuppliers();
        }
      } catch {
        alert("Network error. Could not delete supplier.");
      }
    },
    [fetchSuppliers]
  );

  // ── UI ──

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-[#d6f6ff] via-white to-[#75d4ff] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0069ff]">
          HealthCore Digital &mdash; Supplier Directory
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#0016a2]">
          Supplier Management
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage HealthCore&apos;s procurement suppliers across the US and UK.
          Register new suppliers, update rates, and control supplier status.
        </p>
      </section>

      {/* ── Filters + Add button ── */}
      <section className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="filter-country" className="block text-xs font-medium text-gray-600">
            Country
          </label>
          <select
            id="filter-country"
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20"
          >
            <option value="">All countries</option>
            <option value="US">🇺🇸 United States</option>
            <option value="UK">🇬🇧 United Kingdom</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-category" className="block text-xs font-medium text-gray-600">
            Category
          </label>
          <select
            id="filter-category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20"
          >
            <option value="">All categories</option>
            {VALID_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setFormMode("open")}
          className="rounded-lg bg-[#0069ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0031c4]"
        >
          + Register supplier
        </button>
      </section>

      {/* ── Create form ── */}
      {formMode === "open" || formMode === "submitting" || formMode === "error" ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#0016a2]">Register new supplier</h2>

          {formError ? (
            <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              ⚠ {formError}
            </div>
          ) : null}

          <form onSubmit={handleCreate} className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sup-name" className="block text-xs font-medium text-gray-600">
                Supplier name *
              </label>
              <input
                id="sup-name"
                name="name"
                type="text"
                required
                minLength={2}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20"
              />
            </div>

            <div>
              <label htmlFor="sup-country" className="block text-xs font-medium text-gray-600">
                Country *
              </label>
              <select
                id="sup-country"
                name="country"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20"
              >
                <option value="">Select country</option>
                <option value="US">🇺🇸 United States</option>
                <option value="UK">🇬🇧 United Kingdom</option>
              </select>
            </div>

            <div>
              <label htmlFor="sup-rate" className="block text-xs font-medium text-gray-600">
                Contract rate * (positive number)
              </label>
              <input
                id="sup-rate"
                name="rate"
                type="number"
                step="0.01"
                min="0.01"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20"
              />
            </div>

            <div>
              <label htmlFor="sup-status" className="block text-xs font-medium text-gray-600">
                Initial status
              </label>
              <select
                id="sup-status"
                name="status"
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <fieldset className="col-span-full">
              <legend className="text-xs font-medium text-gray-600">
                Product categories * (select at least one)
              </legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {VALID_CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs transition hover:border-[#0069ff]"
                  >
                    <input
                      type="checkbox"
                      name="categories"
                      value={cat}
                      className="h-4 w-4 rounded border-gray-300 text-[#0069ff]"
                    />
                    {CATEGORY_LABELS[cat]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="col-span-full flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formMode === "submitting"}
                className="rounded-lg bg-[#0069ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0031c4] disabled:opacity-50"
              >
                {formMode === "submitting" ? "Registering..." : "Register supplier"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {/* ── Supplier list ── */}
      {pageState === "loading" ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading suppliers...
        </div>
      ) : pageState === "error" ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          ⚠ Could not load suppliers.
          <br />
          <button
            onClick={fetchSuppliers}
            className="mt-3 rounded-lg bg-[#0069ff] px-4 py-2 text-sm text-white"
          >
            Retry
          </button>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No suppliers found matching the current filters.
        </div>
      ) : (
        <section>
          <h2 className="text-sm font-semibold text-gray-600">
            {suppliers.length} supplier(s)
          </h2>

          <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-2.5 font-medium text-gray-600">Name</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">Country</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">Categories</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">Rate</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">Status</th>
                  <th className="px-3 py-2.5 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup) => {
                  const statusCfg = STATUS_CONFIG[sup.status] || STATUS_CONFIG.active;
                  return (
                    <tr
                      key={sup.id}
                      className={`border-b border-gray-100 ${
                        sup.status === "suspended" ? "bg-gray-50/50" : "bg-white"
                      } transition hover:bg-blue-50`}
                    >
                      <td className="px-3 py-2.5 font-medium text-gray-800">
                        {sup.name}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">
                        {COUNTRY_FLAGS[sup.country] || sup.country} {sup.country}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {sup.categories.map((cat) => (
                            <span
                              key={cat}
                              className="rounded-md bg-[#92eaff] px-2 py-0.5 text-[11px] font-medium text-[#0031c4]"
                            >
                              {CATEGORY_LABELS[cat] || cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-gray-700">
                        {editingRate === sup.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={rateInputValue}
                              onChange={(e) => setRateInputValue(e.target.value)}
                              className="w-20 rounded border border-gray-300 px-2 py-1 text-xs focus:border-[#0069ff]"
                            />
                            <button
                              onClick={() => confirmRateEdit(sup.id)}
                              disabled={rateUpdating[sup.id]}
                              className="text-[11px] font-medium text-green-600 hover:text-green-700"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelRateEdit}
                              className="text-[11px] font-medium text-gray-400 hover:text-gray-600"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          `$${sup.rate.toFixed(2)}`
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusCfg.badge}`}
                        >
                          {statusCfg.icon} {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => startRateEdit(sup)}
                            disabled={rateUpdating[sup.id] || editingRate !== null}
                            className="rounded-md bg-[#75d4ff] px-2 py-1 text-[11px] font-medium text-[#0031c4] transition hover:bg-[#0069ff] hover:text-white disabled:opacity-50"
                            title="Update rate"
                          >
                            {rateUpdating[sup.id] ? "..." : "$"}
                          </button>

                          <button
                            onClick={() => toggleStatus(sup)}
                            disabled={statusUpdating[sup.id]}
                            className={`rounded-md px-2 py-1 text-[11px] font-medium transition disabled:opacity-50 ${
                              sup.status === "active"
                                ? "bg-amber-100 text-amber-800 hover:bg-red-100 hover:text-red-700"
                                : "bg-green-100 text-green-800 hover:bg-[#92eaff] hover:text-[#0031c4]"
                            }`}
                            title={`Switch to ${sup.status === "active" ? "suspended" : "active"}`}
                          >
                            {statusUpdating[sup.id]
                              ? "..."
                              : sup.status === "active"
                                ? "⛔ Suspend"
                                : "✅ Activate"}
                          </button>

                          <button
                            onClick={() => deleteSupplier(sup.id, sup.name)}
                            className="rounded-md bg-red-100 px-2 py-1 text-[11px] font-medium text-red-700 transition hover:bg-red-200"
                            title="Remove supplier"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}