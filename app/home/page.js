"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import DistrictCard from "@/components/cards/district-card";
import PlaceCard from "@/components/cards/place-card";
import SearchBar from "@/components/forms/search-bar";
import { districts, places } from "@/data/nepal";
import { ChevronRightIcon, SparklesIcon } from "@/components/ui/icons";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const search = deferredQuery.trim().toLowerCase();
  const featuredDistricts = districts.slice(0, 5);
  const visiblePlaces = search
    ? places.filter(
        (place) =>
          place.name.toLowerCase().includes(search) ||
          place.description.toLowerCase().includes(search) ||
          place.location.toLowerCase().includes(search)
      )
    : places.filter((place) => place.isFeatured).slice(0, 4);
  const hiddenGems = places.filter((place) => place.isHidden).slice(0, 4);

  return (
    <AppShell contentClassName="px-0 pt-0">
      <section className="sticky top-0 z-20 bg-white/[0.86] px-5 pb-4 pt-6 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
          Welcome Explorer
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Discover Nepal beautifully
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Curated districts, memorable places, and local experiences designed for a polished first release.
        </p>
        <div className="mt-5">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search districts, places, foods..."
          />
        </div>
      </section>

      <div className="space-y-8 px-5 pt-5">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[1.9rem] font-semibold tracking-tight text-slate-950">
              Featured Districts
            </h2>
            <Link href="/districts" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              View All
              <ChevronRightIcon className="size-4" />
            </Link>
          </div>
          <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
            {featuredDistricts.map((district) => (
              <DistrictCard key={district.id} district={district} compact />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[1.9rem] font-semibold tracking-tight text-slate-950">
              Most Visited Places in Nepal
            </h2>
          </div>
          <div className="space-y-4">
            {visiblePlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <SparklesIcon className="size-5 text-primary" />
            <h2 className="text-[1.9rem] font-semibold tracking-tight text-slate-950">Hidden Gems</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {hiddenGems.map((place) => (
              <PlaceCard key={place.id} place={place} layout="grid" />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
