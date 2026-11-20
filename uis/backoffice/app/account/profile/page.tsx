"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthToken, getAuthToken } from "@/lib/auth";
import { getApiBase } from "@/lib/api";

type Profile = { id: number; user_id: number; name: string; phone: string; address: string };

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      const token = getAuthToken();
      if (!token) {
        if (active) {
          setAuthenticated(false);
          setLoading(false);
        }
        return;
      }
      if (active) setAuthenticated(true);
      try {
        const response = await fetch(`${getApiBase()}/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (response.status === 401) {
          clearAuthToken();
          if (active) {
            setAuthenticated(false);
            setError("Your session has expired. Please sign in again.");
          }
          return;
        }
        if (!response.ok) throw new Error("Unable to load your profile.");
        const data: Profile = await response.json();
        if (active) {
          setProfile(data);
          setName(data.name);
          setPhone(data.phone);
          setAddress(data.address);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Network error. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProfile();
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getAuthToken();
    if (!token) {
      setError("Please sign in to update your profile.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${getApiBase()}/profiles/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, phone, address }),
      });
      if (response.status === 401) {
        clearAuthToken();
        setAuthenticated(false);
        setError("Your session has expired. Please sign in again.");
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail ?? "Unable to save your profile.");
      }
      const updated: Profile = await response.json();
      // Render the PUT response immediately; follow with a fresh GET to confirm persistence.
      setProfile(updated);
      setName(updated.name);
      setPhone(updated.phone);
      setAddress(updated.address);

      const refresh = await fetch(`${getApiBase()}/profiles/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (refresh.status === 401) {
        clearAuthToken();
        setAuthenticated(false);
        setError("Your session has expired. Please sign in again.");
        return;
      }
      if (!refresh.ok) throw new Error("Your profile was saved, but could not be refreshed. Please try again.");
      const confirmed: Profile = await refresh.json();
      setProfile(confirmed);
      setName(confirmed.name);
      setPhone(confirmed.phone);
      setAddress(confirmed.address);
      setSuccess("Profile updated successfully.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="mx-auto mt-12 max-w-xl px-4 text-sm text-gray-600">Loading profile…</p>;

  if (!authenticated || (!profile && error?.includes("sign in")) || (!profile && error?.includes("session has expired"))) {
    return (
      <section className="mx-auto mt-12 max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-[#0016a2]">Sign in required</h1>
        <p className="mt-2 text-sm text-gray-600">Sign in to view and update your profile.</p>
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        <Link href="/auth/login" className="mt-5 inline-block rounded-lg bg-[#0069ff] px-4 py-2 text-sm font-semibold text-white">Go to sign in</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-8 max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-[#0016a2]">Your profile</h1>
      <p className="mt-2 text-sm text-gray-600">Update your contact information.</p>
      {error && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error} <Link href="/auth/login" className="font-semibold underline">Sign in</Link></div>}
      {success && <div role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div><label htmlFor="name" className="block text-sm font-medium text-gray-700">Full name</label><input id="name" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} disabled={saving} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20 disabled:opacity-50" /></div>
        <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label><input id="phone" type="tel" maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} disabled={saving} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20 disabled:opacity-50" /></div>
        <div><label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label><input id="address" maxLength={255} value={address} onChange={(event) => setAddress(event.target.value)} disabled={saving} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20 disabled:opacity-50" /></div>
        <button type="submit" disabled={saving || !profile} className="rounded-lg bg-[#0069ff] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0031c4] disabled:opacity-50">{saving ? "Saving…" : "Save profile"}</button>
      </form>
    </section>
  );
}
