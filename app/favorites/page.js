"use client";

import Link from "next/link";
import AppShell from "@/components/layout/app-shell";
import PlaceCard from "@/components/cards/place-card";
import { useFavorites } from "@/context/favorites-context";
import { places } from "@/data/nepal";
import { HeartIcon } from "@/components/ui/icons";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const favoritePlaces = places.filter((place) => favorites.includes(place.id));

  return (
    <AppShell>
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
          Saved For Later
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Favorites</h1>
        <p className="mt-2 text-sm text-slate-500">{favoritePlaces.length} saved places</p>
      </section>

      <section className="mt-8">
        {favoritePlaces.length ? (
          <div className="space-y-4">
            {favoritePlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="rounded-[34px] bg-white px-6 py-14 text-center shadow-[0_22px_48px_rgba(17,24,39,0.08)]">
            <div className="mx-auto flex size-[4.5rem] items-center justify-center rounded-full bg-slate-100 text-slate-300">
              <HeartIcon className="size-9" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
              No saved places yet
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Save temples, food spots, and scenic escapes from across the app to build your own Nepal shortlist.
            </p>
            <Link
              href="/explore"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 font-semibold text-white"
            >
              Explore Now
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
