/**
 * API base URL resolution helper — HealthCore Backoffice.
 *
 * Use a same-origin Next.js rewrite so browser requests don't need direct
 * access to the separately forwarded API port (important in Codespaces).
 * Configure HEALTHCORE_API_URL on the Next.js server for non-local backends.
 */

export function getApiBase(): string {
  return "/api/healthcore";
}