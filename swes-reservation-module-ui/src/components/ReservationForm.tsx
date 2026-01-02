"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, isAvailable, yyyyMmDd } from "@/lib/date";

const ITEMS = [
  { id: "ITM-1001", name: "Safety Boots Pro", type: "Boots" },
  { id: "ITM-1002", name: "Kevlar Vest V2", type: "Vest" },
  { id: "ITM-1003", name: "Helmet Shield X", type: "Helmet" },
  { id: "ITM-1004", name: "Thermal Gloves", type: "Gloves" },
  { id: "ITM-1005", name: "Winter Jacket", type: "Jacket" },
] as const;

export default function ReservationForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const prefillDate = sp.get("date") ?? "";
  const defaultDate = useMemo(() => {
    const d = yyyyMmDd(new Date());
    const next = addDays(d, 1);
    return isAvailable(prefillDate) ? prefillDate : next;
  }, [prefillDate]);

  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [itemId, setItemId] = useState<string>(ITEMS[0].id);
  const [date, setDate] = useState(defaultDate);

  const [submitting, setSubmitting] = useState(false);
  const [apiMsg, setApiMsg] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  // строгая валидация: только цифры (и UX: режем любые нецифры)
  const idDigitsOnly = employeeId.trim().length > 0 && /^\d+$/.test(employeeId.trim());
  const showIdError = employeeId.trim().length > 0 && !/^\d+$/.test(employeeId.trim());

  const dateOk = isAvailable(date);

  const canSubmit =
    employeeId.trim().length > 0 &&
    idDigitsOnly &&
    employeeName.trim().length > 0 &&
    !!itemId &&
    !!date &&
    dateOk;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setApiMsg(null);

    if (!canSubmit) {
      setApiMsg({ type: "danger", text: "Please fix validation errors and try again." });
      return;
    }

    setSubmitting(true);
    try {
      // UC-R1: POST /api/reservations (simulated)
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, employeeName, itemId, date }),
      });

      if (!res.ok) throw new Error("Reservation API error");
      const data = await res.json();

      setApiMsg({ type: "success", text: `Created (simulated) — id: ${data.id}` });

      // UX: после успеха — на History (UC-R5), как демо
      setTimeout(() => router.push("/history"), 600);
    } catch (err: any) {
      setApiMsg({ type: "danger", text: err?.message ?? "Request failed" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="row g-3">
      <div className="col-12 col-lg-8">
        <div className="s-card p-3 p-md-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
            <div>
              <h2 className="h5 mb-1">Create Reservation (UC-R1)</h2>
              <div className="text-muted-2">
                Client-side validation + REST POST <code>/api/reservations</code> (simulated).
              </div>
            </div>
            <span className="s-pill">Digits-only ID • Date logic</span>
          </div>

          {apiMsg ? (
            <div className={`alert alert-${apiMsg.type}`} role="alert">
              {apiMsg.text}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Employee ID</label>
              <input
                className={`form-control ${showIdError ? "is-invalid" : ""}`}
                placeholder="e.g. 120034"
                value={employeeId}
                onChange={(e) => {
                  // режем всё кроме цифр — чтобы не “мог писать буквами”
                  const digits = e.target.value.replace(/\D/g, "");
                  setEmployeeId(digits);
                }}
                inputMode="numeric"
                autoComplete="off"
              />
              <div className="form-text text-muted-2">Digits only.</div>
              {showIdError ? <div className="invalid-feedback">Only digits are allowed.</div> : null}
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Employee Name</label>
              <input
                className="form-control"
                placeholder="e.g. Jan Novak"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Item</label>
              <select className="form-select" value={itemId} onChange={(e) => setItemId(e.target.value)}>
                {ITEMS.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Desired Term (date picker)</label>
              <input
                type="date"
                className={`form-control ${date && !dateOk ? "is-invalid" : ""}`}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <div className="form-text text-muted-2">
                Unavailable: weekends and past dates (same logic as calendar UC-R12).
              </div>
              {date && !dateOk ? <div className="invalid-feedback">Date is unavailable.</div> : null}
            </div>

            <div className="col-12 d-flex flex-wrap gap-2">
              <button className="btn btn-primary" disabled={!canSubmit || submitting} type="submit">
                {submitting ? "Submitting..." : "Create reservation"}
              </button>
              <a className="btn btn-outline-light" href="/calendar">Open calendar</a>
              <a className="btn btn-outline-light" href="/history">Go to history</a>
            </div>

            <div className="col-12">
              <div className="text-muted-2 small">
                UC-R13 (email notification) is handled in <b>History</b> by selecting a row and sending notify from there.
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="col-12 col-lg-4">
        <div className="s-card p-3 p-md-4 h-100">
          <h3 className="h6 mb-2">UX states</h3>
          <ul className="text-muted-2 mb-0">
            <li>Live validation (digits-only ID, date availability).</li>
            <li>Submit shows loading state.</li>
            <li>Success redirects to History (UC-R5) for demo.</li>
            <li>Email notify (UC-R13) is triggered from History row details.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
