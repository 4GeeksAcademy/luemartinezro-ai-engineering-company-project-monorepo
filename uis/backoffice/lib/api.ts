/**
 * API base URL resolution helper — HealthCore Backoffice.
 *
 * Resolves the backend API base URL dynamically so the application works
 * in any environment (local, GitHub Codespaces, deployed) without hardcoding
 * `localhost`.
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

  // 2) GitHub Codespaces: preserve the workspace host and replace whichever
  //    forwarded frontend port is in use with the API's forwarded port.
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;

    if (hostname.endsWith("app.github.dev")) {
      return `${protocol}//${hostname.replace(/-\d+(?=\.app\.github\.dev$)/, "-8000")}`;
    }
  }

  // 3) Local development fallback
  return "http://localhost:8000";
}