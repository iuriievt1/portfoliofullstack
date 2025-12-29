import React, { useEffect, useMemo, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../state/auth.jsx";
import { createOrg, listOrgs } from "../api/orgs.js";
import { getSelectedOrgId, setSelectedOrgId } from "../state/org.js";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function AppLayout() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user, logout } = useAuth();
  const [selected, setSelected] = useState(getSelectedOrgId());

  const orgsQ = useQuery({
    queryKey: ["orgs"],
    queryFn: listOrgs
  });

  const orgs = orgsQ.data || [];
  const selectedOrg = useMemo(() => orgs.find((o) => o.id === selected), [orgs, selected]);
  useEffect(() => {
    if (selected) return;
    if (orgs && orgs.length > 0) {
      const id = orgs[0].id;
      setSelected(id);
      setSelectedOrgId(id);
    }
  }, [orgs, selected]);


  async function onCreateOrg() {
    const name = prompt("Org name?");
    if (!name) return;
    const org = await createOrg(name);
    await qc.invalidateQueries({ queryKey: ["orgs"] });
    setSelected(org.id);
    setSelectedOrgId(org.id);
    nav("/");
  }

  function onSelect(e) {
    const id = e.target.value;
    setSelected(id);
    setSelectedOrgId(id);
    nav("/");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-zinc-100" />
            <div>
              <div className="text-sm font-semibold leading-tight">LeadPulse</div>
              <div className="text-xs text-zinc-400 leading-tight">Realtime lead pipeline</div>
            </div>
          </div>

          <nav className="ml-6 flex gap-2 text-sm">
            <NavLink to="/" end className={({ isActive }) => cn("rounded-lg px-3 py-1.5 text-zinc-300 hover:bg-zinc-900", isActive && "bg-zinc-900 text-zinc-50")}>Dashboard</NavLink>
            <NavLink to="/leads" className={({ isActive }) => cn("rounded-lg px-3 py-1.5 text-zinc-300 hover:bg-zinc-900", isActive && "bg-zinc-900 text-zinc-50")}>Leads</NavLink>
            <NavLink to="/settings" className={({ isActive }) => cn("rounded-lg px-3 py-1.5 text-zinc-300 hover:bg-zinc-900", isActive && "bg-zinc-900 text-zinc-50")}>Settings</NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {orgsQ.isLoading ? (
              <div className="text-xs text-zinc-400">Loading orgs…</div>
            ) : (
              <select value={selected} onChange={onSelect} className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">
                <option value="" disabled>Select org…</option>
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.role})</option>)}
              </select>
            )}

            <button onClick={onCreateOrg} className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800">+ Org</button>

            <div className="hidden sm:block text-xs text-zinc-400">{user?.email}</div>
            <button
              onClick={async () => { await logout(); nav("/login"); }}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm hover:bg-zinc-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {!selectedOrg ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-300">
            <div className="text-lg font-semibold">Pick an organization</div>
            <p className="mt-2 text-sm text-zinc-400">Create one or select from the dropdown to start managing leads.</p>
          </div>
        ) : (
          <Outlet context={{ org: selectedOrg }} />
        )}
      </main>
    </div>
  );
}
