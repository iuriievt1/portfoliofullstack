"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../services/api";
import type { PlaceSummary } from "../../../types";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";

export default function CreatePostPage() {
  const router = useRouter();
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    placeId: "",
    text: "",
    imageUrl: "",
    vibe: 8,
    crowdLevel: "medium",
    noiseLevel: "social",
    waitTimeMin: 5,
    expiresInHours: 4
  });

  useEffect(() => {
    void api.getPlaces({ city: "Prague" }).then((response) => {
      setPlaces(response);
      if (response[0]) {
        setForm((current) => ({ ...current, placeId: response[0].id }));
      }
    });
  }, []);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const upload = await api.uploadImage(file);
      setForm((current) => ({ ...current, imageUrl: upload.url }));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await api.createPost(form);
    router.push("/app/feed");
  }

  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Create signal</p>
      <h1 className="mt-2 text-4xl font-black">Share what a place feels like right now</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-[32px] bg-white/90 p-8 shadow-soft">
        <div>
          <label className="mb-2 block text-sm font-semibold">Place</label>
          <select value={form.placeId} onChange={(e) => setForm({ ...form, placeId: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Live update</label>
          <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="What's the atmosphere right now?" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Image upload</label>
          <Input type="file" accept="image/*" onChange={onFileChange} />
          {form.imageUrl ? <p className="mt-2 text-sm text-teal-700">Uploaded: {form.imageUrl}</p> : null}
          {uploading ? <p className="mt-2 text-sm text-slate-500">Uploading image...</p> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold">Vibe score</label>
            <Input type="number" min={1} max={10} value={form.vibe} onChange={(e) => setForm({ ...form, vibe: Number(e.target.value) })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Wait time</label>
            <Input type="number" min={0} max={240} value={form.waitTimeMin} onChange={(e) => setForm({ ...form, waitTimeMin: Number(e.target.value) })} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Crowd level</label>
            <select value={form.crowdLevel} onChange={(e) => setForm({ ...form, crowdLevel: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
              {["low", "medium", "high", "packed"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Noise level</label>
            <select value={form.noiseLevel} onChange={(e) => setForm({ ...form, noiseLevel: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
              {["quiet", "social", "loud", "wild"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Expire after hours</label>
          <Input type="number" min={1} max={24} value={form.expiresInHours} onChange={(e) => setForm({ ...form, expiresInHours: Number(e.target.value) })} />
        </div>
        <Button type="submit">Publish live post</Button>
      </form>
    </div>
  );
}

