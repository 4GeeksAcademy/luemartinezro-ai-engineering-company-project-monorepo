// ──────────────────────────────────────────────
// HealthCore — Talent Pipeline Tracker Types
// ──────────────────────────────────────────────
// TypeScript interfaces based on the Talent Tracker API OpenAPI spec.

/** A candidate record as returned by the API */
export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  status: CandidateStatus;
  stage: CandidateStage;
  experience_years: number;
  notes_count: number;
  applied_at: string;
  updated_at: string;
  notes?: Note[];
}

/** Payload for creating or replacing a candidate */
export interface CandidateCreatePayload {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url?: string | null;
  cv_url?: string | null;
  experience_years: number;
}

/** Payload for patching a candidate (status / stage) */
export interface CandidatePatchPayload {
  status?: CandidateStatus | null;
  stage?: CandidateStage | null;
}

/** A note attached to a candidate record */
export interface Note {
  id: string;
  record_id: string;
  content: string;
  created_at: string;
}

/** Payload for creating a note */
export interface NoteCreatePayload {
  content: string;
}

/** Paginated response from GET /records */
export interface CandidatesResponse {
  total: number;
  page: number;
  limit: number;
  data: Candidate[];
}

/** Paginated response from GET /records/:id/notes */
export interface NotesResponse {
  data: Note[];
  meta: {
    total: number;
  };
}

// ──────────────────────────────────────────────
// Status and Stage Enums & Mappings
// ──────────────────────────────────────────────

/** Raw API status values */
export type CandidateStatus =
  | "received"
  | "in_progress"
  | "selected"
  | "discarded";

/** Raw API stage values */
export type CandidateStage =
  | "pending"
  | "review"
  | "personal_interview"
  | "technical_interview"
  | "offer_presented";

/** Human-readable label mapping for status values */
export const STATUS_LABELS: Record<CandidateStatus, string> = {
  received: "Received",
  in_progress: "In progress",
  selected: "Selected",
  discarded: "Discarded",
};

/** Human-readable label mapping for stage values */
export const STAGE_LABELS: Record<CandidateStage, string> = {
  pending: "Pending review",
  review: "Under review",
  personal_interview: "Personal interview",
  technical_interview: "Technical interview",
  offer_presented: "Offer presented",
};

/** Helper to get a human-readable status label */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as CandidateStatus] ?? status;
}

/** Helper to get a human-readable stage label */
export function getStageLabel(stage: string): string {
  return STAGE_LABELS[stage as CandidateStage] ?? stage;
}

/** All available status values (for dropdown controls) */
export const ALL_STATUSES: CandidateStatus[] = [
  "received",
  "in_progress",
  "selected",
  "discarded",
];

/** All available stage values (for dropdown controls) */
export const ALL_STAGES: CandidateStage[] = [
  "pending",
  "review",
  "personal_interview",
  "technical_interview",
  "offer_presented",
];