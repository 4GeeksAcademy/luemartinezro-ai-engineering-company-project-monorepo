"use client";

import { type FormEvent, useState } from "react";
import { getApiBase } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("You must be logged in to change your password.");
        return;
      }

      const res = await fetch(`${getApiBase()}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail ?? "Failed to change password.");
        return;
      }

      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-md px-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-[#0016a2]">Change password</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update your account password.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              placeholder="At least 6 characters"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              placeholder="Re-enter your new password"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0069ff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0031c4] disabled:opacity-50"
          >
            {loading ? "Changing..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
}