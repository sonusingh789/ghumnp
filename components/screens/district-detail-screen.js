"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import PlaceCard from "@/components/cards/place-card";
import { useFavorites } from "@/context/favorites-context";
import {
  ArrowLeftIcon,
  HeartIcon,
  MapPinIcon,
  StarIcon,
} from "@/components/ui/icons";
import { cn, formatVisitors } from "@/lib/utils";

const tabs = ["All", "Attractions", "Food", "Stays"];

export default function DistrictDetailScreen({ district, districtPlaces }) {
  const [activeTab, setActiveTab] = useState("All");
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const districtFavoriteId = `district:${district.id}`;
  const isSaved = isFavorite(districtFavoriteId);

  const filteredPlaces = districtPlaces.filter((place) => {
    if (activeTab === "All") return true;
    if (activeTab === "Attractions") return place.category === "attraction";
    if (activeTab === "Food") return place.category === "food" || place.category === "restaurant";
    if (activeTab === "Stays") return place.category === "hotel" || place.category === "stay";
    return true;
  });

  return (
    <AppShell className="bg-[#f4f8f5]" contentClassName="px-0 pt-0">
      <section className="relative h-72 overflow-hidden">
        <Image
          src={district.image}
          alt={district.name}
          fill
          sizes="430px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/25" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-11 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(districtFavoriteId)}
            className={cn(
              "flex size-11 items-center justify-center rounded-full shadow-lg transition",
              isSaved ? "bg-rose-50 text-rose-500" : "bg-white/90 text-slate-800"
            )}
            aria-label={isSaved ? "Remove saved district" : "Save district"}
          >
            <HeartIcon filled={isSaved} className="size-5" />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 text-white">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/[0.16] px-3 py-1 text-xs font-medium backdrop-blur">
            <MapPinIcon className="size-4" />
            {district.province}
          </p>
          <h1 className="max-w-xs text-4xl font-semibold tracking-tight">{district.name}</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/80">{district.tagline}</p>
        </div>
      </section>

      <section className="-mt-7 rounded-t-[34px] bg-[#f4f8f5] px-5 pb-8 pt-6">
        <div className="rounded-[28px] border border-black/5 bg-white p-4 shadow-[0_20px_44px_rgba(17,24,39,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">District overview</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Built for discovery
              </h2>
            </div>
            <div className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-600">
              <span className="inline-flex items-center gap-1">
                <StarIcon className="size-4" />
                {district.rating.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {districtPlaces.length} featured places
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {formatVisitors(district.visitorsCount)}
            </span>
          </div>
        </div>

        <div className="scrollbar-hide mt-6 flex gap-3 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full px-4 py-2.5 text-sm font-semibold transition",
                activeTab === tab
                  ? "bg-primary text-white shadow-[0_12px_24px_rgba(22,163,74,0.25)]"
                  : "bg-white text-slate-500"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {filteredPlaces.length ? (
            filteredPlaces.map((place) => <PlaceCard key={place.id} place={place} />)
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
              <p className="text-lg font-semibold text-slate-900">No places in this section yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                This district layout is ready for backend data. You can plug in more attractions,
                foods, and stays later without changing the design.
              </p>
              <Link
                href="/add"
                className="mt-5 inline-flex rounded-full bg-primary px-4 py-2.5 font-semibold text-white"
              >
                Add a contribution
              </Link>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
