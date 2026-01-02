import AppShell from "@/components/AppShell";
import Link from "next/link";

export default function Page() {
  return (
    <AppShell title="Overview">
      <div className="s-card p-3 p-md-4 mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div>
            <h1 className="h3 mb-2">SWES Reservation Module</h1>
            <p className="text-muted-2 mb-0">
              Next.js + TypeScript + Bootstrap. Focus on UI logic, UX states, and REST handling (simulated).
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <span className="s-pill">Responsive</span>
            <span className="s-pill">Shareable URL state</span>
            <span className="s-pill">Loading / Empty / Error</span>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <Link href="/reservations" className="focus-ring d-block">
            <div className="s-card p-3 h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <span className="s-icon">＋</span>
                  <div className="fw-semibold">UC-R1 — Create Reservation</div>
                </div>
                <span className="s-pill">Form</span>
              </div>
              <p className="text-muted-2 mt-2 mb-0">
                Employee ID (digits-only) + Item dropdown + Date picker + validation + submit.
              </p>
            </div>
          </Link>
        </div>

        <div className="col-12 col-lg-4">
          <Link href="/history" className="focus-ring d-block">
            <div className="s-card p-3 h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <span className="s-icon">≡</span>
                  <div className="fw-semibold">UC-R5 — Equipment History</div>
                </div>
                <span className="s-pill">Filters</span>
              </div>
              <p className="text-muted-2 mt-2 mb-0">
                Table + sticky header, sorting, pagination, and mobile cards.
              </p>
            </div>
          </Link>
        </div>

        <div className="col-12 col-lg-4">
          <Link href="/calendar" className="focus-ring d-block">
            <div className="s-card p-3 h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <span className="s-icon">▦</span>
                  <div className="fw-semibold">UC-R12/13 — Calendar + Notify</div>
                </div>
                <span className="s-pill">API</span>
              </div>
              <p className="text-muted-2 mt-2 mb-0">
                Monthly calendar (available/unavailable). Notify simulation via /api/notify.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
