"use client";

import { useDeferredValue, useMemo, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import PlaceCard from "@/components/cards/place-card";
import { SearchIcon, XIcon } from "@/components/ui/icons";

const PAGE_SIZE = 10;

const CATEGORIES = ["All", "Tourist Attraction", "Local Food", "Restaurant", "Hotel", "Local Stay"];

const CAT_EMOJIS = {
  All: "🗺️",
  "Tourist Attraction": "🏛️",
  "Local Food": "🍜",
  Restaurant: "🍽️",
  Hotel: "🏨",
  "Local Stay": "🏡",
};

export default function AllPlacesPageClient({ places = [] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query);
  const search = deferredQuery.trim().toLowerCase();

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesCategory =
        activeCategory === "All" || place.category === activeCategory;
      if (!matchesCategory) return false;
      if (!search) return true;
      return [place.name, place.location, place.description, place.category, place.districtId]
        .some((value) => String(value || "").toLowerCase().includes(search));
    });
  }, [places, search, activeCategory]);

  const visiblePlaces = useMemo(
    () => filteredPlaces.slice(0, visibleCount),
    [filteredPlaces, visibleCount]
  );

  const canLoadMore = visibleCount < filteredPlaces.length;

  function handleSearch(value) {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleCategory(cat) {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <AppShell>
      {/* ── HEADER ──────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(160deg, #064e35 0%, #0a6644 50%, #059669 100%)",
          margin: "-24px -1px 0",
          padding: "28px 20px 32px",
          borderRadius: "0 0 32px 32px",
          position: "relative",
          overflow: "hidden",
        }}
        className="fade-up"
      >
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
            Nepal · All Places
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 6, letterSpacing: "-0.02em" }}>
            Best <span style={{ color: "#86efac" }}>Places</span> to Visit
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 20, maxWidth: 300 }}>
            Tourist spots, local food, hotels &amp; hidden gems across all 77 districts.
          </p>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <SearchIcon
              className="pointer-events-none"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#94a3b8" }}
            />
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search places, locations, categories..."
              style={{
                width: "100%",
                padding: "13px 40px 13px 42px",
                borderRadius: 14,
                border: "none",
                background: "rgba(255,255,255,0.95)",
                fontSize: 14,
                color: "#0f172a",
                outline: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                boxSizing: "border-box",
              }}
            />
            {query ? (
              <button
                type="button"
                onClick={() => handleSearch("")}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "#e2e8f0", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}
              >
                <XIcon style={{ width: 12, height: 12, color: "#64748b" }} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── CATEGORY TABS ────────────────────────────────────── */}
      <div className="fade-up-1" style={{ padding: "16px 20px 0", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 8, paddingBottom: 2, minWidth: "max-content" }}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategory(cat)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: active ? "none" : "1.5px solid #e2e8f0",
                  background: active ? "#059669" : "#fff",
                  color: active ? "#fff" : "#64748b",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: active ? "0 4px 14px rgba(5,150,105,0.3)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{CAT_EMOJIS[cat]}</span>
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TOOLBAR ─────────────────────────────────────────── */}
      <div className="fade-up-1" style={{ padding: "12px 20px 0" }}>
        <p style={{ fontSize: 13, color: "#64748b" }}>
          <span style={{ fontWeight: 700, color: "#0f172a" }}>{filteredPlaces.length}</span>
          {" "}place{filteredPlaces.length !== 1 ? "s" : ""}
          {search ? ` for "${deferredQuery.trim()}"` : activeCategory !== "All" ? ` · ${activeCategory}` : ""}
        </p>
      </div>

      {/* ── PLACE LIST ──────────────────────────────────────── */}
      <div style={{ padding: "12px 20px 24px" }} className="fade-up-2">
        {filteredPlaces.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", background: "#fff", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
            <p style={{ fontSize: 32, marginBottom: 10 }}>🔍</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>No places found</p>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Try a different search or category</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visiblePlaces.map((place, index) => (
                <PlaceCard key={place.id} place={place} imagePriority={index === 0} />
              ))}
            </div>

            {canLoadMore ? (
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  style={{
                    background: "#fff",
                    color: "#059669",
                    border: "1.5px solid #d1fae5",
                    borderRadius: 999,
                    padding: "11px 28px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(5,150,105,0.12)",
                  }}
                >
                  Load more · {filteredPlaces.length - visibleCount} left
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  );
}
