import { api } from "./http.js";

export function listEvents(orgId, branchId) {
  return api(`/api/orgs/${orgId}/branches/${branchId}/events`);
}
export function appendEvent(orgId, branchId, payload) {
  return api(`/api/orgs/${orgId}/branches/${branchId}/events`, { method: "POST", body: payload });
}
export function getState(orgId, branchId, at) {
  const q = at ? `?at=${encodeURIComponent(at)}` : "";
  return api(`/api/orgs/${orgId}/branches/${branchId}/state${q}`);
}
export function verifyBranch(orgId, branchId) {
  return api(`/api/orgs/${orgId}/branches/${branchId}/verify`);
}
