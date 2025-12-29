import React from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrgSettings } from "../../api/orgs.js";

export function SettingsPage() {
  const { org } = useOutletContext();
  const q = useQuery({ queryKey: ["orgSettings", org.id], queryFn: () => getOrgSettings(org.id) });

  const settings = q.data;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="text-lg font-semibold">Settings</div>
        <div className="mt-1 text-sm text-zinc-400">Org metadata + public key.</div>

        {q.isLoading ? (
          <div className="mt-4 text-sm text-zinc-400">Loading…</div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <div className="text-xs text-zinc-400">Organization</div>
              <div className="mt-1 text-sm">{settings?.name}</div>
            </div>

            <div>
              <div className="text-xs text-zinc-400">Role</div>
              <div className="mt-1 text-sm">{settings?.role}</div>
            </div>

            <div>
              <div className="text-xs text-zinc-400">Public key</div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm break-all">{settings?.publicKey}</code>
                <button
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
                  onClick={async () => {
                    await navigator.clipboard.writeText(settings?.publicKey || "");
                    alert("Copied!");
                  }}
                >
                  Copy
                </button>
              </div>
              <div className="mt-2 text-xs text-zinc-500">Use this in your website form to post to /api/public/lead.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
