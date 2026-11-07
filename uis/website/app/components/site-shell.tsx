import Link from "next/link";
import { LocaleDocument } from "./locale-document";

export type Locale = "en" | "es";

const careersHref = process.env.NEXT_PUBLIC_TALENT_TRACKER_URL || (
  process.env.CODESPACE_NAME
    ? `https://${process.env.CODESPACE_NAME}-3003.app.github.dev/`
    : "http://localhost:3003/"
);

const navigation = {
  en: { home: "Home", services: "Services", locations: "Locations", contact: "Contact", careers: "Careers", utilities: "Utilities demo", request: "Request an appointment", tagline: "Outpatient care network", footer: "All rights reserved." },
  es: { home: "Inicio", services: "Servicios", locations: "Ubicaciones", contact: "Contacto", careers: "Carreras", utilities: "Demo de utilidades", request: "Solicitar una cita", tagline: "Red de atención ambulatoria", footer: "Todos los derechos reservados." },
};

export function SiteHeader({ locale, page = "home" }: { locale: Locale; page?: "home" | "application" | "utilities" }) {
  const t = navigation[locale];
  const homePath = locale === "es" ? "/es" : "/";
  const applicationPath = locale === "es" ? "/es/application" : "/application";
  const alternatePath = page === "home" ? (locale === "es" ? "/" : "/es") : page === "application" ? (locale === "es" ? "/application" : "/es/application") : (locale === "es" ? "/utilities" : "/es/utilities");
  const ids = locale === "es" ? { home: "inicio", services: "servicios", locations: "ubicaciones", contact: "contacto" } : { home: "home", services: "services", locations: "locations", contact: "contact" };
  return (
    <header className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
      <nav className="flex flex-wrap items-center justify-between gap-4" aria-label={locale === "es" ? "Navegación principal" : "Primary navigation"}>
        <Link href={homePath} className="flex items-center gap-3" aria-label={locale === "es" ? "Página principal de HealthCore" : "HealthCore home page"}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-800 text-lg font-bold text-white">HC</span>
          <span><span className="block text-lg font-semibold tracking-tight text-brand-800">HealthCore</span><span className="block text-sm text-slate-600">{t.tagline}</span></span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-700">
          <Link className="transition hover:text-brand-700" href={`${homePath}#${ids.home}`}>{t.home}</Link>
          <Link className="transition hover:text-brand-700" href={`${homePath}#${ids.services}`}>{t.services}</Link>
          <Link className="transition hover:text-brand-700" href={`${homePath}#${ids.locations}`}>{t.locations}</Link>
          <Link className="transition hover:text-brand-700" href={`${homePath}#${ids.contact}`}>{t.contact}</Link>
          <Link className="transition hover:text-brand-700" href={careersHref}>{t.careers}</Link>
          <Link className="transition hover:text-brand-700" href={locale === "es" ? "/es/utilities" : "/utilities"}>{t.utilities}</Link>
          {page !== "application" && <Link href={applicationPath} className="rounded-full bg-brand-700 px-4 py-2 font-semibold text-white shadow-panel transition hover:bg-brand-800">{t.request}</Link>}
        </div>
        <div className="flex items-center gap-2" aria-label={locale === "es" ? "Idioma" : "Language"}>
          <Link href={locale === "en" ? (page === "home" ? "/" : page === "application" ? "/application" : "/utilities") : alternatePath} aria-current={locale === "en" ? "page" : undefined} className={`rounded-full px-3 py-2 text-sm font-semibold ${locale === "en" ? "bg-brand-800 text-white" : "border border-brand-200 text-brand-800 hover:border-brand-700"}`}>EN</Link>
          <Link href={locale === "es" ? (page === "home" ? "/es" : page === "application" ? "/es/application" : "/es/utilities") : alternatePath} aria-current={locale === "es" ? "page" : undefined} className={`rounded-full px-3 py-2 text-sm font-semibold ${locale === "es" ? "bg-brand-800 text-white" : "border border-brand-200 text-brand-800 hover:border-brand-700"}`}>ES</Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = navigation[locale];
  return <footer className="border-t border-slate-200 bg-slate-100"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-8 text-sm text-slate-500 lg:px-8"><p>© {new Date().getFullYear()} HealthCore. {t.footer}</p><div className="flex gap-4"><a href="https://linkedin.com/company/healthcore" className="hover:text-brand-600">LinkedIn</a><a href="https://facebook.com/healthcore" className="hover:text-brand-600">Facebook</a><a href="https://instagram.com/healthcore" className="hover:text-brand-600">Instagram</a></div></div></footer>;
}

export function PageFrame({ children, locale, page }: { children: React.ReactNode; locale: Locale; page?: "home" | "application" | "utilities" }) {
  return <div className="relative isolate min-h-screen overflow-hidden"><LocaleDocument locale={locale} /><div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-gradient-to-br from-brand-100 via-white to-brand-300" aria-hidden="true" /><SiteHeader locale={locale} page={page} />{children}<SiteFooter locale={locale} /></div>;
}
