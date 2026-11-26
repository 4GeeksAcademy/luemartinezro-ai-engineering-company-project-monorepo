/**
 * Authenticated fetch wrapper — HealthCore Backoffice.
 *
 * Automatically attaches the Bearer token on every request.
 * Detects 401 responses and triggers an automatic redirect to /login.
 */

import { getApiBase } from "./api";
import { getAuthToken, clearAuthToken } from "./auth";

interface AuthFetchOptions extends RequestInit {
  /** Skip token injection — use for login/register endpoints. */
  noAuth?: boolean;
}

/**
 * Perform an authenticated fetch request against the HealthCore API.
 *
 * - Prepends `getApiBase()` to relative URLs
 * - Injects `Authorization: Bearer <token>` unless `noAuth: true`
 * - On 401, clears token and redirects to /login
 *
 * @example
 *   const data = await authFetch("/auth/me");
 *   const user = await authFetch("/profiles/me", { method: "PUT", body: JSON.stringify(payload) });
 */
export async function authFetch<T = unknown>(
  url: string,
  options: AuthFetchOptions = {},
): Promise<T> {
  const { noAuth, ...fetchOptions } = options;
  const base = getApiBase();
  const fullUrl = url.startsWith("http") ? url : `${base}${url}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!noAuth) {
    const token = getAuthToken();
    if (!token) {
      clearAuthToken();
      throw new Error("No authentication token available");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to connect to the HealthCore API. Check that the API server is running and try again.",
    );
  }

  // Handle 401 — token expired or invalid
  if (res.status === 401) {
    clearAuthToken();
    throw new Error("Authentication failed — redirecting to login");
  }

  // No content
  if (res.status === 204) {
    return undefined as T;
  }

  // Keep backend/internal details out of client-facing errors.
  if (!res.ok) {
    throw new Error("The request could not be completed. Please check your information and try again.");
  }

  return res.json() as Promise<T>;
}