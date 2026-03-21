"use client";

import { useEffect, useState } from "react";
import { api } from "../../../services/api";
import { PlaceCard } from "../../../components/place-card";
import type { PlaceSummary } from "../../../types";

const placeTypes = ["", "cafe", "bar", "lounge", "coworking", "nightlife"];

export default function PlacesPage() {
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [type, setType] = useState("");

  useEffect(() => {
    void api.getPlaces({ city: "Prague", type: type || undefined }).then(setPlaces);
  }, [type]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Discovery</p>
          <h1 className="mt-2 text-4xl font-black">Places with a live pulse</h1>
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium shadow-soft">
          {placeTypes.map((item) => (
            <option key={item || "all"} value={item}>
              {item || "All categories"}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>
    </div>
  );
}

