"use client";

import { useDeferredValue, useMemo, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import PlaceCard from "@/components/cards/place-card";
import { SearchIcon } from "@/components/ui/icons";

const PAGE_SIZE = 10;

export default function AllPlacesPageClient({ places = [] }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query);
  const search = deferredQuery.trim().toLowerCase();

  const filteredPlaces = useMemo(
    () =>
      places.filter((place) => {
        if (!search) return true;

        return [place.name, place.location, place.description, place.category, place.districtId]
          .some((value) => String(value || "").toLowerCase().includes(search));
      }),
    [places, search]
  );

  const visiblePlaces = useMemo(
    () => filteredPlaces.slice(0, visibleCount),
    [filteredPlaces, visibleCount]
  );

  const canLoadMore = visibleCount < filteredPlaces.length;

  return (
    <AppShell>
      <div style={{ padding: "24px 20px 0" }} className="fade-up">
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--jade)", marginBottom: 4 }}>
          Place Directory
        </div>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.1, marginBottom: 6 }}>
          All Recent Places
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 16 }}>
          Browse the latest approved places added across Nepal.
        </p>

        <label style={{ position: "relative", display: "block" }}>
          <SearchIcon className="pointer-events-none absolute left-[14px] top-1/2 size-4 -translate-y-1/2 text-[var(--ink-faint)]" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Search places, locations, categories..."
            style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-strong)", background: "var(--bg-card)", fontSize: 14, color: "var(--ink)", outline: "none" }}
          />
        </label>

        <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 10, marginBottom: 20 }}>
          Showing {filteredPlaces.length} place{filteredPlaces.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div style={{ padding: "0 20px 16px" }} className="fade-up-1">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visiblePlaces.map((place, index) => (
            <PlaceCard key={place.id} place={place} imagePriority={index === 0} />
          ))}
        </div>

        {canLoadMore ? (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
              style={{
                border: "1px solid rgba(15, 23, 42, 0.08)",
                background: "#fff",
                color: "var(--jade)",
                borderRadius: 999,
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: 700,
                boxShadow: "var(--shadow-sm)",
                cursor: "pointer",
              }}
            >
              Load more
            </button>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
