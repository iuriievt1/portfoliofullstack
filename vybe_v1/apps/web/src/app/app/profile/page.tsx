"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../services/api";
import type { AuthUser } from "../../../types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<AuthUser | null>(null);

  useEffect(() => {
    void api.getMyProfile().then(setProfile);
  }, []);

  if (!profile) {
    return <div className="rounded-[28px] bg-white/80 p-8 shadow-soft">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl rounded-[32px] bg-white/90 p-8 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Profile</p>
          <h1 className="mt-2 text-4xl font-black">{profile.username}</h1>
          <p className="mt-3 text-slate-600">{profile.bio ?? "No bio yet."}</p>
        </div>
        <Link href="/app/profile/edit" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">
          Edit profile
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">City</p>
          <p className="mt-3 font-semibold">{profile.city ?? "Unknown"}</p>
        </div>
        <div className="rounded-[24px] bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Trust score</p>
          <p className="mt-3 font-semibold">{Math.round(profile.trustScore)}</p>
        </div>
        <div className="rounded-[24px] bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Member since</p>
          <p className="mt-3 font-semibold">{new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

