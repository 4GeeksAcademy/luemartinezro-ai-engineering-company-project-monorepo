/**
 * HealthCore — Milestone 2: Validation Utilities
 *
 * Valida reclamaciones (claims), clínicos (clinicians) y comparadores
 * de umbrales para denial rate y no-show rate.
 *
 * @package @repo/shared-types
 */

import { Claim, Clinician, ClinicianRole } from "../types/models";

// ──────────────────────────────────────────────
// Claim Validation
// ──────────────────────────────────────────────

/**
 * Validate a claim against business rules.
 *
 * Rules:
 *  - claimAmount > 0
 *  - submissionDate not in the future
 *  - locationId is in knownLocationIds
 *  - if status === "denied", denialReason must be present and non-empty
 *  - patientId matches pattern HC-XXXXXX (X = digit)
 */
export function validateClaim(
  claim: Claim,
  knownLocationIds: string[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // claimAmount > 0
  if (claim.claimAmount <= 0) {
    errors.push("claimAmount must be greater than 0");
  }

  // submissionDate not in the future
  const submission = new Date(claim.submissionDate);
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);
  if (submission > today) {
    errors.push("submissionDate cannot be in the future");
  }

  // locationId in knownLocationIds
  if (!knownLocationIds.includes(claim.locationId)) {
    errors.push(`locationId "${claim.locationId}" is not a known location`);
  }

  // if denied, denialReason required
  if (claim.status === "denied" && (!claim.denialReason || claim.denialReason.trim() === "")) {
    errors.push("denialReason is required when status is denied");
  }

  // patientId matches HC-XXXXXX
  const patientIdRegex = /^HC-\d{6}$/;
  if (!patientIdRegex.test(claim.patientId)) {
    errors.push('patientId must match format HC-XXXXXX (e.g. HC-123456)');
  }

  return { valid: errors.length === 0, errors };
}

// ──────────────────────────────────────────────
// Clinician Validation
// ──────────────────────────────────────────────

/**
 * Validate a clinician record.
 *
 * Rules:
 *  - cmeHoursRequired >= 0
 *  - cmeHoursLogged >= 0
 *  - licenceExpiryDate is a valid date, not in the past
 *  - role is one of the defined ClinicianRole values
 */
export function validateClinician(
  clinician: Clinician,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validRoles: ClinicianRole[] = [
    "physician",
    "nurse_practitioner",
    "nurse",
    "medical_assistant",
  ];

  // cmeHoursRequired >= 0
  if (clinician.cmeHoursRequired < 0) {
    errors.push("cmeHoursRequired must be >= 0");
  }

  // cmeHoursLogged >= 0
  if (clinician.cmeHoursLogged < 0) {
    errors.push("cmeHoursLogged must be >= 0");
  }

  // licenceExpiryDate valid — present or future
  const expiry = new Date(clinician.licenceExpiryDate);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (isNaN(expiry.getTime())) {
    errors.push("licenceExpiryDate is not a valid date");
  } else if (expiry < today) {
    errors.push("licenceExpiryDate must be today or in the future");
  }

  // role validation
  if (!validRoles.includes(clinician.role)) {
    errors.push(
      `role must be one of: ${validRoles.join(", ")}`,
    );
  }

  return { valid: errors.length === 0, errors };
}

// ──────────────────────────────────────────────
// Threshold Helpers
// ──────────────────────────────────────────────

/**
 * Check if a denial rate exceeds the given threshold (default 8%).
 */
export function isDenialRateAboveThreshold(
  rate: number,
  threshold: number = 8,
): boolean {
  return rate > threshold;
}

/**
 * Check if a no-show rate exceeds the given threshold (default 20%).
 */
export function isNoShowRateAboveThreshold(
  rate: number,
  threshold: number = 20,
): boolean {
  return rate > threshold;
}
