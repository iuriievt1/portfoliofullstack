"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Trash2 } from "lucide-react";
import type { AuthUser, PostFeedItem } from "../types";
import { formatRelativeDate } from "../lib/utils";
import { Button } from "./ui/button";

interface Props {
  post: PostFeedItem;
  currentUser?: AuthUser | null;
  onLike?: (id: string, liked: boolean) => void;
  onDelete?: (id: string) => void;
}

export function PostCard({ post, currentUser, onLike, onDelete }: Props) {
  const isOwner = currentUser?.id === post.user.id;

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-soft">
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-200">
              {post.user.avatarUrl ? (
                <Image src={post.user.avatarUrl} alt={post.user.username} width={48} height={48} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <Link href={`/app/profile/${post.user.id}`} className="font-semibold">
                {post.user.username}
              </Link>
              <p className="text-sm text-slate-500">{formatRelativeDate(post.createdAt)}</p>
            </div>
          </div>
          <Link href={`/app/places/${post.place.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
            <MapPin size={14} />
            {post.place.name}
          </Link>
        </div>
        <div className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
          Vibe {post.vibe}/10
        </div>
      </div>

      {post.imageUrl ? (
        <div className="relative h-72 w-full">
          <Image src={post.imageUrl} alt={post.text} fill className="object-cover" />
        </div>
      ) : null}

      <div className="space-y-4 p-5">
        <p className="text-[15px] leading-7 text-slate-700">{post.text}</p>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-3">Crowd: {post.crowdLevel}</div>
          <div className="rounded-2xl bg-slate-50 p-3">Noise: {post.noiseLevel}</div>
          <div className="rounded-2xl bg-slate-50 p-3">Wait: {post.waitTimeMin ?? 0} min</div>
          <div className="rounded-2xl bg-slate-50 p-3">Live until: {new Date(post.expiresAt).toLocaleTimeString()}</div>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-accent hover:bg-orange-500" onClick={() => onLike?.(post.id, !!post.likedByMe)}>
            <Heart size={16} className="mr-2" />
            {post.likedByMe ? "Unlike" : "Like"} · {post.likeCount}
          </Button>
          {isOwner ? (
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500" onClick={() => onDelete?.(post.id)}>
              <Trash2 size={16} />
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

