"use client";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-[#d6f6ff] via-white to-[#75d4ff] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0069ff]">
          HealthCore Digital &mdash; Supplier Management
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#0016a2]">
          Welcome to HealthCore
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage HealthCore&apos;s procurement suppliers across the US and UK.
          Register new suppliers, update rates, and control supplier status.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <article className="rounded-xl border border-gray-100 bg-gradient-to-br from-[#eefcff] to-white p-5">
            <h2 className="text-base font-semibold text-[#0016a2]">Supplier Directory</h2>
            <p className="mt-2 text-sm text-gray-600">
              View, register, and manage all HealthCore suppliers. Filter by country and
              category, update rates, and control supplier status.
            </p>
            <a
              href="/suppliers"
              className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#0069ff] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0031c4]"
            >
              Go to Suppliers &rarr;
            </a>
          </article>

          <article className="rounded-xl border border-gray-100 bg-gradient-to-br from-[#d6f6ff] to-white p-5">
            <h2 className="text-base font-semibold text-[#0016a2]">API Docs</h2>
            <p className="mt-2 text-sm text-gray-600">
              Explore the supplier management API endpoints via Swagger UI documentation.
            </p>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#75d4ff] px-4 py-2 text-sm font-medium text-[#0031c4] transition hover:bg-[#0069ff] hover:text-white"
            >
              Open API Docs &rarr;
            </a>
          </article>
        </div>
      </section>
    </div>
  );
}