/**
 * API base URL resolution helper — HealthCore Application.
 *
 * Resolves the backend API base URL dynamically so the application works
 * in any environment without hardcoding `localhost`.
 *
 * Resolution order:
 *   1. `NEXT_PUBLIC_API_URL` (explicit per-environment override, highest priority)
 *   2. Codespaces: derive the forwarded backend host from the current origin
 *   3. Fallback: local development (`http://localhost:8000`)
 */

export function getApiBase(): string {
  // 1) Explicit override via environment variable (optional)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2) GitHub Codespaces: https://<workspace>-3000.app.github.dev
  //    → https://<workspace>-8000.app.github.dev (forwarded backend port)
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;

    if (hostname.endsWith("app.github.dev")) {
      return `${protocol}//${hostname.replace(/-3000(?=\.)/, "-8000")}`;
    }
  }

  // 3) Local development fallback
  return "http://localhost:8000";
}