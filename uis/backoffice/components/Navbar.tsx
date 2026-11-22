"use client";

/**
 * Navbar — HealthCore Backoffice top navigation bar.
 *
 * Shows auth-aware controls: login/logout, user info, and navigation links.
 * Public pages (login, register) show a simplified nav without auth details.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// Pages that should NOT be wrapped in the AuthGuard
const PUBLIC_PATHS = ["/login", "/register"];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="HealthCore backoffice home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0016a2] text-sm font-bold text-white">
            HC
          </span>
          <span className="text-sm font-semibold text-[#0016a2]">HealthCore</span>
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-900">
            Staff
          </span>
        </Link>

        {/* ── Navigation ── */}
        <nav className="flex items-center gap-4 text-sm" aria-label="Internal navigation">
          {isPublicPage ? (
            /* ── Public pages — only show Public site link ── */
            <>
              <Link
                href="/login"
                className={`font-medium ${pathname === "/login" ? "text-[#0069ff]" : "text-gray-500 hover:text-[#0069ff]"}`}
              >
                Sign in
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/register"
                className={`font-medium ${pathname === "/register" ? "text-[#0069ff]" : "text-gray-500 hover:text-[#0069ff]"}`}
              >
                Register
              </Link>
            </>
          ) : isAuthenticated ? (
            /* ── Protected pages — full nav with user info ── */
            <>
              <Link
                href="/"
                className={`font-medium ${
                  pathname === "/" ? "text-[#0031c4]" : "text-gray-500 hover:text-[#0069ff]"
                }`}
              >
                Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/incidents"
                className={`font-medium ${
                  pathname.startsWith("/incidents")
                    ? "text-[#0031c4]"
                    : "text-gray-500 hover:text-[#0069ff]"
                }`}
              >
                Incidents
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/suppliers"
                className={`font-medium ${
                  pathname.startsWith("/suppliers")
                    ? "text-[#0031c4]"
                    : "text-gray-500 hover:text-[#0069ff]"
                }`}
              >
                Suppliers
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/account/profile"
                className={`font-medium ${
                  pathname.startsWith("/account")
                    ? "text-[#0031c4]"
                    : "text-gray-500 hover:text-[#0069ff]"
                }`}
              >
                {user?.profile?.name || user?.email || "Profile"}
              </Link>
              <span className="text-gray-300">|</span>
              <button
                onClick={logout}
                className="text-gray-500 transition hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            /* ── Loading / no auth yet — show minimal nav ── */
            <a
              href="http://localhost:3002"
              className="text-gray-500 transition hover:text-[#0069ff]"
            >
              Public site
            </a>
          )}

          {/* Public site link (always shown for authenticated users) */}
          {isAuthenticated && (
            <>
              <span className="text-gray-300">|</span>
              <a
                href="http://localhost:3002"
                className="text-gray-500 transition hover:text-[#0069ff]"
              >
                Public site
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}