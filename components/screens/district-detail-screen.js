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
    <AppShell className="bg-[#f5f6f8]" contentClassName="pt-0 sm:pt-5">
      <div className="mx-auto w-full max-w-5xl">
        <section className="relative overflow-hidden  border border-black/5 bg-white shadow-[0_20px_54px_rgba(15,23,42,0.08)]">
          <div className="relative h-[300px] sm:h-[360px] lg:h-[430px]">
            <Image
              src={district.image}
              alt={district.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1100px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-5">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex size-11 items-center justify-center rounded-full bg-white/92 text-slate-900 shadow-lg"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(districtFavoriteId)}
                className={cn(
                  "flex size-11 items-center justify-center rounded-full shadow-lg transition",
                  isSaved ? "bg-rose-50 text-rose-500" : "bg-white/92 text-slate-800"
                )}
                aria-label={isSaved ? "Remove saved district" : "Save district"}
              >
                <HeartIcon filled={isSaved} className="size-5" />
              </button>
            </div>
          </div>

          <div className="relative -mt-8 rounded-t-[28px] bg-white px-4 pb-5 pt-5 sm:-mt-10 sm:px-6 sm:pb-6 sm:pt-6 lg:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-[2rem] font-semibold tracking-tight text-slate-950 sm:text-[2.3rem]">
                  {district.name}
                </h1>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-500">
                  <MapPinIcon className="size-4" />
                  {district.province} Province
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]">
                  {district.tagline}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-2 font-semibold text-amber-600">
                  <StarIcon className="size-4" />
                  {district.rating.toFixed(1)}
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 font-medium text-slate-600">
                  <MapPinIcon className="size-4" />
                  {formatVisitors(district.visitorsCount)}
                </div>
                <div className="inline-flex items-center rounded-full bg-emerald-50 px-3.5 py-2 font-semibold text-emerald-700">
                  {districtPlaces.length} places
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-1 pb-8 pt-5 sm:px-2 sm:pt-6">
        <div className="scrollbar-hide mobile-h-scroll flex gap-2 rounded-full bg-slate-100 p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "min-w-[92px] rounded-full px-4 py-2.5 text-sm font-semibold transition",
                activeTab === tab
                  ? "bg-white text-slate-950 shadow-[0_8px_20px_rgba(15,23,42,0.16)]"
                  : "bg-transparent text-slate-500"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Explore
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Must Visit
              </h2>
            </div>
          </div>

        <div className="space-y-4">
          {filteredPlaces.length ? (
            filteredPlaces.map((place) => <PlaceCard key={place.id} place={place} />)
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
              <p className="text-lg font-semibold text-slate-900">No places in this section yet</p>
              <p className="mt-2 text-sm text-slate-500"> You can contribute by adding new places!</p>
              <Link
                href="/add"
                className="mt-5 inline-flex rounded-full bg-primary px-4 py-2.5 font-semibold text-white"
              >
                Add a contribution
              </Link>
            </div>
          )}
        </div>
        </div>
        </section>
      </div>
    </AppShell>
  );
}
