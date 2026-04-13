"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/app-shell";
import PlaceCard from "@/components/cards/place-card";
import { SearchIcon, XIcon } from "@/components/ui/icons";

// Top districts for hub link cross-linking — drives crawlable internal links
const HUB_LINKS = [
  { district: "kathmandu",  type: "attraction", label: "Attractions in Kathmandu",   emoji: "🏛️" },
  { district: "kathmandu",  type: "restaurant", label: "Restaurants in Kathmandu",   emoji: "🍽️" },
  { district: "pokhara",    type: "attraction", label: "Attractions in Pokhara",     emoji: "⛰️" },
  { district: "pokhara",    type: "hotel",      label: "Hotels in Pokhara",          emoji: "🏨" },
  { district: "chitwan",    type: "attraction", label: "Attractions in Chitwan",     emoji: "🐘" },
  { district: "lalitpur",   type: "food",       label: "Local Food in Lalitpur",     emoji: "🍜" },
  { district: "bhaktapur",  type: "attraction", label: "Attractions in Bhaktapur",   emoji: "🏯" },
  { district: "mustang",    type: "stay",       label: "Local Stays in Mustang",     emoji: "🏠" },
];

const PAGE_SIZE = 10;

const CATEGORIES = ["All", "Tourist Attraction", "Local Food", "Restaurant", "Hotel", "Local Stay"];

const CAT_DB_VALUES = {
  "Tourist Attraction": "attraction",
  "Local Food": "food",
  Restaurant: "restaurant",
  Hotel: "hotel",
  "Local Stay": "stay",
};

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
        activeCategory === "All" ||
        (place.category || "").toLowerCase() === (CAT_DB_VALUES[activeCategory] ?? activeCategory).toLowerCase();
      if (!matchesCategory) return false;
      if (!search) return true;
      return [place.name, place.location, place.description, place.category, place.districtId]
        .some((value) => String(value || "").toLowerCase().includes(search));
    });
  }, [places, search, activeCategory]);

  const visiblePlaces = useMemo(() => filteredPlaces.slice(0, visibleCount), [filteredPlaces, visibleCount]);
  const canLoadMore = visibleCount < filteredPlaces.length;

  function handleSearch(value) { setQuery(value); setVisibleCount(PAGE_SIZE); }
  function handleCategory(cat) { setActiveCategory(cat); setVisibleCount(PAGE_SIZE); }

  return (
    <AppShell>

      {/* ════════════════════════════════════════════════════════
          DESKTOP LAYOUT
      ════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block">
        {/* Header */}
        <div style={{
          background: "linear-gradient(105deg, #064e35 0%, #0a6644 45%, #059669 100%)",
          borderRadius: 24, padding: "36px 40px",
          position: "relative", overflow: "hidden", marginBottom: 32,
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>Nepal · All Places</p>
              <h1 style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.025em", marginBottom: 8 }}>
                Best <span style={{ color: "#86efac" }}>Places</span> to Visit
              </h1>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.6, maxWidth: 400 }}>
                Tourist spots, local food, hotels &amp; hidden gems across all 77 districts.
              </p>
            </div>
            {/* Search inline */}
            <div style={{ width: 360, flexShrink: 0 }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", display: "flex", pointerEvents: "none", zIndex: 1 }}>
                  <SearchIcon style={{ width: 16, height: 16, color: "#6b7280" }} />
                </span>
                <input
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search places, locations..."
                  aria-label="Search places"
                  style={{ width: "100%", padding: "14px 40px 14px 44px", borderRadius: 16, border: "none", background: "rgba(255,255,255,0.95)", fontSize: 14, color: "#0f172a", outline: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.2)", boxSizing: "border-box" }}
                />
                {query ? (
                  <button type="button" onClick={() => handleSearch("")} aria-label="Clear search"
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "#e2e8f0", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
                    <XIcon style={{ width: 12, height: 12, color: "#64748b" }} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column: sidebar filter + results */}
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>

          {/* ── Category sidebar ──────────────────────────────── */}
          <div style={{ width: 200, flexShrink: 0, position: "sticky", top: 24 }}>
            <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
              <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6b7280" }}>Category</p>
              </div>
              {CATEGORIES.map((cat, i) => {
                const active = activeCategory === cat;
                const count = cat === "All" ? places.length : places.filter((p) =>
                  (p.category || "").toLowerCase() === (CAT_DB_VALUES[cat] ?? cat).toLowerCase()
                ).length;
                return (
                  <button key={cat} type="button" onClick={() => handleCategory(cat)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "none", borderBottom: i < CATEGORIES.length - 1 ? "1px solid #f8fafc" : "none", background: active ? "linear-gradient(90deg, rgba(5,150,105,0.08), rgba(5,150,105,0.03))" : "transparent", cursor: "pointer", textAlign: "left", borderLeft: active ? "3px solid #059669" : "3px solid transparent", transition: "all 0.15s" }}>
                    <span style={{ fontSize: 14 }}>{CAT_EMOJIS[cat]}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#059669" : "#475569" }}>{cat}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#059669" : "#6b7280", background: active ? "#ecfdf5" : "#f1f5f9", borderRadius: 999, padding: "2px 7px" }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Hub links — popular district+category combos, crawlable by Google */}
            <div style={{ marginTop: 16, background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
              <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6b7280" }}>Popular Searches</p>
              </div>
              {HUB_LINKS.map(({ district, type, label, emoji }) => (
                <Link
                  key={`${district}-${type}`}
                  href={`/places/${district}/${type}`}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", textDecoration: "none", borderBottom: "1px solid #f8fafc", fontSize: 12, fontWeight: 500, color: "#475569" }}
                >
                  <span style={{ fontSize: 13 }}>{emoji}</span>
                  <span style={{ flex: 1, lineHeight: 1.3 }}>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Results ────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <p style={{ fontSize: 14, color: "#64748b" }}>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>{filteredPlaces.length}</span>
                {" "}place{filteredPlaces.length !== 1 ? "s" : ""}
                {search ? ` for "${deferredQuery.trim()}"` : activeCategory !== "All" ? ` · ${activeCategory}` : ""}
              </p>
            </div>

            {filteredPlaces.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>No places found</p>
                <p style={{ fontSize: 14, color: "#6b7280" }}>Try a different search or category</p>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                  {visiblePlaces.map((place, i) => (
                    <PlaceCard key={place.id} place={place} layout="grid" imagePriority={i < 2} />
                  ))}
                </div>
                {canLoadMore && (
                  <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
                    <button type="button" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      style={{ background: "#fff", color: "#059669", border: "1.5px solid #d1fae5", borderRadius: 999, padding: "12px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(5,150,105,0.12)" }}>
                      Load more · {filteredPlaces.length - visibleCount} left
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          MOBILE LAYOUT — untouched
      ════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        <div style={{ background: "linear-gradient(160deg, #064e35 0%, #0a6644 50%, #059669 100%)", margin: "-24px -1px 0", padding: "28px 20px 32px", borderRadius: "0 0 32px 32px", position: "relative", overflow: "hidden" }} className="fade-up">
          <div style={{ position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Nepal · All Places</p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 6, letterSpacing: "-0.02em" }}>
              Best <span style={{ color: "#86efac" }}>Places</span> to Visit
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 20, maxWidth: 300 }}>
              Tourist spots, local food, hotels &amp; hidden gems across all 77 districts.
            </p>
            <div style={{ position: "relative", width: "100%" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1 }}>
                <SearchIcon style={{ width: 16, height: 16, color: "#6b7280" }} />
              </span>
              <input value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="Search places, locations, categories..."
                aria-label="Search places"
                style={{ width: "100%", padding: "13px 40px 13px 42px", borderRadius: 14, border: "none", background: "rgba(255,255,255,0.95)", fontSize: 14, color: "#0f172a", outline: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", boxSizing: "border-box" }} />
              {query ? (
                <button type="button" onClick={() => handleSearch("")} aria-label="Clear search"
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "#e2e8f0", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
                  <XIcon style={{ width: 12, height: 12, color: "#64748b" }} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="fade-up-1" style={{ padding: "16px 20px 0", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 8, paddingBottom: 2, minWidth: "max-content" }}>
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button key={cat} type="button" onClick={() => handleCategory(cat)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 999, border: active ? "none" : "1.5px solid #e2e8f0", background: active ? "#059669" : "#fff", color: active ? "#fff" : "#64748b", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", boxShadow: active ? "0 4px 14px rgba(5,150,105,0.3)" : "none", transition: "all 0.15s ease" }}>
                  <span>{CAT_EMOJIS[cat]}</span>{cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="fade-up-1" style={{ padding: "12px 20px 0" }}>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>{filteredPlaces.length}</span>
            {" "}place{filteredPlaces.length !== 1 ? "s" : ""}
            {search ? ` for "${deferredQuery.trim()}"` : activeCategory !== "All" ? ` · ${activeCategory}` : ""}
          </p>
        </div>

        <div style={{ padding: "12px 20px 24px" }} className="fade-up-2">
          {filteredPlaces.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", background: "#fff", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>🔍</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>No places found</p>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Try a different search or category</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {visiblePlaces.map((place, index) => (
                  <PlaceCard key={place.id} place={place} imagePriority={index === 0} />
                ))}
              </div>
              {canLoadMore && (
                <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                  <button type="button" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    style={{ background: "#fff", color: "#059669", border: "1.5px solid #d1fae5", borderRadius: 999, padding: "11px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(5,150,105,0.12)" }}>
                    Load more · {filteredPlaces.length - visibleCount} left
                  </button>
                </div>
              )}
            </>
          )}
        {/* Hub links — mobile, crawlable by Google */}
        <nav aria-label="Popular searches" style={{ padding: "16px 20px 8px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6b7280", marginBottom: 10 }}>Popular Searches</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {HUB_LINKS.map(({ district, type, label, emoji }) => (
              <Link
                key={`${district}-${type}`}
                href={`/places/${district}/${type}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 999, padding: "5px 10px", textDecoration: "none" }}
              >
                <span>{emoji}</span>{label}
              </Link>
            ))}
          </div>
        </nav>
        </div>
      </div>

    </AppShell>
  );
}
