"use client";

/**
 * ClientLayout — Wraps page content with route protection.
 *
 * Applies AuthGuard to all routes except /login and /register.
 */

import { usePathname } from "next/navigation";
import AuthGuard from "./AuthGuard";

const PUBLIC_PATHS = ["/login", "/register"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (PUBLIC_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return <AuthGuard>{children}</AuthGuard>;
}