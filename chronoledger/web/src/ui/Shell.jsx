import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../api/auth.js";

function Tab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-xl px-3 py-2 text-sm border",
          isActive ? "border-zinc-600 bg-zinc-900" : "border-zinc-800 bg-zinc-950 hover:bg-zinc-900"
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function Shell({ ctx, children }) {
  const nav = useNavigate();
  const org = ctx.org;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="font-semibold">ChronoLedger</div>
          <div className="text-xs text-zinc-500">org: {org.slug}</div>

          <div className="ml-6 flex gap-2">
            <Tab to="/timeline">Timeline</Tab>
            <Tab to="/timetravel">Time Travel</Tab>
            <Tab to="/branches">Branches</Tab>
            <Tab to="/verify">Verify</Tab>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={async () => {
                await logout();
                nav(0);
              }}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm hover:bg-zinc-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
