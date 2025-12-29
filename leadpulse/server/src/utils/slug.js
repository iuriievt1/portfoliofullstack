export function safeName(name = "") {
  return String(name).trim().slice(0, 120);
}
