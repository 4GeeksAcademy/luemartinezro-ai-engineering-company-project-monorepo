"""
HealthCore — Incident Analysis Service.

Reusable logic for loading, validating, and analyzing patient incident CSV files.
Used by both the CLI script (scripts/analyze.py) and the FastAPI backend.
"""

import csv
import re
import os
from typing import Any

# ── Constants ──────────────────────────────────────────────────────────────

VALID_CLINICS: dict[str, str] = {
    "US-TX-01": "US",
    "US-TX-02": "US",
    "US-TX-03": "US",
    "US-FL-01": "US",
    "US-FL-02": "US",
    "US-FL-03": "US",
    "US-GA-01": "US",
    "US-GA-02": "US",
    "US-GA-03": "US",
    "UK-LON-01": "UK",
    "UK-LON-02": "UK",
    "UK-MAN-01": "UK",
}

VALID_CATEGORIES: set[str] = {
    "APPOINTMENT",
    "BILLING",
    "CLINICAL_CARE",
    "ACCESSIBILITY",
    "ADMINISTRATIVE",
}

VALID_CATEGORIES_ORDERED: list[str] = [
    "APPOINTMENT",
    "BILLING",
    "CLINICAL_CARE",
    "ACCESSIBILITY",
    "ADMINISTRATIVE",
]

VALID_STATUSES: set[str] = {"OPEN", "CLOSED", "DISCARDED"}

VALID_STATUSES_ORDERED: list[str] = [
    "OPEN",
    "CLOSED",
    "DISCARDED",
]

PATIENT_ID_RE = re.compile(r"^PAT-\d{6}$")

# Column indices
COL_INCIDENT_ID = 1
COL_DATE = 2
COL_CLINIC_ID = 3
COL_COUNTRY = 4
COL_CATEGORY = 5
COL_DESCRIPTION = 6
COL_STATUS = 7
COL_PATIENT_ID = 8
COL_SATISFACTION_SCORE = 9

# Canonical schema: header name -> internal column index.
# Allows parsing CSVs whose columns are ordered differently or that
# carry extra leading columns (e.g. an unnumbered index column).
COLUMN_ORDER: list[str] = [
    "incident_id",
    "date",
    "clinic_id",
    "country",
    "category",
    "description",
    "status",
    "patient_id",
    "satisfaction_score",
]

# Expected field names and their canonical position (0-based within the header).
CANONICAL_HEADER: dict[str, int] = {name: i for i, name in enumerate(COLUMN_ORDER)}

# Delimiters we attempt to parse, in priority order. The BRIEFING defines
# the comma as the standard separator, but real exports may arrive with
# tabs or whitespace-separated values.
CANDIDATE_DELIMITERS: list[str] = [",", "\t", ";"]


# ── CSV parsing (delimiter-tolerant) ───────────────────────────────────────

def _detect_delimiter(sample: str) -> str:
    """
    Best-effort detection of the CSV delimiter for the given text sample.

    Tries ``csv.Sniffer`` first; if that fails (small/irregular files,
    single-column data, etc.) falls back to counting how many candidate
    delimiters appear on the first non-empty line. Defaults to the BRIEFING
    standard (``,``) so the caller never crashes on detection.
    """
    # 1) Let the stdlib sniffer try (wrapped so errors never escape).
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",\t; ")
        if dialect.delimiter in CANDIDATE_DELIMITERS:
            return dialect.delimiter
    except (csv.Error, TypeError):
        pass

    # 2) Fallback: choose the most frequent candidate on the header line.
    try:
        first_line = next(line for line in sample.splitlines() if line.strip())
    except StopIteration:
        return ","

    counts = {d: first_line.count(d) for d in CANDIDATE_DELIMITERS}
    best = max(counts, key=counts.get)
    if counts[best] > 0:
        return best

    # 3) Default to the BRIEFING standard.
    return ","


def _split_whitespace_row(line: str) -> list[str]:
    """Split a whitespace-separated row, collapsing runs of spaces/tabs."""
    return line.split()


def _reconstruct_whitespace_row(line: str) -> list[str] | None:
    """
    Rebuild a 9-field HealthCore row from a whitespace-separated line.

    Whitespace-separated files are inherently ambiguous when a field
    (``description``) may itself contain spaces. This uses the known
    schema anchors to rebuild the row:

      incident_id date clinic_id country category <description...> status patient_id [score]

    Returns a 9-element list, or ``None`` if the line does not match.
    """
    tokens = line.split()
    if len(tokens) < 8:  # minimum: 5 fixed + 1 description + 2 trailing
        return None

    # Anchor on the last two tokens: patient_id (PAT-XXXXXX) and optional score.
    patient_idx = None
    for i in range(len(tokens) - 1, -1, -1):
        if PATIENT_ID_RE.match(tokens[i]):
            patient_idx = i
            break

    # If no valid patient_id token, assume the schema position: 1 fixed
    # trailing score token, patient_id before it.
    if patient_idx is None:
        # Fall back to positional: last token may be a score or patient_id.
        status_idx = None
        for i in range(len(tokens) - 1, -1, -1):
            if tokens[i] in VALID_STATUSES:
                status_idx = i
                break
        if status_idx is None or status_idx < 5:
            return None
        # description = between category (idx 4) and status
        incident_id, date, clinic_id, country, category = tokens[:5]
        description = " ".join(tokens[5:status_idx])
        rest = tokens[status_idx + 1:]
        status = tokens[status_idx]
        patient_id = rest[0] if rest else ""
        score = rest[1] if len(rest) > 1 else ""
        return [incident_id, date, clinic_id, country, category, description, status, patient_id, score]

    # status is the token immediately before patient_id.
    status_idx = patient_idx - 1
    if status_idx < 5:
        return None
    incident_id, date, clinic_id, country, category = tokens[:5]
    description = " ".join(tokens[5:status_idx])
    status = tokens[status_idx]
    patient_id = tokens[patient_idx]
    score = tokens[patient_idx + 1] if patient_idx + 1 < len(tokens) else ""
    return [incident_id, date, clinic_id, country, category, description, status, patient_id, score]


def _try_whitespace_reconstruct(lines: list[str], header_len: int) -> list[list[str]] | None:
    """
    Attempt to parse whitespace-separated lines by reconstruction.

    Only used when the detected delimiter produces a single column. Returns
    the reconstructed rows (header + data) if reconstruction succeeds for
    the data lines, otherwise ``None``.
    """
    if not lines or header_len != 9:
        return None

    header = lines[0].split()
    # If the header itself doesn't have 9 tokens it is not our schema.
    if len(header) != 9:
        return None

    reconstructed = [header]
    for raw in lines[1:]:
        if not raw.strip():
            continue
        row = _reconstruct_whitespace_row(raw)
        if row is None:
            # Keep a best-effort positional split so validation still runs
            # and reports the record as invalid rather than dropping it.
            row = raw.split()
        reconstructed.append(row)
    return reconstructed


def _parse_rows(text: str) -> list[list[str]]:
    """
    Parse CSV text into a list of rows, tolerating comma, tab and
    whitespace separators.

    Strategy:
      1. Detect a delimiter and parse with ``csv.reader``.
      2. If the result looks single-column but the raw line contains
         whitespace, re-parse using whitespace splitting.
      3. If parsing raises for one delimiter, try the next candidate.

    Raises ``ValueError`` if no delimiter strategy yields multiple columns.
    """
    text = text.lstrip("\ufeff")  # strip UTF-8 BOM if present
    lines = [ln for ln in text.splitlines() if ln.strip()]
    if not lines:
        return []

    sample = "\n".join(lines[:20])
    delimiter = _detect_delimiter(sample)

    rows: list[list[str]] = []
    try:
        rows = list(csv.reader(lines, delimiter=delimiter))
    except csv.Error:
        rows = []

    # Fallback A: detected a "comma style" delimiter but produced one column
    # while the line clearly contains whitespace → whitespace-separated file.
    header_cols = len(rows[0]) if rows else 0
    if header_cols <= 1:
        # First try a schema-aware reconstruction (handles descriptions
        # that contain spaces), then a plain positional split.
        reconstructed = _try_whitespace_reconstruct(lines, len(lines[0].split()))
        if reconstructed is not None:
            rows = reconstructed
        else:
            space_rows = [_split_whitespace_row(ln) for ln in lines]
            space_cols = len(space_rows[0]) if space_rows else 0
            if space_cols > header_cols:
                rows = space_rows

    # Fallback B: last resort — try every candidate delimiter explicitly.
    if not rows or (rows and len(rows[0]) <= 1):
        for candidate in CANDIDATE_DELIMITERS:
            if candidate == delimiter:
                continue
            try:
                attempt = list(csv.reader(lines, delimiter=candidate))
            except csv.Error:
                continue
            if attempt and len(attempt[0]) > 1:
                rows = attempt
                break

    if not rows:
        raise ValueError("Could not parse the file: no readable rows found.")

    if len(rows[0]) <= 1:
        raise ValueError(
            "Could not detect a valid separator. Expected comma, tab or "
            "whitespace-separated columns."
        )

    return rows


def _normalize_row(row: list[str], header_map: dict[str, int], header_len: int = 0) -> list[str]:
    """
    Reorder an input row into the canonical column layout used by
    ``validate_record`` and ``compute_metrics`` (index 1..9, index 0 unused).

    If the header is recognized, fields are mapped by name; otherwise the
    row is used as-is (padded to the expected length).

    Handles a common real-world defect where data rows carry an extra
    leading (empty) column while the header does not: if the row has one
    more column than the header and the first cell is blank, it is dropped.
    """
    # Align rows that carry an extra phantom leading column.
    if header_len and len(row) == header_len + 1 and (not row or not row[0].strip()):
        row = row[1:]

    # Canonical output has 10 slots (index 0 reserved/unused).
    normalized = [""] * 10
    for name, canonical_idx in CANONICAL_HEADER.items():
        source_idx = header_map.get(name)
        if source_idx is not None and source_idx < len(row):
            normalized[canonical_idx + 1] = row[source_idx].strip()

    # If nothing mapped (unrecognized header), fall back to positional copy.
    if not any(normalized[1:]):
        for i, value in enumerate(row[:9]):
            normalized[i + 1] = value.strip() if isinstance(value, str) else value

    return normalized


def _build_header_map(header_row: list[str]) -> dict[str, int]:
    """Map canonical field names to their index in the parsed header row."""
    header_map: dict[str, int] = {}
    for idx, cell in enumerate(header_row):
        name = (cell or "").strip().lower()
        if name in CANONICAL_HEADER:
            header_map[name] = idx
    return header_map


# ── Validation ─────────────────────────────────────────────────────────────

def validate_record(row: list[str]) -> list[str]:
    """
    Validate a single CSV record against all defined rules.
    Returns a list of violation descriptions (empty = valid).
    Never exposes patient_id values in violation messages.
    """
    violations: list[str] = []

    clinic_id = row[COL_CLINIC_ID].strip() if COL_CLINIC_ID < len(row) else ""
    country = row[COL_COUNTRY].strip() if COL_COUNTRY < len(row) else ""
    category = row[COL_CATEGORY].strip() if COL_CATEGORY < len(row) else ""
    description = row[COL_DESCRIPTION].strip() if COL_DESCRIPTION < len(row) else ""
    status = row[COL_STATUS].strip() if COL_STATUS < len(row) else ""
    patient_id = row[COL_PATIENT_ID].strip() if COL_PATIENT_ID < len(row) else ""
    satisfaction_raw = (
        row[COL_SATISFACTION_SCORE].strip()
        if COL_SATISFACTION_SCORE < len(row)
        else ""
    )

    # Clinic ID
    if not clinic_id or clinic_id not in VALID_CLINICS:
        violations.append("Invalid or missing clinic_id")

    # Country/clinic mismatch
    if clinic_id in VALID_CLINICS and country:
        if country != VALID_CLINICS[clinic_id]:
            violations.append("Country/clinic mismatch")

    # Category
    if not category or category not in VALID_CATEGORIES:
        violations.append("Invalid or missing category")

    # Description
    if not description or len(description) < 5:
        violations.append("Empty description")

    # Patient ID — report the rule, never the value
    if not patient_id or not PATIENT_ID_RE.match(patient_id):
        violations.append("Missing patient_id")

    # Satisfaction
    if status == "CLOSED":
        if not satisfaction_raw:
            violations.append("Closed case, no score")
        else:
            try:
                score = int(satisfaction_raw)
                if score < 1 or score > 5:
                    violations.append("satisfaction_score out of range")
            except ValueError:
                violations.append("satisfaction_score out of range")

    return violations


# ── Analysis ───────────────────────────────────────────────────────────────

def load_and_validate(filepath: str) -> tuple[list[list[str]], list[tuple[list[str], list[str]]], dict[str, int]]:
    """
    Load CSV, validate all records, and return:
      - valid_records
      - invalid_records (each with violations)
      - rule_counts

    The parser tolerates comma-, tab- and whitespace-separated files
    (see ``_parse_rows``) and maps columns by header name, so column
    order or extra leading columns do not break validation.
    """
    with open(filepath, "r", encoding="utf-8-sig") as f:
        text = f.read()

    try:
        rows = _parse_rows(text)
    except ValueError as exc:
        # Surface a descriptive error instead of silently reporting 0 records.
        raise ValueError(f"Invalid CSV format in '{os.path.basename(filepath)}': {exc}") from exc

    # Header row is rows[0]; skip it to get data.
    header_row = rows[0] if rows else []
    header_map = _build_header_map(header_row)
    header_len = len(header_row)
    data_rows = rows[1:] if len(rows) > 1 else []
    data_rows = [r for r in data_rows if any(cell.strip() for cell in r)]

    valid_records: list[list[str]] = []
    invalid_records: list[tuple[list[str], list[str]]] = []

    rule_counts: dict[str, int] = {
        "Invalid or missing clinic_id": 0,
        "Country/clinic mismatch": 0,
        "Invalid or missing category": 0,
        "Empty description": 0,
        "Missing patient_id": 0,
        "Closed case, no score": 0,
        "satisfaction_score out of range": 0,
    }

    for row in data_rows:
        # Normalize to the canonical column layout (index 0 unused).
        normalized = _normalize_row(row, header_map, header_len)

        # Ensure row has enough columns
        while len(normalized) <= COL_SATISFACTION_SCORE:
            normalized.append("")

        violations = validate_record(normalized)
        if violations:
            invalid_records.append((normalized, violations))
            for v in violations:
                if v in rule_counts:
                    rule_counts[v] += 1
        else:
            valid_records.append(normalized)

    return valid_records, invalid_records, rule_counts


def compute_metrics(
    valid_records: list[list[str]],
    invalid_records: list[tuple[list[str], list[str]]],
    rule_counts: dict[str, int],
    total: int,
    filepath: str = "",
) -> dict[str, Any]:
    """Compute all summary metrics from validated records."""

    # Category breakdown
    category_counts: dict[str, int] = {c: 0 for c in VALID_CATEGORIES}
    for row in valid_records:
        cat = row[COL_CATEGORY].strip()
        if cat in category_counts:
            category_counts[cat] += 1

    # Status breakdown
    status_counts: dict[str, int] = {s: 0 for s in VALID_STATUSES}
    for row in valid_records:
        st = row[COL_STATUS].strip()
        if st in status_counts:
            status_counts[st] += 1

    # Country breakdown
    country_counts: dict[str, int] = {}
    for row in valid_records:
        cntry = row[COL_COUNTRY].strip()
        country_counts[cntry] = country_counts.get(cntry, 0) + 1

    # Satisfaction analysis
    satisfaction_scores: list[int] = []
    satisfaction_distribution: dict[int, int] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for row in valid_records:
        if row[COL_STATUS].strip() == "CLOSED":
            score_raw = (
                row[COL_SATISFACTION_SCORE].strip()
                if COL_SATISFACTION_SCORE < len(row)
                else ""
            )
            if score_raw:
                try:
                    score = int(score_raw)
                    if 1 <= score <= 5:
                        satisfaction_scores.append(score)
                        satisfaction_distribution[score] = (
                            satisfaction_distribution.get(score, 0) + 1
                        )
                except ValueError:
                    pass

    avg_satisfaction = 0.0
    if satisfaction_scores:
        avg_satisfaction = round(sum(satisfaction_scores) / len(satisfaction_scores), 2)

    return {
        "filepath": os.path.basename(filepath) if filepath else "",
        "total": total,
        "valid_count": len(valid_records),
        "invalid_count": len(invalid_records),
        "rule_counts": rule_counts,
        "category_counts": category_counts,
        "status_counts": status_counts,
        "country_counts": country_counts,
        "satisfaction_scores": satisfaction_scores,
        "satisfaction_distribution": satisfaction_distribution,
        "avg_satisfaction": avg_satisfaction,
    }


def analyze(filepath: str) -> dict[str, Any]:
    """Full pipeline: load → validate → compute metrics."""
    valid_records, invalid_records, rule_counts = load_and_validate(filepath)
    total = len(valid_records) + len(invalid_records)
    return compute_metrics(valid_records, invalid_records, rule_counts, total, filepath)