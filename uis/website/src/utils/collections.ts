/**
 * HealthCore — Milestone 2: Collection Operations
 *
 * Functions to filter, sort, and group claims and appointments.
 * All functions are pure — they do not mutate the original arrays.
 *
 * @package @repo/shared-types
 */

import { Claim, Appointment, AppointmentStatus } from "../types/models";

// ──────────────────────────────────────────────
// Filtering
// ──────────────────────────────────────────────

/**
 * Filter claims that match ALL provided criteria.
 * Ignores filter keys that are not provided.
 */
export function filterClaims(
  claims: Claim[],
  filters: Partial<Pick<Claim, "locationId" | "status" | "payerName" | "serviceType">>,
): Claim[] {
  return claims.filter((claim) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null) return true;
      return (claim as unknown as Record<string, unknown>)[key] === value;
    });
  });
}

/**
 * Filter appointments whose status matches any of the provided statuses.
 */
export function filterAppointmentsByStatus(
  appointments: Appointment[],
  statuses: AppointmentStatus[],
): Appointment[] {
  return appointments.filter((apt) => statuses.includes(apt.status));
}

// ──────────────────────────────────────────────
// Sorting
// ──────────────────────────────────────────────

/**
 * Sort claims alphanumerically by claimId. Does not mutate the original array.
 */
export function sortClaimsById(
  claims: Claim[],
  direction: "asc" | "desc",
): Claim[] {
  const sorted = [...claims].sort((a, b) => a.claimId.localeCompare(b.claimId));
  return direction === "desc" ? sorted.reverse() : sorted;
}

/**
 * Sort appointments by scheduledDate. Does not mutate the original array.
 */
export function sortAppointmentsByDate(
  appointments: Appointment[],
  direction: "asc" | "desc",
): Appointment[] {
  const sorted = [...appointments].sort((a, b) =>
    a.scheduledDate.localeCompare(b.scheduledDate),
  );
  return direction === "desc" ? sorted.reverse() : sorted;
}

// ──────────────────────────────────────────────
// Grouping
// ──────────────────────────────────────────────

/**
 * Group claims by a specified key.
 */
export function groupClaimsBy(
  claims: Claim[],
  key: "locationId" | "payerName" | "status" | "serviceType",
): Record<string, Claim[]> {
  const result: Record<string, Claim[]> = {};
  for (const claim of claims) {
    const groupKey = String((claim as unknown as Record<string, unknown>)[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(claim);
  }
  return result;
}
