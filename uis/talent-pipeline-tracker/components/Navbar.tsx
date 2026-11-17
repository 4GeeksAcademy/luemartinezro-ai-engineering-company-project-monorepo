"use client";

/**
 * Navbar — HealthCore Talent Pipeline Tracker nav bar.
 *
 * Shows auth-aware controls: login/logout, user info, and navigation links.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const PUBLIC_PATHS = ["/login", "/register"];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0069ff] text-sm font-bold text-white">
            HC
          </div>
          <span className="text-base font-semibold text-gray-900">HealthCore</span>
          <span className="hidden text-sm text-gray-400 sm:inline">
            — Talent Pipeline Tracker
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {isPublicPage ? (
            <>
              <Link
                href="/login"
                className={`text-sm font-medium ${
                  pathname === "/login" ? "text-[#0069ff]" : "text-gray-500 hover:text-[#0069ff]"
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={`text-sm font-medium ${
                  pathname === "/register" ? "text-[#0069ff]" : "text-gray-500 hover:text-[#0069ff]"
                }`}
              >
                Register
              </Link>
            </>
          ) : isAuthenticated ? (
            <>
              <Link
                href="/"
                className={`text-sm font-medium ${
                  pathname === "/" ? "text-[#0069ff]" : "text-gray-500 hover:text-[#0069ff]"
                }`}
              >
                Candidates
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/account/profile"
                className={`text-sm font-medium ${
                  pathname.startsWith("/account")
                    ? "text-[#0069ff]"
                    : "text-gray-500 hover:text-[#0069ff]"
                }`}
              >
                {user?.profile?.name || user?.email || "Profile"}
              </Link>
              <span className="text-gray-300">|</span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 transition hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}