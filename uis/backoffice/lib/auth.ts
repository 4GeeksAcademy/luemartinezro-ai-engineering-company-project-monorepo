/**
 * Auth utilities — HealthCore Backoffice.
 *
 * Token management via localStorage.
 * - getToken / setToken / removeToken
 * - getAuthHeaders (for manual fetch calls)
 * - isAuthenticated
 */

const STORAGE_KEY = "hc_access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Redirect to /login, preserving the current location for a post-login redirect.
 */
export function redirectToLogin(): void {
  const current = window.location.pathname + window.location.search;
  if (current !== "/login" && current !== "/register") {
    window.location.href = `/login?redirect=${encodeURIComponent(current)}`;
  } else {
    window.location.href = "/login";
  }
}

/**
 * Handle an authentication error (401) — clear token and redirect.
 */
export function handleAuthError(): void {
  removeToken();
  redirectToLogin();
}