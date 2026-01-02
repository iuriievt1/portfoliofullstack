"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isAvailable, yyyyMmDd } from "@/lib/date";

function firstDayOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export default function CalendarView() {
  const router = useRouter();
  const [cursor, setCursor] = useState(() => new Date());
  const [msg, setMsg] = useState<{ type: "success" | "danger" | "info"; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const label = cursor.toLocaleString("en-US", { month: "long", year: "numeric" });

  const monthStart = useMemo(() => firstDayOfMonth(cursor), [cursor]);
  const total = useMemo(() => daysInMonth(cursor), [cursor]);

  // Monday-based grid
  const startWeekday = (monthStart.getDay() + 6) % 7;

  const cells = useMemo(() => {
    const arr: Array<{ date?: string; available?: boolean }> = [];
    for (let i = 0; i < startWeekday; i++) arr.push({});
    for (let d = 1; d <= total; d++) {
      const dt = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      const dateStr = yyyyMmDd(dt);
      arr.push({ date: dateStr, available: isAvailable(dateStr) });
    }
    return arr;
  }, [cursor, startWeekday, total]);

  async function sendNotify() {
    setMsg(null);
    setSending(true);
    try {
      const res = await fetch("/api/notify", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Notify failed");
      setMsg({ type: "success", text: data.message });
    } catch (e: any) {
      setMsg({ type: "danger", text: e?.message ?? "Notify failed" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="s-card p-3 p-md-4">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h2 className="h5 mb-1">Calendar View (UC-R12)</h2>
          <div className="text-muted-2">Available vs unavailable days. Click day → pre-fill UC-R1 form.</div>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            ← Prev
          </button>
          <span className="s-pill">{label}</span>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            Next →
          </button>

          <button className="btn btn-primary btn-sm" onClick={sendNotify} disabled={sending}>
            {sending ? "Sending..." : "Send notification (UC-R13)"}
          </button>
        </div>
      </div>

      {msg ? <div className={`alert alert-${msg.type}`} role="alert">{msg.text}</div> : null}

      <div className="row g-2 mb-2">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className="col text-center text-muted-2 small">{d}</div>
        ))}
      </div>

      <div className="row g-2">
        {cells.map((c, idx) => {
          const disabled = !c.date;
          const ok = !!c.available;

          return (
            <div key={idx} className="col-6 col-md-3 col-lg-2">
              <button
                className="s-card w-100 p-3 text-start"
                disabled={disabled}
                onClick={() => {
                  if (!c.date) return;
                  router.push(`/reservations?date=${c.date}`);
                  setMsg({ type: "info", text: `Prefilled date: ${c.date}` });
                }}
                style={{
                  opacity: disabled ? 0.25 : 1,
                  borderColor: c.date ? (ok ? "rgba(0,220,180,.35)" : "rgba(255,80,120,.35)") : undefined,
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="fw-semibold">{c.date ? c.date.slice(-2) : ""}</div>
                  {c.date ? (
                    <span className={`badge ${ok ? "bg-success" : "bg-danger"}`}>{ok ? "Yes" : "No"}</span>
                  ) : null}
                </div>
                <div className="text-muted-2 small mt-2">Click → prefill</div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-muted-2 small mt-3">
        Availability rule: weekdays (Mon–Fri) in the future are available; weekends and past dates are unavailable.
      </div>
    </div>
  );
}
