"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/app-shell";
import DistrictCard from "@/components/cards/district-card";
import { allDistricts, districts } from "@/data/nepal";
import { GridIcon, MapPinIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const detailedMap = new Map(districts.map((district) => [district.name.toLowerCase(), district]));

export default function DistrictsPage() {
  const [view, setView] = useState("grid");

  return (
    <AppShell>
      <section className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
            District Directory
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">All 77 Districts</h1>
          <p className="mt-2 text-sm text-slate-500">Showing {allDistricts.length} districts</p>
        </div>
        <div className="flex gap-2 rounded-full bg-white p-1 shadow-[0_14px_34px_rgba(17,24,39,0.08)]">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={cn(
              "flex size-10 items-center justify-center rounded-full transition",
              view === "grid" ? "bg-primary text-white" : "text-slate-500"
            )}
            aria-label="Show grid view"
          >
            <GridIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={cn(
              "flex size-10 items-center justify-center rounded-full transition",
              view === "map" ? "bg-primary text-white" : "text-slate-500"
            )}
            aria-label="Show map view"
          >
            <MapPinIcon className="size-5" />
          </button>
        </div>
      </section>

      {view === "grid" ? (
        <section className="mt-8 grid grid-cols-2 gap-4">
          {allDistricts.map((districtName) => {
            const detailed = detailedMap.get(districtName.toLowerCase());

            if (detailed) {
              return <DistrictCard key={districtName} district={detailed} />;
            }

            return (
              <div
                key={districtName}
                className="flex min-h-44 flex-col justify-between rounded-[28px] border border-dashed border-slate-300 bg-white/60 p-4 text-slate-400"
              >
                <div className="rounded-[22px] bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Coming Soon
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-600">{districtName}</h2>
                  <p className="mt-2 text-sm leading-6">
                    Detailed tourism content for this district will be available in a future data release.
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="mt-10">
          <div className="texture rounded-[34px] border border-black/5 px-6 py-16 text-center shadow-[0_18px_42px_rgba(17,24,39,0.06)]">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-white text-primary shadow-lg">
              <MapPinIcon className="size-10" />
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
              Map View Coming Soon
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-600">
              The UI is ready for a province map or district polygon layer once you connect geographic data.
            </p>
            <Link
              href="/explore"
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 font-semibold text-white"
            >
              Continue Exploring
            </Link>
          </div>
        </section>
      )}
    </AppShell>
  );
}
