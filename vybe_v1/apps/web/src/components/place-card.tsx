import Link from "next/link";
import type { PlaceSummary } from "../types";

export function PlaceCard({ place }: { place: PlaceSummary }) {
  return (
    <Link
      href={`/app/places/${place.id}`}
      className="group rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-soft transition hover:-translate-y-1"
    >
      <div className="mb-4 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
        {place.type}
      </div>
      <h3 className="text-xl font-bold">{place.name}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{place.description ?? "Live city context for this spot."}</p>
      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <span>{place.city}</span>
        <span>{place.verified ? "Verified" : "Community"}</span>
      </div>
    </Link>
  );
}

