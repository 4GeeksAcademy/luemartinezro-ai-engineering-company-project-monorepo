"use client";

/**
 * Profile page — /account/profile
 *
 * Displays the authenticated user's email and profile data (name, phone, address).
 * Allows inline editing of name, phone, and address via PUT /profiles/me.
 */

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/lib/authFetch";
import AuthGuard from "@/components/AuthGuard";

// ── Types ──────────────────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  phone: string;
  address: string;
}

// ── Component ──────────────────────────────────────────────────────────────

function ProfileContent() {
  const { user, loading, error } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    phone: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync form data when user loads
  useEffect(() => {
    if (user?.profile) {
      setFormData({
        name: user.profile.name || "",
        phone: user.profile.phone || "",
        address: user.profile.address || "",
      });
    }
  }, [user]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await authFetch("/profiles/me", {
        method: "PUT",
        body: JSON.stringify({
          name: formData.name || null,
          phone: formData.phone || null,
          address: formData.address || null,
        }),
      });
      setSaveSuccess(true);
      setIsEditing(false);
      // Refresh user data
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }, [formData]);

  const handleCancel = useCallback(() => {
    // Reset form to original values
    if (user?.profile) {
      setFormData({
        name: user.profile.name || "",
        phone: user.profile.phone || "",
        address: user.profile.address || "",
      });
    }
    setIsEditing(false);
    setSaveError(null);
  }, [user]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0069ff] border-t-transparent" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  // ── No user state ──
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-sm text-gray-500">Unable to load profile. Please try again.</div>
      </div>
    );
  }

  const profile = user.profile;

  return (
    <div className="mx-auto max-w-2xl">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#0016a2]">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account details and contact information
        </p>
      </div>

      {/* ── Email (read-only) ── */}
      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Account
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Email address</p>
            <p className="mt-0.5 text-sm font-medium text-gray-900">{user.email}</p>
          </div>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-[#0069ff]">
            {user.role}
          </span>
        </div>
      </section>

      {/* ── Profile (editable) ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Contact Information
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium text-[#0069ff] hover:text-[#0031c4]"
            >
              Edit
            </button>
          )}
        </div>

        {/* Save feedback */}
        {saveSuccess && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            Profile updated successfully
          </div>
        )}
        {saveError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {isEditing ? (
          /* ── Edit mode ── */
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20"
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-[#0069ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#0031c4] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* ── View mode ── */
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Full name</p>
              <p className="mt-0.5 text-sm text-gray-900">
                {profile?.name || (
                  <span className="italic text-gray-400">Not set</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone number</p>
              <p className="mt-0.5 text-sm text-gray-900">
                {profile?.phone || (
                  <span className="italic text-gray-400">Not set</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="mt-0.5 text-sm text-gray-900">
                {profile?.address || (
                  <span className="italic text-gray-400">Not set</span>
                )}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
