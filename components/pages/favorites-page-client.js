"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/app-shell";
import PlaceCard from "@/components/cards/place-card";
import DistrictCard from "@/components/cards/district-card";
import { useFavorites } from "@/context/favorites-context";

const TABS = ["All", "Places", "Districts"];

export default function FavoritesPageClient({
  initialFavoritePlaces = [],
  initialFavoriteDistricts = [],
  initialSuggestions = [],
}) {
  const { favorites, loaded } = useFavorites();
  // Pool of all place/district data objects we have loaded.
  // Initialized from SSR; grows only when newly-favorited items need data fetched.
  const [allPlaces, setAllPlaces] = useState(initialFavoritePlaces);
  const [allDistricts, setAllDistricts] = useState(initialFavoriteDistricts);
  const [suggestions] = useState(initialSuggestions);
  const [activeTab, setActiveTab] = useState("All");

  // Derived lists — filtered by context immediately once the context has loaded.
  // Before loaded: show the full server-provided data (no flash of empty state).
  const favPlaces = loaded
    ? allPlaces.filter((p) => favorites.includes(p.id))
    : allPlaces;
  const favDistricts = loaded
    ? allDistricts.filter((d) => favorites.includes(`district:${d.id}`))
    : allDistricts;

  // Track previous favorites to detect additions (removals are handled by filtering above).
  // null = "not yet initialized after first load"
  const prevFavoritesRef = useRef(null);

  useEffect(() => {
    if (!loaded) return;

    // On first run after load, seed prevFavoritesRef with the current server-loaded favorites
    // so we don't treat every item as "newly added".
    if (prevFavoritesRef.current === null) {
      prevFavoritesRef.current = favorites;
      return;
    }

    const prev = prevFavoritesRef.current;
    prevFavoritesRef.current = favorites;

    // Find IDs that were just added to favorites
    const addedIds = favorites.filter((id) => !prev.includes(id));
    if (addedIds.length === 0) return;

    // Check if we already have data for all added items
    const missingPlaces = addedIds.filter(
      (id) => !id.startsWith("district:") && !allPlaces.some((p) => p.id === id)
    );
    const missingDistricts = addedIds
      .filter((id) => id.startsWith("district:"))
      .map((id) => id.replace("district:", ""))
      .filter((slug) => !allDistricts.some((d) => d.id === slug));

    if (missingPlaces.length === 0 && missingDistricts.length === 0) return;

    // Try filling missing places from the suggestions pool first (no extra API call)
    const fromSuggestions = missingPlaces
      .map((slug) => suggestions.find((s) => s.id === slug))
      .filter(Boolean);
    if (fromSuggestions.length > 0) {
      setAllPlaces((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        return [...prev, ...fromSuggestions.filter((p) => !existing.has(p.id))];
      });
    }

    // If any items still have no data, fetch the full favorites list from the API
    const stillMissing = missingPlaces.filter(
      (slug) => !fromSuggestions.some((p) => p.id === slug)
    );
    if (stillMissing.length > 0 || missingDistricts.length > 0) {
      let cancelled = false;
      fetch("/api/favorites", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          if (data.favoritePlaces) setAllPlaces(data.favoritePlaces);
          if (data.favoriteDistricts) setAllDistricts(data.favoriteDistricts);
        })
        .catch(() => {});
      return () => { cancelled = true; };
    }
  }, [favorites, loaded]);

  const totalSaved = favPlaces.length + favDistricts.length;
  const showDistricts = activeTab === "All" || activeTab === "Districts";
  const showPlaces = activeTab === "All" || activeTab === "Places";

  return (
    <AppShell>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #064e35 0%, #0a6644 50%, #059669 100%)",
        margin: "-24px -1px 0",
        padding: "28px 20px 32px",
        borderRadius: "0 0 32px 32px",
        position: "relative",
        overflow: "hidden",
      }} className="fade-up">
        <div style={{ position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Personal</p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 6, letterSpacing: "-0.02em" }}>
            My <span style={{ color: "#86efac" }}>Favorites</span> ❤️
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            {totalSaved > 0
              ? `${totalSaved} saved item${totalSaved !== 1 ? "s" : ""} · ${favPlaces.length} place${favPlaces.length !== 1 ? "s" : ""} · ${favDistricts.length} district${favDistricts.length !== 1 ? "s" : ""}`
              : "Your personal Nepal travel shortlist"}
          </p>
        </div>
      </div>

      {totalSaved > 0 ? (
        <>
          {/* ── STATS ROW ──────────────────────────────────── */}
          <div className="fade-up-1" style={{ display: "flex", gap: 10, padding: "16px 20px 0" }}>
            {[
              { value: String(totalSaved), label: "Saved" },
              { value: String(favPlaces.length), label: "Places" },
              { value: String(favDistricts.length), label: "Districts" },
            ].map(({ value, label }) => (
              <div key={label} style={{ flex: 1, background: "#fff", borderRadius: 14, padding: "12px 8px", textAlign: "center", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#059669", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── TAB FILTER ─────────────────────────────────── */}
          <div className="fade-up-1 scrollbar-hide" style={{ display: "flex", gap: 8, padding: "14px 20px 0", overflowX: "auto" }}>
            {TABS.map((tab) => {
              const active = activeTab === tab;
              const count = tab === "All" ? totalSaved : tab === "Places" ? favPlaces.length : favDistricts.length;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 999,
                    padding: "8px 16px",
                    border: active ? "none" : "1.5px solid #e2e8f0",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    background: active ? "#059669" : "#fff",
                    color: active ? "#fff" : "#475569",
                    boxShadow: active ? "0 4px 14px rgba(5,150,105,0.3)" : "0 1px 4px rgba(15,23,42,0.06)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab}
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    background: active ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                    color: active ? "#fff" : "#64748b",
                    borderRadius: 999,
                    padding: "1px 7px",
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── CONTENT ────────────────────────────────────── */}
          <div className="fade-up-2" style={{ padding: "20px 20px 16px", display: "flex", flexDirection: "column", gap: 28 }}>
            {showDistricts && favDistricts.length > 0 ? (
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                    🗺️
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
                    Saved Districts
                    <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: 999, padding: "2px 8px" }}>
                      {favDistricts.length}
                    </span>
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {favDistricts.map((district) => (
                    <DistrictCard key={district.id} district={district} />
                  ))}
                </div>
              </section>
            ) : null}

            {showPlaces && favPlaces.length > 0 ? (
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                    📍
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
                    Saved Places
                    <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: "#059669", background: "#ecfdf5", borderRadius: 999, padding: "2px 8px" }}>
                      {favPlaces.length}
                    </span>
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {favPlaces.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              </section>
            ) : null}

            {/* Empty state for filtered tab */}
            {((activeTab === "Places" && favPlaces.length === 0) || (activeTab === "Districts" && favDistricts.length === 0)) ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 20, border: "1.5px dashed #e2e8f0" }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>{activeTab === "Places" ? "📍" : "🗺️"}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>No saved {activeTab.toLowerCase()} yet</p>
                <p style={{ fontSize: 13, color: "#94a3b8" }}>Tap the heart icon to save {activeTab.toLowerCase()}.</p>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        /* ── EMPTY STATE ───────────────────────────────────── */
        <div className="fade-up-1" style={{ padding: "20px 20px 16px" }}>
          <div style={{
            background: "#fff",
            borderRadius: 24,
            border: "1.5px solid #e2e8f0",
            padding: "48px 24px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 14, lineHeight: 1 }}>🗺️</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginBottom: 8, letterSpacing: "-0.02em" }}>
              No saved items yet
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, maxWidth: 280, margin: "0 auto 24px" }}>
              Tap the ❤️ on any place or district to save it here and build your personal Nepal itinerary.
            </p>
            <Link
              href="/districts"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                color: "#fff",
                borderRadius: 999,
                padding: "12px 28px",
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(5,150,105,0.3)",
              }}
            >
              Start Exploring →
            </Link>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 ? (
            <div style={{ marginTop: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #fef9c3, #fde68a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                  ⭐
                </div>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Popular to Save</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {suggestions.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
