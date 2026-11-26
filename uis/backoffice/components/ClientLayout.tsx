"use client";

/**
 * ClientLayout — Wraps the page content with route protection.
 *
 * Applies AuthGuard to all routes except /login and /register.
 */

import { usePathname } from "next/navigation";
import AuthGuard from "./AuthGuard";

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/login", "/register"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return <AuthGuard>{children}</AuthGuard>;
}