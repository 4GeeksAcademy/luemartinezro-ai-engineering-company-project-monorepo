"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiBase } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${getApiBase()}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Role is intentionally omitted; the API assigns the least-privileged user role.
        body: JSON.stringify({ email, password, name, phone, address }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.detail ?? "Unable to create account. Please check your details and try again.");
        return;
      }
      router.push("/auth/login?registered=success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[#0069ff] focus:ring-2 focus:ring-[#0069ff]/20 disabled:opacity-50";

  return (
    <div className="mx-auto mt-10 max-w-md px-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-[#0016a2]">Create your account</h1>
        <p className="mt-2 text-sm text-gray-600">Register for a standard HealthCore account.</p>
        {error && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div><label htmlFor="name" className="block text-sm font-medium text-gray-700">Full name</label><input id="name" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} disabled={loading} className={inputClass} /></div>
          <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className={inputClass} /></div>
          <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone (optional)</label><input id="phone" type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} className={inputClass} /></div>
          <div><label htmlFor="address" className="block text-sm font-medium text-gray-700">Address (optional)</label><input id="address" autoComplete="street-address" maxLength={255} value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading} className={inputClass} /></div>
          <div><label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label><input id="password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className={inputClass} /></div>
          <div><label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm password</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={6} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} className={inputClass} /></div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#0069ff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0031c4] disabled:opacity-50">{loading ? "Creating account…" : "Create account"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">Already have an account? <Link href="/auth/login" className="font-medium text-[#0069ff] hover:text-[#0031c4]">Sign in</Link></p>
      </div>
    </div>
  );
}
