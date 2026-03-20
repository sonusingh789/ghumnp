"use client";

import Link from "next/link";
import Image from "next/image";
import { useDeferredValue, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import DistrictCard from "@/components/cards/district-card";
import PlaceCard from "@/components/cards/place-card";
import { districts, places, userProfile } from "@/data/nepal";
import { ChevronRightIcon } from "@/components/ui/icons";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const search = deferredQuery.trim().toLowerCase();

  const featuredDistricts = districts.slice(0, 5);
  const visiblePlaces = search
    ? places.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.location.toLowerCase().includes(search)
      )
    : places.filter((p) => p.isFeatured).slice(0, 4);
  const hiddenGems = places.filter((p) => p.isHidden).slice(0, 4);

  return (
    <AppShell>
      {/* Top Bar */}
      <header style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }} className="fade-up">
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 2 }}>
            Ghum Nepal
          </div>
          <div className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1 }}>
            Discover Nepal
          </div>
        </div>
        <Link href="/profile">
          <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--jade-soft)", boxShadow: "0 2px 12px var(--jade-glow)", position: "relative" }}>
            <Image src={userProfile.avatar} alt={userProfile.name} fill sizes="44px" className="object-cover" />
          </div>
        </Link>
      </header>

      {/* Search */}
      <div style={{ padding: "16px 20px 0" }} className="fade-up-1">
        <label style={{ position: "relative", display: "block" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "var(--ink-faint)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search districts, places, foods..."
            style={{
              width: "100%",
              padding: "14px 16px 14px 44px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--border-strong)",
              background: "var(--bg-card)",
              fontSize: 14,
              color: "var(--ink)",
              outline: "none",
              boxShadow: "var(--shadow-sm)",
            }}
          />
        </label>
      </div>

      <div style={{ padding: "24px 0 0" }}>
        {/* Featured Districts */}
        <section className="fade-up-2" style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 2 }}>Popular</div>
              <h2 className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>Featured Districts</h2>
            </div>
            <Link href="/districts" style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 13, fontWeight: 600, color: "var(--jade)" }}>
              All 77 <ChevronRightIcon className="size-4" />
            </Link>
          </div>
          <div className="scrollbar-hide" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "4px 20px 8px" }}>
            {featuredDistricts.map((district) => (
              <DistrictCard key={district.id} district={district} compact />
            ))}
          </div>
        </section>

        {/* Featured Places */}
        <section className="fade-up-3" style={{ marginBottom: 32, padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 2 }}>Must Visit</div>
              <h2 className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>Top Places</h2>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visiblePlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>

        {/* Hidden Gems */}
        {!search && (
          <section className="fade-up-4" style={{ padding: "0 20px", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: "var(--gold)" }}>
                <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z" />
                <path d="m18.5 14.5.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
              </svg>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--gold)" }}>Off the beaten path</div>
                <h2 className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>Hidden Gems</h2>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {hiddenGems.map((place) => (
                <PlaceCard key={place.id} place={place} layout="grid" />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
