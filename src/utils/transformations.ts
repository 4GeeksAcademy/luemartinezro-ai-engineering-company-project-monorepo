/**
 * HealthCore — Milestone 2: Transformations / Business Calculators
 *
 * Billing Denial Rate Calculator (Section 3)
 * No-Show Cost Estimator       (Section 4)
 * CME Compliance Tracker       (Section 5)
 *
 * @package @repo/shared-types
 */

import {
  Claim,
  Appointment,
  Clinician,
  Location,
  CMEReport,
  CMEStatus,
  ClinicianRole,
} from "../types/models";

// ══════════════════════════════════════════════
// SECTION 3 — Billing Denial Rate Calculator
// ══════════════════════════════════════════════

/**
 * Calculate the overall denial rate for a set of claims.
 * rate = (denied claims / total claims) × 100
 * Rounded to 2 decimal places.
 * Throws if the claims array is empty.
 */
export function calculateDenialRate(claims: Claim[]): number {
  if (claims.length === 0) {
    throw new Error("Cannot calculate denial rate for an empty claims array");
  }
  const denied = claims.filter((c) => c.status === "denied").length;
  const rate = (denied / claims.length) * 100;
  return Math.round(rate * 100) / 100;
}

/**
 * Denial rate grouped by payer name.
 */
export function denialRateByPayer(
  claims: Claim[],
): Record<string, number> {
  const grouped: Record<string, Claim[]> = {};
  for (const claim of claims) {
    if (!grouped[claim.payerName]) {
      grouped[claim.payerName] = [];
    }
    grouped[claim.payerName].push(claim);
  }

  const result: Record<string, number> = {};
  for (const [payer, payerClaims] of Object.entries(grouped)) {
    const denied = payerClaims.filter((c) => c.status === "denied").length;
    const rate = (denied / payerClaims.length) * 100;
    result[payer] = Math.round(rate * 100) / 100;
  }
  return result;
}

/**
 * Denial rate grouped by location ID.
 */
export function denialRateByLocation(
  claims: Claim[],
): Record<string, number> {
  const grouped: Record<string, Claim[]> = {};
  for (const claim of claims) {
    if (!grouped[claim.locationId]) {
      grouped[claim.locationId] = [];
    }
    grouped[claim.locationId].push(claim);
  }

  const result: Record<string, number> = {};
  for (const [locId, locClaims] of Object.entries(grouped)) {
    const denied = locClaims.filter((c) => c.status === "denied").length;
    const rate = (denied / locClaims.length) * 100;
    result[locId] = Math.round(rate * 100) / 100;
  }
  return result;
}

/**
 * Return payer names whose denial rate exceeds the threshold (default 8%).
 */
export function flagHighDenialPayers(
  claims: Claim[],
  threshold: number = 8,
): string[] {
  const rates = denialRateByPayer(claims);
  return Object.entries(rates)
    .filter(([, rate]) => rate > threshold)
    .map(([payer]) => payer);
}

// ══════════════════════════════════════════════
// SECTION 4 — No-Show Cost Estimator
// ══════════════════════════════════════════════

/**
 * Estimate the total cost of no-show appointments for a given location
 * during the week ending on `weekEndingDate`.
 * Assumes: no-show appointments are those with status "no_show",
 * and the cost is the location's averageConsultationFee for each service type.
 */
export function calculateNoShowCost(
  appointments: Appointment[],
  location: Location,
  weekEndingDate: string,
): number {
  const weekStart = subtractDays(weekEndingDate, 6);

  const noShows = appointments.filter(
    (apt) =>
      apt.status === "no_show" &&
      apt.locationId === location.locationId &&
      apt.scheduledDate >= weekStart &&
      apt.scheduledDate <= weekEndingDate,
  );

  let totalCost = 0;
  for (const apt of noShows) {
    const fee = location.averageConsultationFee[apt.serviceType] ?? 0;
    totalCost += fee;
  }
  return totalCost;
}

/**
 * Calculate the no-show rate (percentage) per location.
 */
export function noShowRateByLocation(
  appointments: Appointment[],
): Record<string, number> {
  const grouped: Record<string, { total: number; noShow: number }> = {};
  for (const apt of appointments) {
    if (!grouped[apt.locationId]) {
      grouped[apt.locationId] = { total: 0, noShow: 0 };
    }
    grouped[apt.locationId].total++;
    if (apt.status === "no_show") {
      grouped[apt.locationId].noShow++;
    }
  }

  const result: Record<string, number> = {};
  for (const [locId, counts] of Object.entries(grouped)) {
    const rate = (counts.noShow / counts.total) * 100;
    result[locId] = Math.round(rate * 100) / 100;
  }
  return result;
}

/**
 * Return location IDs whose no-show rate exceeds the threshold (default 20%).
 */
export function flagHighNoShowLocations(
  appointments: Appointment[],
  threshold: number = 20,
): string[] {
  const rates = noShowRateByLocation(appointments);
  return Object.entries(rates)
    .filter(([, rate]) => rate > threshold)
    .map(([locId]) => locId);
}

// ══════════════════════════════════════════════
// SECTION 5 — CME Compliance Tracker
// ══════════════════════════════════════════════

/**
 * Determine the CME compliance status for a clinician relative to a given date.
 */
function computeCMEStatus(
  hoursRequired: number,
  hoursLogged: number,
  yearStartDate: string,
  asOfDate: string,
): CMEStatus {
  const yearStart = new Date(yearStartDate);
  const asOf = new Date(asOfDate);

  // Year length in ms (roughly 365.25 days)
  const yearMs = 365.25 * 24 * 60 * 60 * 1000;
  const yearEnd = new Date(yearStart.getTime() + yearMs);

  if (hoursLogged >= hoursRequired) {
    return "complete";
  }

  // If we are past the year end date, it's overdue
  if (asOf >= yearEnd) {
    return "overdue";
  }

  // Estimate progress: linear time-based expectation
  const elapsed = asOf.getTime() - yearStart.getTime();
  const totalDuration = yearEnd.getTime() - yearStart.getTime();
  const expectedProgress = elapsed / totalDuration; // 0..1
  const loggedProgress = hoursRequired > 0 ? hoursLogged / hoursRequired : 0;

  // If logged progress is less than 75% of expected, flag at_risk
  if (expectedProgress > 0 && loggedProgress < expectedProgress * 0.75) {
    return "at_risk";
  }

  return "on_track";
}

/**
 * Helper: parse "YYYY-MM-DD" and subtract N days, returning "YYYY-MM-DD".
 */
function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() - days);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Helper: calculate days remaining from asOfDate to the target date.
 */
function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Generate a CME compliance report for all clinicians.
 */
export function generateCMEReport(
  clinicians: Clinician[],
  asOfDate: string,
): CMEReport[] {
  return clinicians.map((doc) => {
    const hoursRemaining = Math.max(0, doc.cmeHoursRequired - doc.cmeHoursLogged);
    const percentComplete =
      doc.cmeHoursRequired > 0
        ? Math.round((doc.cmeHoursLogged / doc.cmeHoursRequired) * 100)
        : 0;

    const yearStart = new Date(doc.cmeYearStartDate);
    const yearMs = 365.25 * 24 * 60 * 60 * 1000;
    const yearEndDate = new Date(yearStart.getTime() + yearMs);
    const yearEndStr = `${yearEndDate.getUTCFullYear()}-${String(yearEndDate.getUTCMonth() + 1).padStart(2, "0")}-${String(yearEndDate.getUTCDate()).padStart(2, "0")}`;

    const daysRemainingInCycle = daysBetween(asOfDate, yearEndStr);
    const complianceStatus = computeCMEStatus(
      doc.cmeHoursRequired,
      doc.cmeHoursLogged,
      doc.cmeYearStartDate,
      asOfDate,
    );

    const licenceDaysRemaining = daysBetween(
      asOfDate,
      doc.licenceExpiryDate,
    );

    return {
      clinicianId: doc.clinicianId,
      fullName: `${doc.firstName} ${doc.lastName}`,
      role: doc.role,
      locationId: doc.locationId,
      hoursRequired: doc.cmeHoursRequired,
      hoursLogged: doc.cmeHoursLogged,
      hoursRemaining,
      percentComplete,
      daysRemainingInCycle,
      complianceStatus,
      licenceExpiryDate: doc.licenceExpiryDate,
      licenceDaysRemaining,
    };
  });
}

/**
 * Return clinicians whose CME status is "at_risk" or "overdue".
 */
export function getCliniciansAtRisk(
  clinicians: Clinician[],
  asOfDate: string,
): Clinician[] {
  return clinicians.filter((doc) => {
    const status = computeCMEStatus(
      doc.cmeHoursRequired,
      doc.cmeHoursLogged,
      doc.cmeYearStartDate,
      asOfDate,
    );
    return status === "at_risk" || status === "overdue";
  });
}

/**
 * Return clinicians whose licence expires within `daysThreshold` days.
 */
export function getCliniciansWithExpiringLicences(
  clinicians: Clinician[],
  asOfDate: string,
  daysThreshold: number,
): Clinician[] {
  return clinicians.filter((doc) => {
    const remaining = daysBetween(asOfDate, doc.licenceExpiryDate);
    return remaining >= 0 && remaining <= daysThreshold;
  });
}
