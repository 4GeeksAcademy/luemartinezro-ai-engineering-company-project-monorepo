"use client";

/**
 * useAuth — Authentication hook for HealthCore Backoffice.
 *
 * Provides login, register, logout, and user state.
 * Stores the JWT token in localStorage.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { getToken, setToken, removeToken, isAuthenticated } from "@/lib/auth";

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

    try {
      const user = await authFetch<User>("/auth/me");
      setState({ user, loading: false, error: null });
    } catch {
      // Token invalid or expired — clear it
      removeToken();
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  // Fetch user on mount when token exists
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
        const data = await authFetch<{ access_token: string; token_type: string }>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({
              email: params.email,
              password: params.password,
            }),
            noAuth: true,
          },
        );
        setToken(data.access_token);
        await fetchUser();
        return true;
      } catch {
        setState((prev) => ({ ...prev, loading: false, error: "We couldn’t sign you in. Check your email and password, then try again." }));
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
        // 1) Create user with optional profile fields
        const body: Record<string, unknown> = {
          email: params.email,
          password: params.password,
        };
        if (params.name) body.name = params.name;
        if (params.phone) body.phone = params.phone;
        if (params.address) body.address = params.address;

        await authFetch("/users", {
          method: "POST",
          body: JSON.stringify(body),
          noAuth: true,
        });

        // 2) Login with the same credentials
        const data = await authFetch<{ access_token: string; token_type: string }>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({
              email: params.email,
              password: params.password,
            }),
            noAuth: true,
          },
        );

        setToken(data.access_token);
        await fetchUser();
        return true;
      } catch {
        setState((prev) => ({ ...prev, loading: false, error: "We couldn’t create your account. Check your details and try again." }));
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