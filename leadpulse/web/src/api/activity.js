import { http } from "./http.js";

export async function listActivity(orgId) {
  const { data } = await http.get(`/api/orgs/${orgId}/activity`);
  return data.activity;
}
