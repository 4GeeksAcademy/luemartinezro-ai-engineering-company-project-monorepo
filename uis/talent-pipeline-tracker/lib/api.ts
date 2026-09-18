// ──────────────────────────────────────────────
// HealthCore — Talent Pipeline Tracker API Service
// ──────────────────────────────────────────────
// All API calls to the Talent Tracker backend.

import type {
  Candidate,
  CandidateCreatePayload,
  CandidatePatchPayload,
  CandidatesResponse,
  Note,
  NoteCreatePayload,
  NotesResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Request failed: ${res.status} ${res.statusText} — ${errorBody}`
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// ──────────────────────────────────────────────
// Candidates
// ──────────────────────────────────────────────

export interface FetchCandidatesParams {
  status?: string;
  stage?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchCandidates(
  params?: FetchCandidatesParams
): Promise<CandidatesResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.stage) query.set("stage", params.stage);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return request<CandidatesResponse>(
    `/records${qs ? `?${qs}` : ""}`
  );
}

export async function fetchCandidate(id: string): Promise<Candidate> {
  return request<Candidate>(`/records/${id}`);
}

export async function createCandidate(
  data: CandidateCreatePayload
): Promise<Candidate> {
  return request<Candidate>(`/records`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCandidate(
  id: string,
  data: CandidateCreatePayload
): Promise<Candidate> {
  return request<Candidate>(`/records/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function patchCandidate(
  id: string,
  data: CandidatePatchPayload
): Promise<Candidate> {
  return request<Candidate>(`/records/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ──────────────────────────────────────────────
// Notes
// ──────────────────────────────────────────────

export async function fetchNotes(candidateId: string): Promise<Note[]> {
  const response = await request<NotesResponse>(`/records/${candidateId}/notes`);
  return response.data;
}

export async function createNote(
  candidateId: string,
  data: NoteCreatePayload
): Promise<Note> {
  return request<Note>(`/records/${candidateId}/notes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteNote(
  candidateId: string,
  noteId: string
): Promise<void> {
  return request<void>(`/records/${candidateId}/notes/${noteId}`, {
    method: "DELETE",
  });
}