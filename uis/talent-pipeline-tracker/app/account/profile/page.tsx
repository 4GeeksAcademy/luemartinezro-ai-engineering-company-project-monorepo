"use client";

/**
 * Profile page — /account/profile (Talent Pipeline Tracker)
 *
 * Displays the authenticated user's email and profile data (name, phone, address).
 * Allows inline editing of name, phone, and address via PUT /profiles/me
 * (through the HealthCore API).
 */

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getHealthCoreApiBase, getToken } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";

// ── Types ──────────────────────────────────────────────────────────────────

interface ProfileData {
  name: string;
  phone: string;
  address: string;
}

// ── HealthCore API fetch for profile operations ──

async function healthCoreFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const base = getHealthCoreApiBase();
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(base + url, { ...options, headers });

  if (res.status === 401) {
    // Token expired — will be handled by AuthGuard on next render
    throw new Error("Session expired");
  }

  if (!res.ok) {
    let detail = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.detail) detail = body.detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
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
      await healthCoreFetch("/profiles/me", {
        method: "PUT",
        body: JSON.stringify({
          name: formData.name || null,
          phone: formData.phone || null,
          address: formData.address || null,
        }),
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }, [formData]);

  const handleCancel = useCallback(() => {
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

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="text-sm text-gray-500">Unable to load profile.</div>
      </div>
    );
  }

  const profile = user.profile;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account details and contact information
        </p>
      </div>

      {/* Account info */}
      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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

      {/* Contact info */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full name</label>
              <input id="name" type="text" value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone number</label>
              <input id="phone" type="tel" value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <input id="address" type="text" value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-[#0069ff] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/20" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="rounded-lg bg-[#0069ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#0031c4] focus:outline-none focus:ring-2 focus:ring-[#0069ff]/30 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button onClick={handleCancel} disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-60">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Full name</p>
              <p className="mt-0.5 text-sm text-gray-900">
                {profile?.name || <span className="italic text-gray-400">Not set</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone number</p>
              <p className="mt-0.5 text-sm text-gray-900">
                {profile?.phone || <span className="italic text-gray-400">Not set</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="mt-0.5 text-sm text-gray-900">
                {profile?.address || <span className="italic text-gray-400">Not set</span>}
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