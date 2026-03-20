"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import SearchBar from "@/components/forms/search-bar";
import DistrictCard from "@/components/cards/district-card";
import { districts, provinces } from "@/data/nepal";
import { ChevronRightIcon, SlidersIcon } from "@/components/ui/icons";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const search = deferredQuery.trim().toLowerCase();

  return (
    <AppShell>
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
          Explore Nepal
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Browse by province</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Discover all seven provinces through featured districts, culture, landscapes, and destination highlights.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1">
            <SearchBar value={query} onChange={setQuery} placeholder="Search districts..." />
          </div>
          <button
            type="button"
            className="flex size-14 items-center justify-center rounded-[22px] bg-primary text-white shadow-[0_18px_32px_rgba(22,163,74,0.28)]"
            aria-label="Filter places"
          >
            <SlidersIcon className="size-6" />
          </button>
        </div>
      </section>

      <section className="mt-8 space-y-5">
        {provinces.map((province) => {
          const provinceDistricts = districts.filter((district) => {
            const matchesProvince = district.province === province;
            const matchesSearch =
              !search ||
              district.name.toLowerCase().includes(search) ||
              district.tagline.toLowerCase().includes(search);

            return matchesProvince && matchesSearch;
          });

          return (
            <article
              key={province}
              className="rounded-[30px] border border-black/5 bg-white p-5 shadow-[0_18px_40px_rgba(17,24,39,0.06)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                    Province
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    {province}
                  </h2>
                </div>
                <Link
                  href="/districts"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  View All
                  <ChevronRightIcon className="size-4" />
                </Link>
              </div>
              {provinceDistricts.length ? (
                <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
                  {provinceDistricts.map((district) => (
                    <DistrictCard key={district.id} district={district} compact />
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
                  We have not added featured districts for this province yet, but the shell is ready for expansion.
                </div>
              )}
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
