"use client";

/**
 * AuthGuard — Route protection component for Talent Pipeline Tracker.
 *
 * Wraps pages that require authentication.
 * If the user has no token in localStorage, they are redirected to /login.
 * If the token exists but the user data is still loading, shows a brief loading state.
 */

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export default function AuthGuard({
  children,
  loadingFallback,
}: AuthGuardProps) {
  const router = useRouter();
  const { loading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      const currentPath = window.location.pathname + window.location.search;
      const redirect = encodeURIComponent(currentPath);
      router.push(`/login?redirect=${redirect}`);
    }
  }, [router]);

  if (!isAuthenticated()) {
    return null;
  }

  if (loading) {
    return (
      loadingFallback ?? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0069ff] border-t-transparent" />
            <p className="text-sm text-gray-500">Verifying session...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}