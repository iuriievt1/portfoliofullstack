import { http } from "./http.js";

export async function listOrgs() {
  const { data } = await http.get("/api/orgs");
  return data.orgs;
}

export async function createOrg(name) {
  const { data } = await http.post("/api/orgs", { name });
  return data.org;
}

export async function getOrgSettings(orgId) {
  const { data } = await http.get(`/api/orgs/${orgId}/settings`);
  return data.org;
}
