import { http } from "./http.js";

export async function listLeads(orgId) {
  const { data } = await http.get(`/api/orgs/${orgId}/leads`);
  return data.leads;
}

export async function createLead(orgId, payload) {
  const { data } = await http.post(`/api/orgs/${orgId}/leads`, payload);
  return data.lead;
}

export async function updateLead(orgId, leadId, patch) {
  const { data } = await http.patch(`/api/orgs/${orgId}/leads/${leadId}`, patch);
  return data.lead;
}

export async function addNote(orgId, leadId, body) {
  const { data } = await http.post(`/api/orgs/${orgId}/leads/${leadId}/notes`, { body });
  return data.lead;
}
