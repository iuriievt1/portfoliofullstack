"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = (href: string) => (pathname === href ? "btn-primary" : "btn-outline-light");

  return (
    <div className="container py-3 py-md-4">
      <nav className="navbar navbar-expand-lg s-card px-3 py-2 mb-3">
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2">
          <span className="s-icon">✓</span>
          <span className="fw-semibold">SWES UI</span>
          <span className="s-pill ms-2">{title}</span>
        </Link>

        <button
          className="navbar-toggler btn btn-outline-light btn-sm"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          Menu
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="nav">
          <div className="d-flex gap-2 mt-2 mt-lg-0 flex-wrap">
            <Link className={`btn btn-sm ${active("/")}`} href="/">Overview</Link>
            <Link className={`btn btn-sm ${active("/reservations")}`} href="/reservations">Create</Link>
            <Link className={`btn btn-sm ${active("/history")}`} href="/history">History</Link>
            <Link className={`btn btn-sm ${active("/calendar")}`} href="/calendar">Calendar</Link>
          </div>
        </div>
      </nav>

      {children}

      <footer className="text-center text-muted-2 small mt-4">
        SWES Reservation Module UI • UC-R1 • UC-R5 • UC-R12 • UC-R13
      </footer>
    </div>
  );
}
