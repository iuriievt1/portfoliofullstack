import { api } from "./http.js";
export function getCurrentOrg() {
  return api("/api/orgs/current");
}
export function createBranch(orgId, payload) {
  return api(`/api/orgs/${orgId}/branches`, { method: "POST", body: payload });
}
export function listBranches(orgId) {
  return api(`/api/orgs/${orgId}/branches`);
}
