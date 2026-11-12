/**
 * HealthCore — Milestone 2: Search Operations
 *
 * Linear search for unsorted arrays and binary search for sorted arrays.
 *
 * @package @repo/shared-types
 */

import { Claim, Clinician } from "../types/models";

// ──────────────────────────────────────────────
// Linear Search
// ──────────────────────────────────────────────

/**
 * Find a claim by its ID using linear search.
 * Returns the claim if found, null otherwise.
 */
export function findClaimById(claims: Claim[], claimId: string): Claim | null {
  for (let i = 0; i < claims.length; i++) {
    if (claims[i].claimId === claimId) {
      return claims[i];
    }
  }
  return null;
}

/**
 * Find a clinician by their ID using linear search.
 * Returns the clinician if found, null otherwise.
 */
export function findClinicianById(
  clinicians: Clinician[],
  clinicianId: string,
): Clinician | null {
  for (let i = 0; i < clinicians.length; i++) {
    if (clinicians[i].clinicianId === clinicianId) {
      return clinicians[i];
    }
  }
  return null;
}

// ──────────────────────────────────────────────
// Binary Search
// ──────────────────────────────────────────────

/**
 * Binary search to find the index of a claim by its ID.
 * Assumes the array is already sorted by claimId ascending.
 * Returns the index if found, -1 otherwise.
 */
export function binarySearchClaimById(
  sortedClaims: Claim[],
  targetId: string,
): number {
  let left = 0;
  let right = sortedClaims.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midId = sortedClaims[mid].claimId;

    if (midId === targetId) {
      return mid;
    }

    if (midId < targetId) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}
