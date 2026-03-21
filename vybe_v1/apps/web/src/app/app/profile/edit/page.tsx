"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../services/api";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ bio: "", avatarUrl: "", city: "" });

  useEffect(() => {
    void api.getMyProfile().then((profile) => {
      setForm({
        bio: profile.bio ?? "",
        avatarUrl: profile.avatarUrl ?? "",
        city: profile.city ?? ""
      });
    });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await api.updateProfile(form);
    router.push("/app/profile");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl rounded-[32px] bg-white/90 p-8 shadow-soft">
      <h1 className="text-4xl font-black">Edit profile</h1>
      <div className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold">Bio</label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Avatar URL</label>
          <Input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">City</label>
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
      </div>
      <Button type="submit" className="mt-6">Save changes</Button>
    </form>
  );
}

