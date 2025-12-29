const KEY = "leadpulse:selectedOrgId";

export function getSelectedOrgId() {
  return localStorage.getItem(KEY) || "";
}

export function setSelectedOrgId(id) {
  if (!id) localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, id);
}
