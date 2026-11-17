"use client";

/**
 * useAuth — Authentication hook for HealthCore Talent Pipeline Tracker.
 *
 * Provides login, register, logout, and user state.
 * Stores the JWT token in localStorage.
 * Auth endpoints go through the HealthCore API, not the Talent Tracker API.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  getHealthCoreApiBase,
} from "@/lib/auth";

// ── Types ──────────────────────────────────────────────────────────────────

interface Profile {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  address: string;
}

interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  profile: Profile | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface LoginParams {
  email: string;
  password: string;
}

interface RegisterParams {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  address?: string;
}

// ── HealthCore API fetch helper (no token injection needed for auth calls) ──

async function healthCoreFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const base = getHealthCoreApiBase();
  const fullUrl = url.startsWith("http") ? url : `${base}${url}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(fullUrl, { ...options, headers });

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

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  /**
   * Fetch the current user from GET /auth/me (only if token exists).
   */
  const fetchUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setState({ user: null, loading: false, error: null });
      return;
    }

    const token = getToken();
    try {
      const user = await healthCoreFetch<User>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setState({ user, loading: false, error: null });
    } catch {
      removeToken();
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /**
   * Login: POST /auth/login → store token → fetch user.
   */
  const login = useCallback(
    async (params: LoginParams) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await healthCoreFetch<{
          access_token: string;
          token_type: string;
        }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: params.email,
            password: params.password,
          }),
        });
        setToken(data.access_token);
        await fetchUser();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setState((prev) => ({ ...prev, loading: false, error: message }));
        return false;
      }
    },
    [fetchUser],
  );

  /**
   * Register: POST /users → POST /auth/login → store token → fetch user.
   */
  const register = useCallback(
    async (params: RegisterParams) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const body: Record<string, unknown> = {
          email: params.email,
          password: params.password,
        };
        if (params.name) body.name = params.name;
        if (params.phone) body.phone = params.phone;
        if (params.address) body.address = params.address;

        await healthCoreFetch("/users", {
          method: "POST",
          body: JSON.stringify(body),
        });

        const data = await healthCoreFetch<{
          access_token: string;
          token_type: string;
        }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: params.email,
            password: params.password,
          }),
        });

        setToken(data.access_token);
        await fetchUser();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed";
        setState((prev) => ({ ...prev, loading: false, error: message }));
        return false;
      }
    },
    [fetchUser],
  );

  /**
   * Logout: remove token → redirect to /login.
   */
  const logout = useCallback(() => {
    removeToken();
    setState({ user: null, loading: false, error: null });
    router.push("/login");
  }, [router]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: isAuthenticated(),
    login,
    register,
    logout,
    fetchUser,
  };
}