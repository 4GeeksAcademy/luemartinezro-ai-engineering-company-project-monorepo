/** Resolve the public website URL without assuming a fixed frontend origin. */
export function getWebsiteBase(): string {
  const configured = process.env.NEXT_PUBLIC_WEBSITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (typeof window === "undefined") return "";

  const { hostname, protocol } = window.location;
  if (hostname.endsWith("app.github.dev")) {
    // Codespaces preserves the workspace hostname and replaces the port suffix.
    const websiteHost = hostname.replace(/-\d+(?=\.app\.github\.dev$)/, "-3002");
    return `${protocol}//${websiteHost}`;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:3002`;
  }

  return "";
}
