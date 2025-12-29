import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth.jsx";

export function RegisterPage() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("Your Name");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="text-xl font-semibold">Create account</div>
          <div className="mt-1 text-sm text-zinc-400">Start tracking leads in minutes.</div>

          <div className="mt-6 space-y-3">
            <input className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2"
              placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2"
              placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2"
              placeholder="Password (min 8 chars)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            {err ? <div className="text-sm text-red-400">{err}</div> : null}

            <button
              className="w-full rounded-xl bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-white"
              onClick={async () => {
                setErr("");
                try {
                  await register(email, password, name);
                  nav("/");
                } catch (e) {
                  setErr(e?.response?.data?.error || "Register failed");
                }
              }}
            >
              Create account
            </button>
          </div>

          <div className="mt-4 text-sm text-zinc-400">
            Already have an account? <Link className="underline" to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
