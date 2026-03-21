"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "../../../../services/api";
import type { AuthUser } from "../../../../types";

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!params.id) return;
    void api.getUser(params.id).then(setProfile);
  }, [params.id]);

  if (!profile) {
    return <div className="rounded-[28px] bg-white/80 p-8 shadow-soft">Loading public profile...</div>;
  }

  return (
    <div className="max-w-3xl rounded-[32px] bg-white/90 p-8 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Public profile</p>
      <h1 className="mt-2 text-4xl font-black">{profile.username}</h1>
      <p className="mt-3 text-slate-600">{profile.bio ?? "No bio yet."}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">City</p>
          <p className="mt-3 font-semibold">{profile.city ?? "Unknown"}</p>
        </div>
        <div className="rounded-[24px] bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Trust score</p>
          <p className="mt-3 font-semibold">{Math.round(profile.trustScore)}</p>
        </div>
      </div>
    </div>
  );
}

