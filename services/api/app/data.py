"""
In-memory data store for HealthCore clinics and departments.
All data sourced from CONTEXT.md — no invented values.
"""

from app.models.schemas import ClinicLocation, Country, ServiceType, Department, DepartmentId


# ── Clinics (12 total: 9 US, 3 UK) ──

CLINICS: list[ClinicLocation] = [
    # ── United States ──
    ClinicLocation(
        id="aus-central",
        name="HealthCore Austin Central",
        address="1100 Trinity St",
        city="Austin",
        state="TX",
        country=Country.US,
        phone="+1-512-340-8800",
        opening_hours="Mo–Fr 7:00–20:00, Sa 9:00–15:00",
        services=["primary_care", "specialist", "chronic_disease", "preventive", "womens_health"],
    ),
    ClinicLocation(
        id="aus-north",
        name="HealthCore Austin North",
        address="8920 N Lamar Blvd",
        city="Austin",
        state="TX",
        country=Country.US,
        phone="+1-512-340-8810",
        opening_hours="Mo–Fr 8:00–19:00",
        services=["primary_care", "chronic_disease", "preventive"],
    ),
    ClinicLocation(
        id="san-antonio",
        name="HealthCore San Antonio",
        address="7946 Floyd Curl Dr",
        city="San Antonio",
        state="TX",
        country=Country.US,
        phone="+1-210-720-4400",
        opening_hours="Mo–Fr 8:00–18:00, Sa 9:00–13:00",
        services=["primary_care", "specialist", "preventive"],
    ),
    ClinicLocation(
        id="miami",
        name="HealthCore Miami",
        address="1475 NW 12th Ave",
        city="Miami",
        state="FL",
        country=Country.US,
        phone="+1-305-510-7700",
        opening_hours="Mo–Fr 7:00–20:00, Sa 9:00–16:00",
        services=["primary_care", "specialist", "chronic_disease", "preventive", "mental_health"],
    ),
    ClinicLocation(
        id="orlando",
        name="HealthCore Orlando",
        address="1380 S Orange Ave",
        city="Orlando",
        state="FL",
        country=Country.US,
        phone="+1-407-892-6600",
        opening_hours="Mo–Fr 8:00–18:00",
        services=["primary_care", "preventive", "womens_health"],
    ),
    ClinicLocation(
        id="atlanta",
        name="HealthCore Atlanta",
        address="550 Peachtree St NE",
        city="Atlanta",
        state="GA",
        country=Country.US,
        phone="+1-404-330-9900",
        opening_hours="Mo–Fr 8:00–19:00",
        services=["primary_care", "specialist", "chronic_disease", "preventive"],
    ),
    # ── United Kingdom ──
    ClinicLocation(
        id="london-bridge",
        name="HealthCore London Bridge",
        address="2 St Thomas St",
        city="London",
        state=None,
        country=Country.GB,
        phone="+44-20-7407-8800",
        opening_hours="Mo–Fr 8:00–19:00, Sa 9:00–13:00",
        services=["primary_care", "specialist", "chronic_disease", "preventive", "mental_health"],
    ),
    ClinicLocation(
        id="london-paddington",
        name="HealthCore London Paddington",
        address="18 Praed St",
        city="London",
        state=None,
        country=Country.GB,
        phone="+44-20-7702-8801",
        opening_hours="Mo–Fr 8:00–18:00",
        services=["primary_care", "preventive", "womens_health"],
    ),
    ClinicLocation(
        id="manchester",
        name="HealthCore Manchester",
        address="100 Oxford Rd",
        city="Manchester",
        state=None,
        country=Country.GB,
        phone="+44-16-1234-8802",
        opening_hours="Mo–Fr 8:00–19:00",
        services=["primary_care", "specialist", "chronic_disease", "preventive"],
    ),
]


# ── Departments (aligned with CONTEXT.md) ──

DEPARTMENTS: dict[DepartmentId, Department] = {
    DepartmentId.CLINICAL_OPS: Department(
        id=DepartmentId.CLINICAL_OPS,
        name="Clinical Operations",
        head={"name": "Dr. Marcus Reid", "title": "Director of Clinical Operations"},
        headcount=120,
        kpis={
            "documentation_time_min": "35 min/day per clinician",
            "sites": "12",
            "ehr_systems": "2 (US + UK, not interconnected)",
        },
        description="Oversees ~120 clinical staff across 12 sites. Each clinic operates independently with its own EHR. Patient records do not follow the patient across sites or countries.",
    ),
    DepartmentId.PATIENT_ACCESS: Department(
        id=DepartmentId.PATIENT_ACCESS,
        name="Patient Experience & Access",
        head={"name": "Priya Nair", "title": "Head of Patient Experience"},
        headcount=None,
        kpis={
            "no_show_rate": "22% (~$1.8M/yr lost)",
            "online_booking": "None — phone only in US",
            "reminder_system": "None",
        },
        description="Manages everything before and after the clinical encounter. No shared online booking system. No proactive contact to prevent no-shows.",
    ),
    DepartmentId.REVENUE_CYCLE: Department(
        id=DepartmentId.REVENUE_CYCLE,
        name="Revenue Cycle & Billing",
        head={"name": "Tom Callahan", "title": "Head of Revenue Cycle"},
        headcount=None,
        kpis={
            "denial_rate": "14% (industry avg: 5–8%)",
            "us_billing": "Platform with manual submission",
            "uk_billing": "Spreadsheet",
        },
        description="Claims submitted manually with inconsistent coding across sites. No unified view of US and UK revenue streams.",
    ),
    DepartmentId.COMPLIANCE: Department(
        id=DepartmentId.COMPLIANCE,
        name="Compliance & Data Governance",
        head={"name": "Claire Whitfield", "title": "Head of Compliance"},
        headcount=None,
        kpis={
            "frameworks": "HIPAA (US) + UK GDPR (UK)",
            "audit_trails": "Separate per EHR, incomplete",
            "patient_data_requests": "Manual across multiple systems",
        },
        description="Dual regulatory framework. Any system handling patient data must be evaluated under both HIPAA and UK GDPR.",
    ),
    DepartmentId.PEOPLE: Department(
        id=DepartmentId.PEOPLE,
        name="People & Workforce",
        head={"name": "Diane Foster", "title": "VP of People"},
        headcount=200,
        kpis={
            "avg_hire_days": "47 days (20 above industry)",
            "onboarding": "Manual",
            "cme_tracking": "Spreadsheet",
        },
        description="Manages 200 people across 12 sites in two countries. Clinical roles take 47 days to fill. CME hours tracked manually.",
    ),
    DepartmentId.TECHNOLOGY: Department(
        id=DepartmentId.TECHNOLOGY,
        name="Technology",
        head={"name": "James Osei", "title": "CTO"},
        headcount=6,
        kpis={
            "team_size": "6 people (Austin)",
            "ehr_systems": "2 (non-communicating)",
            "telemetry": "None",
            "logging": "None centralised",
            "shared_data_layer": "None",
        },
        description="Mosaic of legacy systems built or acquired over a decade. No shared data layer, no telemetry, no central logging.",
    ),
    DepartmentId.EXECUTIVE: Department(
        id=DepartmentId.EXECUTIVE,
        name="Executive",
        head={"name": "Dr. Sandra Okonkwo", "title": "CEO"},
        headcount=None,
        kpis={
            "revenue": "$28M annual",
            "reporting": "Weekly reports, different formats, days old",
            "unified_dashboard": "None",
        },
        description="Runs a $28M healthcare network across two countries without a unified dashboard. Decisions based on stale, conflicting reports.",
    ),
}