"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "../../../../services/api";
import { PostCard } from "../../../../components/post-card";
import type { AuthUser, PlaceDetails } from "../../../../types";

export default function PlaceDetailsPage() {
  const params = useParams<{ id: string }>();
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [me, setMe] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!params.id) return;
    void Promise.all([api.getPlace(params.id), api.getMyProfile()])
      .then(([placeResponse, user]) => {
        setPlace(placeResponse);
        setMe(user);
      })
      .catch(() => undefined);
  }, [params.id]);

  if (!place) {
    return <div className="rounded-[28px] bg-white/80 p-8 shadow-soft">Loading place signal...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white/85 p-8 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">
              {place.type}
            </div>
            <h1 className="mt-3 text-4xl font-black">{place.name}</h1>
            <p className="mt-3 max-w-2xl text-slate-600">{place.description}</p>
          </div>
          <div className="rounded-[24px] bg-slate-50 p-5 text-sm text-slate-600">
            <p>{place.address}</p>
            <p className="mt-2">{place.city}</p>
            <p className="mt-2">{place.verified ? "Verified place" : "Community added place"}</p>
          </div>
        </div>
      </section>
      <section className="space-y-5">
        <h2 className="text-2xl font-bold">Live posts for this place</h2>
        {place.posts.length ? place.posts.map((post) => <PostCard key={post.id} post={post} currentUser={me} />) : <div className="rounded-[28px] bg-white/80 p-8 shadow-soft">No live posts yet for this place.</div>}
      </section>
    </div>
  );
}

