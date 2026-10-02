import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: "400",
});

export const metadata: Metadata = {
  title: "HealthCore — Backoffice",
  description: "Internal administration dashboard for HealthCore operations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="HealthCore backoffice home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0016a2] text-sm font-bold text-white">
                HC
              </span>
              <span className="text-sm font-semibold text-[#0016a2]">HealthCore</span>
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                Staff
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm" aria-label="Internal navigation">
              <Link href="/" className="font-medium text-[#0031c4]">
                Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <a
                href="../../website/index.html"
                className="text-gray-500 transition hover:text-[#0069ff]"
              >
                Public site
              </a>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 bg-white mt-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-xs text-gray-400">
              &copy; 2026 HealthCore Digital &mdash; Internal backoffice
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}