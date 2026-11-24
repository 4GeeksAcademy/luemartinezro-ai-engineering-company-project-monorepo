"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_CHANGED_EVENT, clearAuthToken, getAuthToken } from "@/lib/auth";
import { getWebsiteBase } from "@/lib/website";

export default function BackofficeNavigation() {
  const [authenticated, setAuthenticated] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const syncAuth = () => setAuthenticated(Boolean(getAuthToken()));
    syncAuth();
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    window.addEventListener("storage", syncAuth);
    setWebsiteUrl(getWebsiteBase());
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  function logout() {
    clearAuthToken();
    setAuthenticated(false);
    router.push("/auth/login");
  }

  const linkClass = (href: string) =>
    `font-medium ${pathname === href ? "text-[#0016a2]" : "text-[#0031c4]"}`;

  return (
    <nav className="flex items-center gap-3 text-sm" aria-label="Internal navigation">
      <Link href="/" className={linkClass("/")}>Dashboard</Link>
      <span className="text-gray-300" aria-hidden="true">|</span>
      <Link href="/incidents" className={linkClass("/incidents")}>Incidents</Link>
      <span className="text-gray-300" aria-hidden="true">|</span>
      <Link href="/suppliers" className={linkClass("/suppliers")}>Suppliers</Link>
      <span className="text-gray-300" aria-hidden="true">|</span>
      {authenticated ? (
        <>
          <Link href="/account/profile" className={linkClass("/account/profile")}>Profile</Link>
          <Link href="/account/change-password" className={linkClass("/account/change-password")}>Password</Link>
          <button type="button" onClick={logout} className="font-medium text-[#0031c4] hover:text-[#0016a2]">
            Sign out
          </button>
        </>
      ) : (
        <>
          <Link href="/auth/login" className={linkClass("/auth/login")}>Sign in</Link>
          <Link href="/auth/register" className={linkClass("/auth/register")}>Create account</Link>
        </>
      )}
      <span className="text-gray-300" aria-hidden="true">|</span>
      <a href={websiteUrl || "#"} aria-disabled={!websiteUrl} className="text-gray-500 transition hover:text-[#0069ff]" onClick={(event) => { if (!websiteUrl) event.preventDefault(); }}>
        Public site
      </a>
    </nav>
  );
}
