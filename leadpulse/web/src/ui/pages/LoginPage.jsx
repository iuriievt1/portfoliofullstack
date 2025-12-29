import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth.jsx";

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="text-xl font-semibold">Welcome back</div>
          <div className="mt-1 text-sm text-zinc-400">Login to your LeadPulse workspace.</div>

          <div className="mt-6 space-y-3">
            <input className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2"
              placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2"
              placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            {err ? <div className="text-sm text-red-400">{err}</div> : null}

            <button
              className="w-full rounded-xl bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-white"
              onClick={async () => {
                setErr("");
                try {
                  await login(email, password);
                  nav("/");
                } catch (e) {
                  setErr(e?.response?.data?.error || "Login failed");
                }
              }}
            >
              Login
            </button>
          </div>

          <div className="mt-4 text-sm text-zinc-400">
            No account? <Link className="underline" to="/register">Create one</Link>
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          Tip: Run <code className="text-zinc-300">npm run seed</code> in the project root to create a demo account.
        </div>
      </div>
    </div>
  );
}
