import React, { useState } from "react";
import { login } from "../api/auth.js";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@chronoledger.dev");
  const [password, setPassword] = useState("DemoPassword123!");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-lg">
        <div className="text-xl font-semibold">ChronoLedger</div>
        <div className="mt-1 text-sm text-zinc-400">
          Tamper‑evident event ledger with time travel + branching.
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <div className="text-xs text-zinc-400 mb-1">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <div className="text-xs text-zinc-400 mb-1">Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>

          {err ? <div className="text-sm text-red-400">{err}</div> : null}

          <button
            disabled={loading}
            onClick={async () => {
              try {
                setErr("");
                setLoading(true);
                await login(email, password);
                window.location.href = "/timeline";
              } catch (e) {
                setErr(String(e.message || e));
              } finally {
                setLoading(false);
              }
            }}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Login"}
          </button>

          <div className="text-xs text-zinc-500">
            Tip: run <code className="text-zinc-300">npm run seed</code> to print demo creds & public ingest key.
          </div>
        </div>
      </div>
    </div>
  );
}
