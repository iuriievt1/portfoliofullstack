import { Filters } from "./types";

export const defaultFilters: Filters = {
  q: "",
  itemType: "All",
  start: "",
  end: "",
  status: { Returned: false, Pending: false, Overdue: false },
  sortKey: "date",
  sortDir: "desc",
  page: 1,
  pageSize: 10,
};

export function parseFilters(sp: URLSearchParams): Filters {
  const f: Filters = structuredClone(defaultFilters);

  f.q = sp.get("q") ?? "";
  f.itemType = (sp.get("it") as any) ?? "All";
  if (!["All","Boots","Vest","Helmet","Gloves","Jacket"].includes(f.itemType)) f.itemType = "All";

  f.start = sp.get("start") ?? "";
  f.end = sp.get("end") ?? "";

  f.status.Returned = sp.get("sr") === "1";
  f.status.Pending = sp.get("sp") === "1";
  f.status.Overdue = sp.get("so") === "1";

  f.sortKey = (sp.get("sk") as any) ?? "date";
  if (!["date","itemName","status","returnDate"].includes(f.sortKey)) f.sortKey = "date";

  f.sortDir = (sp.get("sd") as any) ?? "desc";
  if (!["asc","desc"].includes(f.sortDir)) f.sortDir = "desc";

  f.page = Math.max(1, Number(sp.get("p") ?? "1") || 1);

  const ps = Number(sp.get("ps") ?? "10");
  f.pageSize = (ps === 25 ? 25 : ps === 50 ? 50 : 10);

  return f;
}

export function toSearchParams(f: Filters) {
  const sp = new URLSearchParams();

  if (f.q) sp.set("q", f.q);
  if (f.itemType !== "All") sp.set("it", f.itemType);
  if (f.start) sp.set("start", f.start);
  if (f.end) sp.set("end", f.end);

  if (f.status.Returned) sp.set("sr", "1");
  if (f.status.Pending) sp.set("sp", "1");
  if (f.status.Overdue) sp.set("so", "1");

  sp.set("sk", f.sortKey);
  sp.set("sd", f.sortDir);
  sp.set("p", String(f.page));
  sp.set("ps", String(f.pageSize));

  return sp;
}
