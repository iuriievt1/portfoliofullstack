"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filters, HistoryRow, Status } from "@/lib/types";
import { defaultFilters, parseFilters, toSearchParams } from "@/lib/urlState";

function statusBadge(s: Status) {
  if (s === "Returned") return "bg-success";
  if (s === "Pending") return "bg-primary";
  return "bg-danger";
}

function applyFilters(rows: HistoryRow[], f: Filters) {
  let r = [...rows];

  if (f.q.trim()) {
    const q = f.q.trim().toLowerCase();
    r = r.filter((x) => x.employeeName.toLowerCase().includes(q) || x.itemId.toLowerCase().includes(q));
  }

  if (f.itemType !== "All") r = r.filter((x) => x.itemType === f.itemType);
  if (f.start) r = r.filter((x) => x.date >= f.start);
  if (f.end) r = r.filter((x) => x.date <= f.end);

  const anyStatus = f.status.Returned || f.status.Pending || f.status.Overdue;
  if (anyStatus) r = r.filter((x) => f.status[x.status]);

  r.sort((a, b) => {
    const key = f.sortKey;
    const av = a[key];
    const bv = b[key];
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return f.sortDir === "asc" ? cmp : -cmp;
  });

  return r;
}

export default function HistoryView() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // FIX TS: не передаём ReadonlyURLSearchParams как any — конвертим в URLSearchParams
  const [filters, setFilters] = useState<Filters>(() => parseFilters(new URLSearchParams(sp.toString())));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<HistoryRow[]>([]);

  // UC-R13 modal state
  const [selected, setSelected] = useState<HistoryRow | null>(null);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  useEffect(() => {
    setFilters(parseFilters(new URLSearchParams(sp.toString())));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  async function fetchRows() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/equipment-history");
      if (!res.ok) throw new Error("Failed to load equipment history");
      const data = await res.json();
      setRows(data.rows as HistoryRow[]);
    } catch (e: any) {
      setError(e?.message ?? "Load error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commit(next: Filters) {
    const params = toSearchParams(next);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(filters.page, pages);

  const paged = useMemo(() => {
    const start = (page - 1) * filters.pageSize;
    return filtered.slice(start, start + filters.pageSize);
  }, [filtered, page, filters.pageSize]);

  function setSort(key: Filters["sortKey"]) {
    const dir = filters.sortKey === key ? (filters.sortDir === "asc" ? "desc" : "asc") : "asc";
    const next = { ...filters, sortKey: key, sortDir: dir as "asc" | "desc", page: 1 };
    setFilters(next);
    commit(next);
  }

  function clearAll() {
    setFilters(defaultFilters);
    commit(defaultFilters);
  }

  async function sendNotify(row: HistoryRow) {
    setNotifyMsg(null);
    setNotifyLoading(true);
    try {
      // UC-R13: POST /api/notify (simulated email sending)
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          itemId: row.itemId,
          itemName: row.itemName,
          date: row.date,
          returnDate: row.returnDate,
          status: row.status,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? "Notify failed");

      setNotifyMsg({ type: "success", text: data?.message ?? "Email notification sent (simulated)." });
    } catch (e: any) {
      setNotifyMsg({ type: "danger", text: e?.message ?? "Notify error" });
    } finally {
      setNotifyLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="s-card p-4 d-flex align-items-center gap-3">
        <div className="spinner-border" role="status" aria-label="Loading" />
        <div>
          <div className="fw-semibold">Loading equipment history…</div>
          <div className="text-muted-2">Simulated REST fetch</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="s-card p-4">
        <div className="alert alert-danger mb-3" role="alert">{error}</div>
        <button className="btn btn-outline-light" onClick={fetchRows}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <div className="s-card p-3 p-md-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div>
            <h2 className="h5 mb-1">Equipment History (UC-R5)</h2>
            <div className="text-muted-2">
              Shareable URL state • filters • sorting • pagination • responsive • click row for UC-R13 notify
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <span className="s-pill">Results: {total}</span>
            <button className="btn btn-outline-light btn-sm" onClick={clearAll}>Clear all</button>
          </div>
        </div>

        {/* Filters */}
        <div className="row g-2 mb-3">
          <div className="col-12 col-lg-4">
            <label className="form-label">Search (employee or item ID)</label>
            <input
              className="form-control"
              placeholder="e.g. Novak or ITM-1001"
              value={filters.q}
              onChange={(e) => {
                const next = { ...filters, q: e.target.value, page: 1 };
                setFilters(next); commit(next);
              }}
            />
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label">Item type</label>
            <select
              className="form-select"
              value={filters.itemType}
              onChange={(e) => {
                const next = { ...filters, itemType: e.target.value as any, page: 1 };
                setFilters(next); commit(next);
              }}
            >
              <option value="All">All</option>
              <option value="Boots">Boots</option>
              <option value="Vest">Vest</option>
              <option value="Helmet">Helmet</option>
              <option value="Gloves">Gloves</option>
              <option value="Jacket">Jacket</option>
            </select>
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label">Start</label>
            <input
              type="date"
              className="form-control"
              value={filters.start}
              onChange={(e) => {
                const next = { ...filters, start: e.target.value, page: 1 };
                setFilters(next); commit(next);
              }}
            />
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label">End</label>
            <input
              type="date"
              className="form-control"
              value={filters.end}
              onChange={(e) => {
                const next = { ...filters, end: e.target.value, page: 1 };
                setFilters(next); commit(next);
              }}
            />
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label">Rows</label>
            <select
              className="form-select"
              value={filters.pageSize}
              onChange={(e) => {
                const next = { ...filters, pageSize: Number(e.target.value) as any, page: 1 };
                setFilters(next); commit(next);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="col-12 d-flex flex-wrap gap-3 align-items-center mt-1">
            <div className="text-muted-2 small">Status:</div>
            {(["Returned", "Pending", "Overdue"] as Status[]).map((s) => (
              <label key={s} className="form-check form-check-inline m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={filters.status[s]}
                  onChange={(e) => {
                    const next = {
                      ...filters,
                      status: { ...filters.status, [s]: e.target.checked } as any,
                      page: 1,
                    };
                    setFilters(next); commit(next);
                  }}
                />
                <span className="form-check-label">{s}</span>
              </label>
            ))}
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="alert alert-info" role="alert">
            No results found. Try clearing filters.
          </div>
        ) : null}

        {/* Desktop table */}
        <div className="d-none d-md-block">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 s-table">
              <thead className="s-thead">
                <tr>
                  <th role="button" onClick={() => setSort("date")}>
                    Date {filters.sortKey === "date" ? (filters.sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th role="button" onClick={() => setSort("itemName")}>
                    Item Name {filters.sortKey === "itemName" ? (filters.sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th>Item ID</th>
                  <th>Employee</th>
                  <th role="button" onClick={() => setSort("status")}>
                    Status {filters.sortKey === "status" ? (filters.sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th role="button" onClick={() => setSort("returnDate")}>
                    Return Date {filters.sortKey === "returnDate" ? (filters.sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r) => (
                  <tr
                    key={r.id}
                    role="button"
                    className="s-row"
                    onClick={() => { setSelected(r); setNotifyMsg(null); }}
                    title="Open details (UC-R13 email notify)"
                  >
                    <td>{r.date}</td>
                    <td className="fw-semibold">{r.itemName}</td>
                    <td className="text-muted-2">{r.itemId}</td>
                    <td>
                      <div className="fw-semibold">{r.employeeName}</div>
                      <div className="text-muted-2 small">Employee ID: {r.employeeId}</div>
                    </td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td>{r.returnDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-muted-2 small mt-2">Tip: click a row to open details and send UC-R13 notification.</div>
        </div>

        {/* Mobile cards */}
        <div className="d-md-none">
          <div className="row g-2">
            {paged.map((r) => (
              <div key={r.id} className="col-12">
                <div className="s-card p-3" role="button" onClick={() => { setSelected(r); setNotifyMsg(null); }}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="fw-semibold">{r.itemName}</div>
                      <div className="text-muted-2 small">{r.itemId} • {r.itemType}</div>
                    </div>
                    <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span>
                  </div>
                  <div className="text-muted-2 mt-2 small">
                    <div>Date: <span className="text-white">{r.date}</span></div>
                    <div>Return: <span className="text-white">{r.returnDate}</span></div>
                    <div>Employee: <span className="text-white">{r.employeeName}</span> ({r.employeeId})</div>
                  </div>
                  <div className="text-muted-2 small mt-2">Tap for details & UC-R13 notify</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <div className="text-muted-2 small">Page {page} / {pages}</div>
          <div className="btn-group" role="group" aria-label="Pagination">
            <button
              className="btn btn-outline-light btn-sm"
              disabled={page === 1}
              onClick={() => { const next = { ...filters, page: 1 }; setFilters(next); commit(next); }}
            >«</button>
            <button
              className="btn btn-outline-light btn-sm"
              disabled={page === 1}
              onClick={() => { const next = { ...filters, page: page - 1 }; setFilters(next); commit(next); }}
            >‹</button>
            <button className="btn btn-primary btn-sm" disabled>{page}</button>
            <button
              className="btn btn-outline-light btn-sm"
              disabled={page === pages}
              onClick={() => { const next = { ...filters, page: page + 1 }; setFilters(next); commit(next); }}
            >›</button>
            <button
              className="btn btn-outline-light btn-sm"
              disabled={page === pages}
              onClick={() => { const next = { ...filters, page: pages }; setFilters(next); commit(next); }}
            >»</button>
          </div>
        </div>
      </div>

      {/* UC-R13 Modal */}
      {selected ? (
        <>
          <div className="modal fade show" style={{ display: "block" }} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content s-modal">
                <div className="modal-header s-modal-header">
                    <div className="me-2">
                        <div className="fw-semibold">Reservation / Equipment record</div>
                        <div className="text-muted-2 small">
                            UC-R13: send email notification via <code>/api/notify</code>
                        </div>
                    </div>
                    <button
                    type="button"
                    className="btn-close s-btn-close"
                    aria-label="Close"
                    onClick={() => setSelected(null)}/>
                    </div>
                <div className="modal-body">
                  {notifyMsg ? (
                    <div className={`alert alert-${notifyMsg.type}`} role="alert">{notifyMsg.text}</div>
                  ) : null}

                  <div className="s-kv">
                    <div className="text-muted-2 small">Employee</div>
                    <div className="fw-semibold">{selected.employeeName} <span className="text-muted-2 fw-normal">({selected.employeeId})</span></div>

                    <div className="text-muted-2 small mt-2">Item</div>
                    <div className="fw-semibold">{selected.itemName} <span className="text-muted-2 fw-normal">({selected.itemId})</span></div>

                    <div className="text-muted-2 small mt-2">Dates</div>
                    <div className="text-white">{selected.date} → {selected.returnDate}</div>

                    <div className="text-muted-2 small mt-2">Status</div>
                    <span className={`badge ${statusBadge(selected.status)}`}>{selected.status}</span>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-outline-light"
                    onClick={() => setSelected(null)}
                    disabled={notifyLoading}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => sendNotify(selected)}
                    disabled={notifyLoading}
                  >
                    {notifyLoading ? "Sending…" : "Send email notification"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            onClick={() => setSelected(null)}
            role="presentation"
          />
        </>
      ) : null}
    </>
  );
}

