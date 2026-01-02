export function yyyyMmDd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isPast(dateStr: string) {
  const today = yyyyMmDd(new Date());
  return dateStr < today;
}

export function isWeekend(dateStr: string) {
  const [y,m,d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const wd = dt.getDay(); // 0 Sun .. 6 Sat
  return wd === 0 || wd === 6;
}

export function isAvailable(dateStr: string) {
  if (!dateStr) return false;
  if (isPast(dateStr)) return false;
  if (isWeekend(dateStr)) return false;
  return true;
}

export function addDays(dateStr: string, days: number) {
  const [y,m,d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return yyyyMmDd(dt);
}
