"use client";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* ── Welcome banner ── */}
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-[#d6f6ff] via-white to-[#75d4ff] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0069ff]">
          HealthCore Digital &mdash; Internal backoffice
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#0016a2]">
          Welcome back, HealthCore team
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          This is your central dashboard for monitoring clinic operations, patient access,
          revenue cycle, compliance, and workforce data across all 12 locations.
        </p>
      </section>

      {/* ── Department KPIs ── */}
      <section>
        <h2 className="text-lg font-semibold text-[#0016a2]">Department overview</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Operations */}
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-700">🏥 Clinical Operations</h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-[#0069ff]">
                Dr. Marcus Reid
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-[#0016a2]">120</p>
            <p className="text-xs text-gray-500">Clinical staff across 12 sites</p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-amber-700">35 min/day</span>
              <span className="text-gray-400">avg. documentation time</span>
            </div>
          </article>

          {/* Patient Access */}
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-700">🗓️ Patient Access</h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-[#0069ff]">
                Priya Nair
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-red-600">22%</p>
            <p className="text-xs text-gray-500">No-show rate (~$1.8M/yr lost)</p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-amber-700">No online booking</span>
              <span className="text-gray-400">Phone-only in US</span>
            </div>
          </article>

          {/* Revenue Cycle */}
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-700">💰 Revenue Cycle</h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-[#0069ff]">
                Tom Callahan
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-red-600">14%</p>
            <p className="text-xs text-gray-500">Claim denial rate (vs. 5&ndash;8% industry)</p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-amber-700">Manual submission</span>
              <span className="text-gray-400">UK billing in spreadsheet</span>
            </div>
          </article>

          {/* Compliance */}
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-700">🔒 Compliance</h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-[#0069ff]">
                Claire Whitfield
              </span>
            </div>
            <p className="mt-3 text-lg font-semibold text-[#0016a2]">HIPAA + UK GDPR</p>
            <p className="text-xs text-gray-500">Dual regulatory framework</p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-amber-700">Manual audit trails</span>
              <span className="text-gray-400">No centralised monitoring</span>
            </div>
          </article>

          {/* People */}
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-700">👥 People &amp; Talent</h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-[#0069ff]">
                Diane Foster
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-[#0016a2]">47</p>
            <p className="text-xs text-gray-500">Avg. days to hire clinical staff</p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-amber-700">Manual onboarding</span>
              <span className="text-gray-400">CME tracked in spreadsheet</span>
            </div>
          </article>

          {/* Technology */}
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-700">💻 Technology</h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-[#0069ff]">
                James Osei
              </span>
            </div>
            <p className="mt-3 text-lg font-semibold text-[#0016a2]">2 EHR systems</p>
            <p className="text-xs text-gray-500">No shared data layer</p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-amber-700">No telemetry</span>
              <span className="text-gray-400">No centralised logging</span>
            </div>
          </article>
        </div>
      </section>

      {/* ── Network stats ── */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="text-sm font-semibold text-gray-700">Network at a glance</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-[#0016a2]">12</p>
            <p className="text-xs text-gray-500">Clinics</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-[#0016a2]">200</p>
            <p className="text-xs text-gray-500">Employees</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-[#0016a2]">$28M</p>
            <p className="text-xs text-gray-500">Annual revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-[#0016a2]">2</p>
            <p className="text-xs text-gray-500">Countries</p>
          </div>
        </div>
      </section>

      {/* ── Quick links ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700">Quick access</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            href="../../website/index.html"
            className="rounded-full bg-[#0031c4] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0016a2]"
          >
            Public website
          </a>
          <a
            href="../../website/application.html"
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-[#0031c4] hover:text-[#0031c4]"
          >
            Patient enquiry form
          </a>
          <a
            href="../../website/index.html#locations"
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-[#0031c4] hover:text-[#0031c4]"
          >
            Clinic locations
          </a>
        </div>
      </section>
    </div>
  );
}