"use client";

import { useEffect, useState } from "react";
import { api } from "../../../services/api";
import { PostCard } from "../../../components/post-card";
import type { AuthUser, PostFeedItem } from "../../../types";

export default function FeedPage() {
  const [posts, setPosts] = useState<PostFeedItem[]>([]);
  const [me, setMe] = useState<AuthUser | null>(null);

  useEffect(() => {
    void Promise.all([api.getFeed(), api.getMyProfile()])
      .then(([feed, user]) => {
        setPosts(feed);
        setMe(user);
      })
      .catch(() => undefined);
  }, []);

  async function toggleLike(id: string, liked: boolean) {
    if (liked) await api.unlikePost(id);
    else await api.likePost(id);
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? {
              ...post,
              likedByMe: !liked,
              likeCount: liked ? post.likeCount - 1 : post.likeCount + 1
            }
          : post
      )
    );
  }

  async function deletePost(id: string) {
    await api.deletePost(id);
    setPosts((current) => current.filter((post) => post.id !== id));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Global feed</p>
          <h1 className="mt-2 text-4xl font-black">Prague right now</h1>
        </div>
        {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} currentUser={me} onLike={toggleLike} onDelete={deletePost} />) : <div className="rounded-[28px] bg-white/80 p-8 shadow-soft">No live posts yet. Be the first to set the signal.</div>}
      </section>
      <aside className="space-y-4">
        <div className="rounded-[28px] bg-white/85 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Your mode</p>
          <h2 className="mt-3 text-2xl font-bold">{me?.username ?? "VYBE member"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{me?.bio ?? "Add your first live signal from a place in Prague."}</p>
        </div>
        <div className="rounded-[28px] bg-ink p-6 text-white shadow-soft">
          <p className="text-sm uppercase tracking-[0.25em] text-white/60">Signal quality</p>
          <p className="mt-3 text-4xl font-black">{Math.round(me?.trustScore ?? 50)}</p>
          <p className="mt-2 text-sm text-white/70">Trust score rises as you contribute useful live updates.</p>
        </div>
      </aside>
    </div>
  );
}

